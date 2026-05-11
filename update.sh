#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

cd "$PROJECT_DIR"

info "Pull de cambios..."
git pull

info "Actualizando backend..."
cd "$BACKEND_DIR"
[ ! -d venv ] && err "No existe venv/ — ejecutá deploy.sh primero"
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear | tail -1
ok "Backend actualizado"

info "Actualizando frontend..."
cd "$FRONTEND_DIR"
npm install --silent
npm run build
ok "Frontend compilado"

info "Reiniciando servicios..."
systemctl daemon-reload
systemctl restart forgeboard-backend forgeboard-frontend nginx 2>/dev/null || \
    systemctl restart forgeboard nginx 2>/dev/null || \
    info "Servicios no encontrados por systemd — reiniciar manualmente"
ok "Servicios reiniciados"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ForgeBoard actualizado exitosamente${NC}"
echo -e "${GREEN}============================================${NC}"
