#!/usr/bin/env bash
set -euo pipefail

# =============================================================
#  ForgeBoard - Script de despliegue para Ubuntu 22.04+
#  Uso: sudo bash deploy.sh [--dev]
#    --dev   modo desarrollo (sin nginx, sin systemd, sin gunicorn)
#
#  El script clona el repo automáticamente si no está en el
#  directorio del proyecto. El destino se configura con
#  INSTALL_DIR (default: /var/www/forgetboard).
# =============================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

DEV_MODE=false
[[ "${1:-}" == "--dev" ]] && DEV_MODE=true

[[ $EUID -ne 0 ]] && err "Ejecutar con sudo: sudo bash deploy.sh"

INSTALL_DIR="${INSTALL_DIR:-/var/www/forgetboard}"
REPO_URL="${REPO_URL:-https://github.com/c010r/forgetboard.git}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Si el script NO está dentro del proyecto (no tiene backend/ y frontend/), clona el repo
if [ ! -f "$SCRIPT_DIR/backend/manage.py" ] || [ ! -d "$SCRIPT_DIR/frontend/src" ]; then
    info "No se detectó el proyecto en $SCRIPT_DIR"
    if [ -d "$INSTALL_DIR" ]; then
        info "El directorio $INSTALL_DIR ya existe, actualizando..."
        cd "$INSTALL_DIR"
        git pull || true
    else
        info "Clonando repositorio en $INSTALL_DIR..."
        git clone "$REPO_URL" "$INSTALL_DIR"
    fi
    PROJECT_DIR="$INSTALL_DIR"
    cd "$PROJECT_DIR"
else
    PROJECT_DIR="$SCRIPT_DIR"
fi

BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

info "Proyecto en: $PROJECT_DIR"

# ----- Configuración (editar según entorno) -----
DB_NAME="${DB_NAME:-forgeboard}"
DB_USER="${DB_USER:-forgeboard}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -hex 16)}"
DJANGO_SECRET_KEY="${DJANGO_SECRET_KEY:-$(openssl rand -hex 50)}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
DOMAIN="${DOMAIN:-board.bookingly.cloud}"
SSL_EMAIL="${SSL_EMAIL:-admin@board.bookingly.cloud}"
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
    postgresql postgresql-client \
    nginx \
    git curl openssl

# Node.js 22+ (necesario para Vite 8)
if ! command -v node &>/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y -qq nodejs
fi
ok "Node.js $(node -v) instalado"

# -------------------------------------------------------
# 2. PostgreSQL
# -------------------------------------------------------
info "Configurando PostgreSQL..."
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    ok "Usuario PostgreSQL creado: $DB_USER"
else
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    info "Password actualizado para usuario PostgreSQL: $DB_USER"
fi

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    ok "Base de datos creada: $DB_NAME"
else
    info "Base de datos ya existe"
fi

# Permitir autenticación con password para conexiones locales
PG_HBA=$(sudo -u postgres psql -tAc "SHOW hba_file" 2>/dev/null | tr -d ' ')
if [ -n "$PG_HBA" ]; then
    if grep -q "^local.*all.*all.*peer" "$PG_HBA" 2>/dev/null; then
        sed -i 's/^local\(\s\+\)all\(\s\+\)all\(\s\+\)peer/local\1all\2all\3md5/' "$PG_HBA"
        sed -i 's/^host\(\s\+\)all\(\s\+\)all\(\s\+\)127\.0\.0\.1\/32\(\s\+\)scram-sha-256/host\1all\2all\3127.0.0.1\/32\4md5/' "$PG_HBA"
        systemctl restart postgresql
        ok "Autenticación PostgreSQL configurada a md5"
    fi
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
DB_HOST=127.0.0.1
DB_PORT=5432
DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY
DJANGO_DEBUG=$([ "$DEV_MODE" = true ] && echo 'True' || echo 'False')
DJANGO_ALLOWED_HOSTS=$DOMAIN
EOF
    ok "Archivo .env creado en backend/"
else
    info "Archivo .env ya existe"
fi

export DJANGO_SECRET_KEY
export DB_ENGINE="django.db.backends.postgresql"
export DB_NAME DB_USER DB_PASSWORD
export DJANGO_DEBUG=$([ "$DEV_MODE" = true ] && echo "True" || echo "False")
export DJANGO_ALLOWED_HOSTS="$DOMAIN"

# -------------------------------------------------------
# 5. Backend - Migraciones, static, superusuario
# -------------------------------------------------------
info "Ejecutando migraciones Django..."

# Crear directorios necesarios con permisos correctos
mkdir -p "$BACKEND_DIR/staticfiles"
mkdir -p "$BACKEND_DIR/media"

