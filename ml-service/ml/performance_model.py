"""
ml/performance_model.py
=======================
Random Forest model to predict whether a student will PASS or FAIL
based on:
  - Internal marks average
  - External marks average
  - Attendance percentage
  - Backlog count
  - CGPA
  - Semester

Output:
  - pass_probability  (0.0 – 1.0)
  - risk_level        (Low / Medium / High)
  - feature_importance dict
"""

import os, pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from config import Config


# ─── Feature definition ──────────────────────────────────────────────────────
FEATURES = ['internal_avg', 'external_avg', 'attendance_pct', 'backlog_count', 'cgpa', 'semester']
TARGET   = 'passed'   # 1 = pass, 0 = fail/backlog


def _build_pipeline() -> Pipeline:
    """Return an sklearn Pipeline (scaler + RandomForest)."""
    return Pipeline([
        ('scaler', StandardScaler()),
        ('clf',    RandomForestClassifier(
            n_estimators=200,
            max_depth=8,
            min_samples_split=4,
            random_state=42,
            class_weight='balanced',
        ))
    ])


def train(df: pd.DataFrame) -> dict:
    """
    Train on the given DataFrame and persist model to disk.
    Returns evaluation metrics.
    """
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipe = _build_pipeline()
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)

    # Save
    os.makedirs(Config.MODELS_DIR, exist_ok=True)
    with open(Config.PERFORMANCE_MODEL, 'wb') as f:
        pickle.dump(pipe, f)

    # Feature importances from the RF clf
    importances = dict(zip(
        FEATURES,
        pipe.named_steps['clf'].feature_importances_.tolist()
    ))

    print(f"[PerformanceModel] Accuracy: {acc:.3f}")
    return {'accuracy': round(acc, 4), 'report': report, 'feature_importances': importances}


def predict(internal_avg: float, external_avg: float,
            attendance_pct: float, backlog_count: int,
            cgpa: float, semester: int) -> dict:
    """
    Predict pass probability for a single student.
    Returns:
        { pass_probability, risk_level, features_used }
    """
    if not os.path.exists(Config.PERFORMANCE_MODEL):
        # Return sensible defaults if model hasn't been trained yet
        prob = min(cgpa / 10.0, 0.99)
        risk = 'High' if attendance_pct < 75 or cgpa < 6.5 else 'Medium' if cgpa < 7.5 else 'Low'
        return {'pass_probability': round(prob, 3), 'risk_level': risk, 'trained': False}

    with open(Config.PERFORMANCE_MODEL, 'rb') as f:
        pipe = pickle.load(f)

    X = pd.DataFrame([{
        'internal_avg':    internal_avg,
        'external_avg':    external_avg,
        'attendance_pct':  attendance_pct,
        'backlog_count':   backlog_count,
        'cgpa':            cgpa,
        'semester':        semester,
    }])

    proba = pipe.predict_proba(X)[0]
    # proba[1] = probability of class 1 (pass)
    pass_prob = float(proba[1])

    # Risk levels
    if pass_prob >= 0.75:
        risk = 'Low'
    elif pass_prob >= 0.50:
        risk = 'Medium'
    else:
        risk = 'High'

    return {
        'pass_probability': round(pass_prob, 4),
        'risk_level':       risk,
        'trained':          True,
        'features_used':    FEATURES,
    }


def batch_predict_from_db(db_query_fn) -> list:
    """
    Run predictions for all students in the DB.
    `db_query_fn` should return a list of student dicts.
    Returns list of {student_id, pass_probability, risk_level}.
    """
    students = db_query_fn("""
        SELECT
            s.id as student_id,
            s.cgpa,
            s.semester,
            COALESCE((SELECT AVG(r.internal) FROM results r WHERE r.student_id=s.id), 40) as internal_avg,
            COALESCE((SELECT AVG(r.external) FROM results r WHERE r.student_id=s.id), 70) as external_avg,
            COALESCE((
                SELECT 100.0*SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)/COUNT(*)
                FROM attendance a WHERE a.student_id=s.id
            ), 80) as attendance_pct,
            COALESCE((SELECT COUNT(*) FROM results r WHERE r.student_id=s.id AND r.grade IN ('D','F')), 0) as backlog_count
        FROM students s
    """)
    results = []
    for st in students:
        pred = predict(
            internal_avg   = st['internal_avg'],
            external_avg   = st['external_avg'],
            attendance_pct = st['attendance_pct'],
            backlog_count  = st['backlog_count'],
            cgpa           = st['cgpa'],
            semester       = st['semester'],
        )
        results.append({'student_id': st['student_id'], **pred})
    return results
