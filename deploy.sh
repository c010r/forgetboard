#!/usr/bin/env bash
set -euo pipefail

# =============================================================
#  ForgeBoard - Script de despliegue para Ubuntu 22.04+
#  Uso: sudo bash deploy.sh [--dev]
#    --dev   modo desarrollo (sin nginx, sin systemd, sin gunicorn)
# =============================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

DEV_MODE=false
[[ "${1:-}" == "--dev" ]] && DEV_MODE=true

[[ $EUID -ne 0 ]] && err "Ejecutar con sudo: sudo bash deploy.sh"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# ----- Configuración (editar según entorno) -----
DB_NAME="${DB_NAME:-forgeboard}"
DB_USER="${DB_USER:-forgeboard}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -hex 16)}"
DJANGO_SECRET_KEY="${DJANGO_SECRET_KEY:-$(openssl rand -hex 50)}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
DOMAIN="${DOMAIN:-localhost}"
# -------------------------------------------------

info "=== Iniciando despliegue de ForgeBoard ==="
info "Directorio: $PROJECT_DIR"
info "Modo: $([ "$DEV_MODE" = true ] && echo 'DESARROLLO' || echo 'PRODUCCIÓN')"

# -------------------------------------------------------
# 1. Actualizar sistema e instalar dependencias
# -------------------------------------------------------
info "Instalando paquetes del sistema..."
apt-get update -qq
apt-get install -y -qq \
    python3 python3-pip python3-venv \
    nodejs npm \
    postgresql postgresql-client \
    nginx \
    git curl openssl

ok "Paquetes del sistema instalados"

# -------------------------------------------------------
# 2. PostgreSQL
# -------------------------------------------------------
info "Configurando PostgreSQL..."
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    ok "Usuario PostgreSQL creado: $DB_USER"
else
    info "Usuario PostgreSQL ya existe"
fi

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    ok "Base de datos creada: $DB_NAME"
else
    info "Base de datos ya existe"
fi

# -------------------------------------------------------
# 3. Backend - Virtualenv y dependencias
# -------------------------------------------------------
info "Configurando backend Django..."
VENV_DIR="$BACKEND_DIR/venv"

if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
    ok "Virtualenv creado"
fi

source "$VENV_DIR/bin/activate"
pip install -q --upgrade pip
pip install -q -r "$BACKEND_DIR/requirements.txt"
pip install -q gunicorn
ok "Dependencias Python instaladas"

# -------------------------------------------------------
# 4. Backend - .env
# -------------------------------------------------------
ENV_FILE="$BACKEND_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    cat > "$ENV_FILE" <<EOF
DB_ENGINE=django.db.backends.postgresql
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=localhost
DB_PORT=5432
DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY
DJANGO_DEBUG=$([ "$DEV_MODE" = true ] && echo 'True' || echo 'False')
EOF
    ok "Archivo .env creado en backend/"
else
    info "Archivo .env ya existe"
fi

export DJANGO_SECRET_KEY
export DB_ENGINE="django.db.backends.postgresql"
export DB_NAME DB_USER DB_PASSWORD
export DJANGO_DEBUG=$([ "$DEV_MODE" = true ] && echo "True" || echo "False")

# -------------------------------------------------------
# 5. Backend - Migraciones, static, superusuario
# -------------------------------------------------------
info "Ejecutando migraciones Django..."
cd "$BACKEND_DIR"
python manage.py collectstatic --noinput --clear 2>&1 | tail -1
python manage.py migrate --noinput
ok "Migraciones aplicadas"

# Crear superusuario por defecto si no existe
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@forgeboard.com', 'admin123')
    print('Superusuario creado: admin / admin123')
else:
    print('Superusuario ya existe')
" 2>&1

# -------------------------------------------------------
# 6. Frontend - .env y build
# -------------------------------------------------------
info "Configurando frontend React..."
FE_ENV="$FRONTEND_DIR/.env"
if [ ! -f "$FE_ENV" ]; then
    echo "VITE_API_URL=http://$DOMAIN:$BACKEND_PORT/api" > "$FE_ENV"
    ok "Archivo .env creado en frontend/"
else
    info "Archivo .env ya existe en frontend/"
fi

cd "$FRONTEND_DIR"
npm install --silent 2>&1 | tail -1
if [ "$DEV_MODE" = false ]; then
    npm run build 2>&1 | tail -5
    ok "Frontend compilado para producción"
fi

# -------------------------------------------------------
# 7. Servicios systemd (solo producción)
# -------------------------------------------------------
if [ "$DEV_MODE" = false ]; then
    info "Configurando servicios systemd..."

    # Backend con Gunicorn
    cat > /etc/systemd/system/forgeboard-backend.service <<EOF
[Unit]
Description=ForgeBoard Django Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$BACKEND_DIR
EnvironmentFile=$ENV_FILE
ExecStart=$VENV_DIR/bin/gunicorn config.wsgi:application --workers 4 --bind 127.0.0.1:$BACKEND_PORT --log-level=info
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    # Frontend con Vite (modo preview)
    cat > /etc/systemd/system/forgeboard-frontend.service <<EOF
[Unit]
Description=ForgeBoard React Frontend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$FRONTEND_DIR
ExecStart=$(which npx) vite preview --port $FRONTEND_PORT --host 127.0.0.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable forgeboard-backend forgeboard-frontend
    systemctl restart forgeboard-backend forgeboard-frontend
    ok "Servicios systemd iniciados"

    # -------------------------------------------------------
    # 8. Nginx
    # -------------------------------------------------------
    info "Configurando nginx como proxy inverso..."
    NGINX_CONF="/etc/nginx/sites-available/forgeboard"
    cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    client_max_body_size 50M;

    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /media/ {
        alias $BACKEND_DIR/media/;
    }

    location /static/ {
        alias $BACKEND_DIR/staticfiles/;
    }

    location / {
        proxy_pass http://127.0.0.1:$FRONTEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    ok "Nginx configurado"
fi

# -------------------------------------------------------
# 9. Resumen
# -------------------------------------------------------
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ForgeBoard desplegado exitosamente${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  Backend:  http://$DOMAIN:$BACKEND_PORT/api/"
echo "  Admin:    http://$DOMAIN:$BACKEND_PORT/admin/"
if [ "$DEV_MODE" = true ]; then
    echo "  Frontend: http://localhost:$FRONTEND_PORT (o http://$DOMAIN:$FRONTEND_PORT)"
fi
echo ""
echo "  Superusuario: admin / admin123"
echo "  DB Usuario:   $DB_USER"
echo "  DB Password:  $DB_PASSWORD"
echo "  DJANGO_SECRET_KEY: $DJANGO_SECRET_KEY"
echo ""
echo -e "${CYAN}  Recuerda CAMBIAR las credenciales por defecto en producción.${NC}"
echo -e "${CYAN}  Guarda el archivo backend/.env de forma segura.${NC}"
echo ""
