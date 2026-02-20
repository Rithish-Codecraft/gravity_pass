"""
ml/face_engine.py
=================
Face Recognition engine using the `face_recognition` library (dlib).

Workflow:
  1. REGISTER  — capture image, extract 128-D embedding, store in DB
  2. RECOGNISE — compare live image embedding against stored embeddings
  3. MARK      — if match found and not already marked today → INSERT attendance
"""

import os, pickle, datetime
import numpy as np
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from config import Config

# Try to import face_recognition (requires dlib, may not be available in all envs)
try:
    import face_recognition
    FACE_AVAILABLE = True
except ImportError:
    FACE_AVAILABLE = False
    print("[FaceEngine] WARNING: face_recognition not installed. Face features disabled.")

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False


def _load_embeddings() -> dict:
    """Load {student_id: embedding_array} from pickle file."""
    if os.path.exists(Config.EMBEDDINGS_FILE):
        with open(Config.EMBEDDINGS_FILE, 'rb') as f:
            return pickle.load(f)
    return {}


def _save_embeddings(db: dict):
    os.makedirs(os.path.dirname(Config.EMBEDDINGS_FILE), exist_ok=True)
    with open(Config.EMBEDDINGS_FILE, 'wb') as f:
        pickle.dump(db, f)


def register_face(student_id: int, image_bytes: bytes, db_execute_fn) -> dict:
    """
    Register a student's face from raw image bytes.
    Returns {'success': bool, 'message': str}
    """
    if not FACE_AVAILABLE:
        return {'success': False, 'message': 'face_recognition library not installed on server'}

    import numpy as np
    img_array = np.frombuffer(image_bytes, dtype=np.uint8)
    img       = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    rgb       = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    locs = face_recognition.face_locations(rgb, model='hog')
    if not locs:
        return {'success': False, 'message': 'No face detected in the image. Try better lighting.'}
    if len(locs) > 1:
        return {'success': False, 'message': 'Multiple faces detected. Please provide a single face image.'}

    embedding = face_recognition.face_encodings(rgb, locs)[0]

    # Persist embedding in in-memory pkl store
    db = _load_embeddings()
    db[student_id] = embedding
    _save_embeddings(db)

    # Save image path
    img_path = os.path.join(Config.FACE_DATA_DIR, f'student_{student_id}.jpg')
    cv2.imwrite(img_path, img)

    # DB record
    db_execute_fn("""
        INSERT INTO face_embeddings (student_id, embedding, image_path)
        VALUES (?, ?, ?)
        ON CONFLICT(student_id) DO UPDATE SET embedding=excluded.embedding, image_path=excluded.image_path
    """, (student_id, pickle.dumps(embedding), img_path))

    return {'success': True, 'message': f'Face registered for student_id {student_id}'}


def recognize_and_mark(image_bytes: bytes, subject: str,
                       db_execute_fn, db_query_fn) -> dict:
    """
    Recognise face in image and mark attendance if not already marked today.
    Returns match info dict.
    """
    if not FACE_AVAILABLE:
        return {'success': False, 'message': 'face_recognition not installed', 'student': None}

    embeddings_db = _load_embeddings()
    if not embeddings_db:
        return {'success': False, 'message': 'No faces registered yet. Ask staff to register students first.', 'student': None}

    img_array = np.frombuffer(image_bytes, dtype=np.uint8)
    img       = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    rgb       = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    locs = face_recognition.face_locations(rgb, model='hog')
    if not locs:
        return {'success': False, 'message': 'No face detected', 'student': None}

    live_enc   = face_recognition.face_encodings(rgb, locs)[0]
    known_ids  = list(embeddings_db.keys())
    known_encs = list(embeddings_db.values())

    distances = face_recognition.face_distance(known_encs, live_enc)
    best_idx  = int(np.argmin(distances))
    best_dist = float(distances[best_idx])

    THRESHOLD = 0.55   # lower = stricter
    if best_dist > THRESHOLD:
        return {'success': False, 'message': f'Face not recognised (dist={best_dist:.3f})', 'student': None}

    student_id   = known_ids[best_idx]
    today_str    = datetime.date.today().isoformat()

    # Check for duplicate attendance today
    existing = db_query_fn("""
        SELECT id FROM attendance
        WHERE student_id=? AND subject=? AND date=?
    """, (student_id, subject, today_str))

    if existing:
        student_info = db_query_fn("""
            SELECT u.name FROM students s JOIN users u ON u.id=s.user_id WHERE s.id=?
        """, (student_id,), one=True)
        return {
            'success': True,
            'already_marked': True,
            'message': f'{student_info["name"] if student_info else "Student"} already marked present today',
            'student_id': student_id,
            'confidence': round(1 - best_dist, 4),
        }

    # Mark attendance
    db_execute_fn("""
        INSERT INTO attendance (student_id, subject, date, status)
        VALUES (?, ?, ?, 'present')
    """, (student_id, subject, today_str))

    student_info = db_query_fn("""
        SELECT u.name, s.roll_no FROM students s JOIN users u ON u.id=s.user_id WHERE s.id=?
    """, (student_id,), one=True)

    return {
        'success':       True,
        'already_marked': False,
        'message':       f'Attendance marked for {student_info["name"] if student_info else f"student_{student_id}"}',
        'student_id':    student_id,
        'student_name':  student_info['name'] if student_info else None,
        'roll_no':       student_info['roll_no'] if student_info else None,
        'confidence':    round(1 - best_dist, 4),
    }


def get_registered_count() -> int:
    """Return how many students have registered faces."""
    return len(_load_embeddings())
