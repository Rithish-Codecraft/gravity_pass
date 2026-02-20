"""
app.py — Flask ML Service Entry Point
======================================
Starts on port 5000.  All routes are prefixed with /ml/.

Blueprints:
  /ml/face/*         → face recognition attendance
  /ml/attendance/*   → attendance export & summary   (also in face_attendance bp)
  /ml/analytics/*    → performance analytics + ML
  /ml/placement/*    → placement prediction + resume
  /ml/admin/*        → admin dashboard KPIs
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os, sys

# Ensure the ml-service directory is on the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from database import ensure_ml_tables

# ── Import blueprints ────────────────────────────────────────────────────────
from routes.face_attendance import bp as face_bp
from routes.analytics       import bp as analytics_bp
from routes.placement        import bp as placement_bp
from routes.admin_api        import bp as admin_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    # ── CORS ─────────────────────────────────────────────────────────────────
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

    # ── Ensure AI-specific DB tables exist ───────────────────────────────────
    ensure_ml_tables()

    # ── Register blueprints under /ml prefix ─────────────────────────────────
    app.register_blueprint(face_bp,      url_prefix='/ml')
    app.register_blueprint(analytics_bp, url_prefix='/ml')
    app.register_blueprint(placement_bp, url_prefix='/ml')
    app.register_blueprint(admin_bp,     url_prefix='/ml')

    # ── Health check ─────────────────────────────────────────────────────────
    @app.route('/ml/health')
    def health():
        import datetime
        # Check which optional libraries are available
        try:
            import face_recognition
            fr_ok = True
        except ImportError:
            fr_ok = False
        try:
            import cv2
            cv_ok = True
        except ImportError:
            cv_ok = False

        return jsonify({
            'status':             'ok',
            'service':            'EduSphere ML Service',
            'time':               datetime.datetime.now().isoformat(),
            'face_recognition':   fr_ok,
            'opencv':             cv_ok,
            'db_path':            Config.DB_PATH,
        })

    # ── Error handlers ───────────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'ML endpoint not found', 'path': str(e)}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': str(e)}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    print(f"🤖 EduSphere ML Service — http://localhost:{Config.PORT}/ml/health")
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)