cd "$BACKEND_DIR"
python manage.py collectstatic --noinput --clear 2>&1 | tail -1 || err "collectstatic falló"
python manage.py migrate --noinput || err "migrate falló"
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

# Verificar que Django puede arrancar (detecta errores de importación/config)
python manage.py check --deploy 2>&1 || err "Django check --deploy falló — revisa la configuración"
ok "Django check superado"

# -------------------------------------------------------
# 6. Frontend - .env y build
# -------------------------------------------------------
info "Configurando frontend React..."
FE_ENV="$FRONTEND_DIR/.env"
API_PROTOCOL="http"
[ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "127.0.0.1" ] && API_PROTOCOL="https"
if [ ! -f "$FE_ENV" ]; then
    echo "VITE_API_URL=$API_PROTOCOL://$DOMAIN/api" > "$FE_ENV"
    ok "Archivo .env creado en frontend/"
else
    info "Archivo .env ya existe en frontend/"
fi

cd "$FRONTEND_DIR"
info "Instalando dependencias del frontend..."
npm install 2>&1 | tail -3
if [ "$DEV_MODE" = false ]; then
    info "Compilando frontend para producción..."
    npm run build 2>&1 | tail -10
    ok "Frontend compilado para producción"
fi

# -------------------------------------------------------
# 7. Asignar permisos al usuario www-data (ESENCIAL para evitar 502)
# -------------------------------------------------------
info "Asignando permisos a www-data..."
chown -R www-data:www-data "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"
# Dar permisos de escritura en media/ y staticfiles/ para uploads
chmod -R 775 "$BACKEND_DIR/media" "$BACKEND_DIR/staticfiles"
ok "Permisos asignados a www-data"

# -------------------------------------------------------
# 8. Servicios systemd (solo producción)
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
Environment=HOME=/tmp
ExecStart=$VENV_DIR/bin/gunicorn config.wsgi:application --workers 4 --bind 127.0.0.1:$BACKEND_PORT --log-level=info --umask=0022 --worker-tmp-dir /dev/shm
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

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
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable forgeboard-backend forgeboard-frontend
    systemctl restart forgeboard-backend forgeboard-frontend

    # Verificar que los servicios están corriendo
    sleep 3
    if systemctl is-active --quiet forgeboard-backend; then
        ok "forgeboard-backend activo"
    else
        err "forgeboard-backend NO arrancó - revisa: journalctl -u forgeboard-backend --no-pager -n 50"
    fi

    if systemctl is-active --quiet forgeboard-frontend; then
        ok "forgeboard-frontend activo"
    else
        err "forgeboard-frontend NO arrancó - revisa: journalctl -u forgeboard-frontend --no-pager -n 50"
    fi

    # -------------------------------------------------------
    # 9. Nginx
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
    nginx -t && systemctl restart nginx
    ok "Nginx configurado"

    # SSL con Let's Encrypt si el dominio es real
    if [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "127.0.0.1" ]; then
        info "Configurando SSL con Let's Encrypt..."
        apt-get install -y -qq certbot python3-certbot-nginx
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$SSL_EMAIL" || true
        # Renovación automática
        systemctl enable certbot.timer 2>/dev/null || true
        ok "SSL configurado para $DOMAIN"
    fi

    # -------------------------------------------------------
    # 10. Health check - verificar que la API responde
    # -------------------------------------------------------
    info "Ejecutando health check..."
    sleep 2
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$BACKEND_PORT/api/ 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" != "000" ] && [ "$HTTP_CODE" != "502" ]; then
        ok "Backend responde en puerto $BACKEND_PORT (HTTP $HTTP_CODE)"
    else
        err "Backend NO responde en puerto $BACKEND_PORT (HTTP $HTTP_CODE) - revisa: journalctl -u forgeboard-backend --no-pager -n 50"
    fi

    HTTP_CODE_FE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$FRONTEND_PORT/ 2>/dev/null || echo "000")
    if [ "$HTTP_CODE_FE" != "000" ]; then
        ok "Frontend responde en puerto $FRONTEND_PORT (HTTP $HTTP_CODE_FE)"
    else
        err "Frontend NO responde en puerto $FRONTEND_PORT"
    fi
fi

# -------------------------------------------------------
# 11. Resumen
# -------------------------------------------------------
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ForgeBoard desplegado exitosamente${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
PROTO="http"; [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "127.0.0.1" ] && PROTO="https"
echo "  Sitio:    $PROTO://$DOMAIN/"
echo "  Admin:    $PROTO://$DOMAIN/admin/"
if [ "$DEV_MODE" = true ]; then
    echo "  Frontend: http://localhost:$FRONTEND_PORT"
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
