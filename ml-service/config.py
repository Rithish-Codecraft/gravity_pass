"""
config.py — Central configuration for the Flask ML Service
"""
import os

class Config:
    # ── Database ────────────────────────────────────────────────────────────
    # Shared with the Express backend (same SQLite file)
    BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
    DB_PATH    = os.environ.get('DB_PATH', os.path.join(BASE_DIR, '..', 'server', 'edusphere.db'))

    # ── Face Recognition ────────────────────────────────────────────────────
    FACE_DATA_DIR   = os.path.join(BASE_DIR, 'face_data')   # raw face images
    EMBEDDINGS_FILE = os.path.join(BASE_DIR, 'face_data', 'embeddings.pkl')

    # ── ML Models ──────────────────────────────────────────────────────────
    MODELS_DIR          = os.path.join(BASE_DIR, 'trained_models')
    PERFORMANCE_MODEL   = os.path.join(MODELS_DIR, 'performance_model.pkl')
    PLACEMENT_MODEL     = os.path.join(MODELS_DIR, 'placement_model.pkl')
    PERFORMANCE_SCALER  = os.path.join(MODELS_DIR, 'performance_scaler.pkl')
    PLACEMENT_SCALER    = os.path.join(MODELS_DIR, 'placement_scaler.pkl')

    # ── Flask ───────────────────────────────────────────────────────────────
    SECRET_KEY = os.environ.get('ML_SECRET', 'edusphere_ml_secret_2026')
    DEBUG      = os.environ.get('DEBUG', 'False') == 'True'
    PORT       = int(os.environ.get('ML_PORT', 5000))

    # ── CORS ────────────────────────────────────────────────────────────────
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:4000').split(',')

    # ── Attendance Rules ────────────────────────────────────────────────────
    MIN_ATTENDANCE_PCT = 75   # Alert threshold


# Create directories on import
for d in [Config.FACE_DATA_DIR, Config.MODELS_DIR]:
    os.makedirs(d, exist_ok=True)
