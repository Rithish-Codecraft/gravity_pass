"""
scripts/generate_dataset.py
============================
Generates a synthetic training dataset for both ML models and saves
as CSV files that can be used to train models before real data exists.

Usage:
    python scripts/generate_dataset.py

Outputs:
    data/performance_dataset.csv
    data/placement_dataset.csv
"""

import os, sys
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from config import Config

np.random.seed(42)
N = 1000  # number of synthetic student records

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(DATA_DIR, exist_ok=True)


def generate_performance_dataset() -> pd.DataFrame:
    """
    Columns: internal_avg, external_avg, attendance_pct,
             backlog_count, cgpa, semester, passed
    """
    cgpa        = np.random.normal(7.5, 1.2, N).clip(4.0, 10.0)
    internal    = np.random.normal(18, 4, N).clip(0, 25)
    external    = cgpa * 7.5 + np.random.normal(0, 5, N)
    external    = external.clip(0, 75)
    attendance  = np.random.normal(80, 12, N).clip(30, 100)
    backlogs    = np.random.poisson(0.4, N).clip(0, 8)
    semester    = np.random.randint(1, 9, N)

    # Label: passed if external >= 40 and no. of F-grades is 0
    # Probability influenced by all features
    prob_pass = (
        (external / 75)      * 0.35 +
        (cgpa / 10)          * 0.25 +
        (attendance / 100)   * 0.20 +
        (1 - backlogs / 8)   * 0.20
    ).clip(0.05, 0.99)
    passed = (np.random.rand(N) < prob_pass).astype(int)

    df = pd.DataFrame({
        'internal_avg':   internal.round(2),
        'external_avg':   external.round(2),
        'attendance_pct': attendance.round(2),
        'backlog_count':  backlogs,
        'cgpa':           cgpa.round(2),
        'semester':       semester,
        'passed':         passed,
    })
    path = os.path.join(DATA_DIR, 'performance_dataset.csv')
    df.to_csv(path, index=False)
    print(f"✅ Performance dataset saved → {path}  (n={len(df)}, pass_rate={df['passed'].mean():.2f})")
    return df


def generate_placement_dataset() -> pd.DataFrame:
    """
    Columns: cgpa, internship_count, project_count, skills_count,
             communication_score, backlog_count, attendance_pct, placed
    """
    cgpa         = np.random.normal(7.5, 1.2, N).clip(4.0, 10.0)
    internships  = np.random.randint(0, 4, N)
    projects     = np.random.randint(0, 7, N)
    skills       = np.random.randint(2, 15, N)
    comm_score   = np.random.normal(6.5, 1.5, N).clip(1, 10)
    backlogs     = np.random.poisson(0.4, N).clip(0, 8)
    attendance   = np.random.normal(80, 12, N).clip(30, 100)

    prob_placed = (
        (cgpa / 10)          * 0.35 +
        (internships.clip(0,3)/3) * 0.25 +
        (projects.clip(0,6)/6)    * 0.15 +
        (skills.clip(0,14)/14)    * 0.15 +
        (comm_score / 10)         * 0.10
    ).clip(0.05, 0.99)
    placed = (np.random.rand(N) < prob_placed).astype(int)

    df = pd.DataFrame({
        'cgpa':               cgpa.round(2),
        'internship_count':   internships,
        'project_count':      projects,
        'skills_count':       skills,
        'communication_score': comm_score.round(1),
        'backlog_count':      backlogs,
        'attendance_pct':     attendance.round(2),
        'placed':             placed,
    })
    path = os.path.join(DATA_DIR, 'placement_dataset.csv')
    df.to_csv(path, index=False)
    print(f"✅ Placement dataset saved → {path}  (n={len(df)}, placement_rate={df['placed'].mean():.2f})")
    return df


def train_from_csv():
    """Train both models from the generated CSV files."""
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
    from ml.performance_model import train as train_perf
    from ml.placement_model   import train as train_place

    perf_df  = pd.read_csv(os.path.join(DATA_DIR, 'performance_dataset.csv'))
    place_df = pd.read_csv(os.path.join(DATA_DIR, 'placement_dataset.csv'))

    print("\n🤖 Training performance model...")
    metrics_p = train_perf(perf_df)
    print(f"   Accuracy: {metrics_p['accuracy']}")

    print("🤖 Training placement model...")
    metrics_pl = train_place(place_df)
    print(f"   Accuracy: {metrics_pl['accuracy']}")
    print("\n✅ Both models trained and saved!")


if __name__ == '__main__':
    print("🎲 Generating synthetic datasets...")
    generate_performance_dataset()
    generate_placement_dataset()

    choice = input("\n🤖 Train ML models from generated data now? (y/n): ").strip().lower()
    if choice == 'y':
        train_from_csv()
