#!/bin/sh
# startup.sh — Docker container startup script
# 1. Run seed (uses OR IGNORE so safe to re-run)
echo "🌱 Seeding database..."
node server/seed.js

# 2. Import students from PDF data if JSON exists
if [ -f "students_raw.json" ]; then
  echo "📥 Importing students from PDF data..."
  python3 server/import_students.py 2>/dev/null || echo "⚠️  Python not available, skipping student import"
fi

# 3. Start Express server
echo "🚀 Starting EduSphere server..."
exec node server/index.js
