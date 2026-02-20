# Dockerfile for the Flask ML Service
# NOTE: face_recognition requires dlib which takes ~10 min to compile.
# Using a pre-built image with dlib included.

FROM python:3.11-slim

# Install system dependencies for OpenCV + dlib + face_recognition
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libatlas-base-dev \
    libboost-python-dev \
    libboost-thread-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for layer caching
COPY ml-service/requirements.txt ./requirements.txt

# Install Python deps (face_recognition compiles dlib ~5-10 min)
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML service source
COPY ml-service/ ./

# Create data directories
RUN mkdir -p face_data trained_models data

# Environment
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DB_PATH=/app/shared_db/edusphere.db
ENV ML_PORT=5000

EXPOSE 5000

# Generate & train models on first startup if no models exist
CMD ["python", "-c", "from database import ensure_ml_tables; ensure_ml_tables(); \
    from app import create_app; app = create_app(); \
    import os; \
    from config import Config; \
    print(\"Training ML models...\"); \
    os.makedirs(Config.MODELS_DIR, exist_ok=True); \
    exec(open(\"scripts/generate_dataset.py\").read().split(\"if __name__\")[0]); \
    train_from_csv(); \
    print(\"Starting Flask...\"); \
    app.run(host=\"0.0.0.0\", port=5000)"]
