"""
ml/placement_model.py
=====================
Gradient Boosted / Random Forest model to predict placement probability.

Features:
  - cgpa
  - internship_count
  - project_count
  - skills_count         (number of skills listed)
  - communication_score  (0-10, from feedback avg)
  - backlog_count
  - attendance_pct

Output:
  - placement_probability  (0.0 – 1.0)
  - confidence_level       (Low / Medium / High)
  - top_skills             (from NLP resume analyzer)
"""

import os, pickle, re
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from config import Config


FEATURES = [
    'cgpa', 'internship_count', 'project_count',
    'skills_count', 'communication_score',
    'backlog_count', 'attendance_pct'
]
TARGET = 'placed'   # 1 = placed, 0 = not placed


# ─── Resume NLP ──────────────────────────────────────────────────────────────

TECH_KEYWORDS = [
    'python','java','javascript','react','nodejs','flask','django','machine learning',
    'deep learning','tensorflow','pytorch','sql','mysql','postgresql','mongodb',
    'docker','kubernetes','aws','azure','git','linux','html','css','typescript',
    'tableau','power bi','data analysis','nlp','computer vision','opencv',
    'scikit-learn','pandas','numpy','spark','hadoop','rest api','microservices',
]

SOFT_KEYWORDS = [
    'leadership','communication','teamwork','problem solving','critical thinking',
    'project management','agile','scrum','presentation','negotiation',
]


def analyze_resume(text: str) -> dict:
    """
    Simple NLP keyword extractor for resumes.
    Returns list of found keywords and a score (0-100).
    """
    text_lower = text.lower()
    found_tech  = [kw for kw in TECH_KEYWORDS  if kw in text_lower]
    found_soft  = [kw for kw in SOFT_KEYWORDS  if kw in text_lower]
    all_found   = found_tech + found_soft
    score = min(100, round(
        (len(found_tech) / len(TECH_KEYWORDS) * 70) +
        (len(found_soft) / len(SOFT_KEYWORDS) * 30),
        2
    ))
    return {
        'tech_keywords':   found_tech,
        'soft_keywords':   found_soft,
        'all_keywords':    all_found,
        'keyword_score':   score,
        'total_keywords':  len(all_found),
        'missing_top':     [kw for kw in TECH_KEYWORDS[:10] if kw not in text_lower],
    }


# ─── Company Statistics (static mapping, extendable via DB) ──────────────────

COMPANY_CTC_AVG = {
    'TCS': 3.5, 'Infosys': 4.0, 'Wipro': 3.8, 'Cognizant': 4.2,
    'Accenture': 4.5, 'Capgemini': 4.0, 'HCL': 3.6, 'Tech Mahindra': 3.9,
    'Zoho': 5.0, 'Amazon': 14.0, 'Google': 20.0, 'Microsoft': 18.0,
    'Fresher (Unplaced)': 0,
}


def get_company_stats(db_query_fn) -> list:
    """Query placement records and return company statistics."""
    rows = db_query_fn("""
        SELECT company, COUNT(*) as count,
               AVG(package) as avg_package,
               MAX(package) as max_package
        FROM placements
        GROUP BY company
        ORDER BY count DESC
    """)
    return rows


# ─── Model Training ──────────────────────────────────────────────────────────

def _build_pipeline() -> Pipeline:
    return Pipeline([
        ('scaler', StandardScaler()),
        ('clf', GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=4,
            random_state=42,
        ))
    ])


def train(df: pd.DataFrame) -> dict:
    """Train on placement dataset and save model."""
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipe = _build_pipeline()
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)

    os.makedirs(Config.MODELS_DIR, exist_ok=True)
    with open(Config.PLACEMENT_MODEL, 'wb') as f:
        pickle.dump(pipe, f)

    print(f"[PlacementModel] Accuracy: {acc:.3f}")
    return {'accuracy': round(acc, 4), 'report': classification_report(y_test, y_pred, output_dict=True)}


def predict(cgpa: float, internship_count: int, project_count: int,
            skills_count: int, communication_score: float,
            backlog_count: int, attendance_pct: float) -> dict:
    """Predict placement probability for a single student."""

    if not os.path.exists(Config.PLACEMENT_MODEL):
        # Heuristic fallback before training
        score = (cgpa * 0.35 + min(internship_count * 0.15, 0.3) +
                 min(project_count * 0.10, 0.2) + (attendance_pct / 100 * 0.10) +
                 (communication_score / 10 * 0.10))
        prob  = min(score / 1.0, 0.99)
        lvl   = 'High' if prob > 0.7 else 'Medium' if prob > 0.4 else 'Low'
        return {'placement_probability': round(prob, 4), 'confidence_level': lvl, 'trained': False}

    with open(Config.PLACEMENT_MODEL, 'rb') as f:
        pipe = pickle.load(f)

    X = pd.DataFrame([{
        'cgpa': cgpa, 'internship_count': internship_count,
        'project_count': project_count, 'skills_count': skills_count,
        'communication_score': communication_score,
        'backlog_count': backlog_count, 'attendance_pct': attendance_pct,
    }])

    proba = pipe.predict_proba(X)[0]
    prob  = float(proba[1])
    lvl   = 'High' if prob > 0.7 else 'Medium' if prob > 0.4 else 'Low'

    return {
        'placement_probability': round(prob, 4),
        'confidence_level':      lvl,
        'trained':               True,
    }
