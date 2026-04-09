#!/usr/bin/env bash
# deploy.sh — deploy HikingApp to Hetzner
# Usage:
#   ./deploy.sh          — deploy both frontend and backend
#   ./deploy.sh front    — deploy frontend only
#   ./deploy.sh back     — deploy backend only

set -e

SSH_KEY="$HOME/.ssh/hetzner_hikingapp"
SERVER="root@65.109.237.30"
TARGET="${1:-all}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${YELLOW}▶ $1${NC}"; }
success() { echo -e "${GREEN}✓ $1${NC}"; }
error()   { echo -e "${RED}✗ $1${NC}"; exit 1; }

ssh_run() { ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "$1" 2>&1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

deploy_backend() {
  info "Building backend..."
  cd "$SCRIPT_DIR/backend"
  ./gradlew build -x test -q || error "Backend build failed"

  info "Uploading JAR..."
  scp -i "$SSH_KEY" build/libs/hiking-app-0.0.1-SNAPSHOT.jar "$SERVER:/app/backend/hiking-app.jar"

  info "Restarting backend..."
  ssh_run "systemctl restart hikingapp-backend"

  info "Waiting for backend to start..."
  sleep 12
  STATUS=$(ssh_run "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/api/events")
  [ "$STATUS" = "200" ] && success "Backend deployed (HTTP $STATUS)" || error "Backend not responding (HTTP $STATUS)"
}

deploy_frontend() {
  info "Building frontend..."
  cd "$SCRIPT_DIR/frontend"
  NEXT_PUBLIC_API_URL=https://nikita-moritz.de/api npm run build -s || error "Frontend build failed"

  info "Uploading frontend..."
  tar -czf /tmp/hiking-frontend.tar.gz .next package.json package-lock.json public
  scp -i "$SSH_KEY" /tmp/hiking-frontend.tar.gz "$SERVER:/app/frontend/"
  rm /tmp/hiking-frontend.tar.gz

  info "Deploying frontend..."
  ssh_run "cd /app/frontend && tar -xzf hiking-frontend.tar.gz && pm2 restart hikingapp-frontend"

  sleep 5
  STATUS=$(ssh_run "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000")
  [ "$STATUS" = "200" ] && success "Frontend deployed (HTTP $STATUS)" || error "Frontend not responding (HTTP $STATUS)"
}

echo ""
echo "🚀 HikingApp Deploy → nikita-moritz.de"
echo "────────────────────────────────────────"

case "$TARGET" in
  back)    deploy_backend ;;
  front)   deploy_frontend ;;
  all)     deploy_backend && deploy_frontend ;;
  *)       echo "Usage: ./deploy.sh [all|front|back]"; exit 1 ;;
esac

echo "────────────────────────────────────────"
success "Done! https://nikita-moritz.de"
