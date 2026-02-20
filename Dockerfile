# ─── Stage 1: Build the React frontend ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install root deps
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-alpine AS production

# Install python3 for student import script
RUN apk add --no-cache python3 py3-pip && pip3 install pdfplumber --break-system-packages 2>/dev/null || true

WORKDIR /app

# Install server dependencies only
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server code
COPY server ./server

# Copy student data (for import on first boot)
COPY students_raw.json ./students_raw.json

# Copy startup script
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

# Create persistent directories
RUN mkdir -p /app/data /app/server/uploads

# Environment
ENV NODE_ENV=production
ENV PORT=4000
ENV DB_PATH=/app/data/edusphere.db

EXPOSE 4000

CMD ["./startup.sh"]
