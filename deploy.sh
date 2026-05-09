#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

[[ $EUID -ne 0 ]] && err "Ejecutar con sudo: sudo bash deploy.sh"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
DOMAIN="board.bookingly.cloud"

DB_NAME="forgeboard"
DB_USER="forgeboard"
DB_PASSWORD="$(openssl rand -hex 16)"
DJANGO_SECRET_KEY="$(openssl rand -hex 50)"

info "=== Despliegue ForgeBoard ==="
info "Proyecto: $PROJECT_DIR"
info "Dominio:  $DOMAIN"

apt-get update -qq
apt-get install -y -qq python3 python3-pip python3-venv postgresql postgresql-client nginx curl openssl

if ! command -v node &>/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y -qq nodejs
fi
ok "Node.js $(node -v)"

info "Configurando PostgreSQL..."
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

PG_HBA=$(sudo -u postgres psql -tAc "SHOW hba_file" 2>/dev/null | tr -d ' ')
if [ -n "$PG_HBA" ]; then
    sed -i 's/^local\(\s\+\)all\(\s\+\)all\(\s\+\)peer/local\1all\2all\3md5/' "$PG_HBA" 2>/dev/null || true
    systemctl restart postgresql || true
fi
ok "PostgreSQL listo"

info "Configurando backend..."
VENV_DIR="$BACKEND_DIR/venv"
[ ! -d "$VENV_DIR" ] && python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
pip install -q --upgrade pip
pip install -q -r "$BACKEND_DIR/requirements.txt" gunicorn

cat > "$BACKEND_DIR/.env" <<EOF
DB_ENGINE=django.db.backends.postgresql
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=127.0.0.1
DB_PORT=5432
DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=$DOMAIN,localhost
EOF

export DB_ENGINE="django.db.backends.postgresql"
export DB_NAME DB_USER DB_PASSWORD
export DJANGO_SECRET_KEY
export DJANGO_DEBUG=False
export DJANGO_ALLOWED_HOSTS="$DOMAIN,localhost"

cd "$BACKEND_DIR"
mkdir -p staticfiles media
python manage.py collectstatic --noinput --clear | tail -1
python manage.py migrate --noinput

python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@forgeboard.com', 'admin123')
    print('Superusuario creado: admin / admin123')
"
ok "Backend listo"

info "Configurando frontend..."
cat > "$FRONTEND_DIR/.env" <<EOF
VITE_API_URL=https://$DOMAIN/api
EOF
cd "$FRONTEND_DIR"
npm install --silent
npm run build
ok "Frontend compilado"

info "Configurando servicios systemd..."
chown -R www-data:www-data "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"
chmod -R 775 "$BACKEND_DIR/media" "$BACKEND_DIR/staticfiles"

cat > /etc/systemd/system/forgeboard-backend.service <<EOF
[Unit]
Description=ForgeBoard Django Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$BACKEND_DIR
EnvironmentFile=$BACKEND_DIR/.env
ExecStart=$VENV_DIR/bin/gunicorn config.wsgi:application --workers 4 --bind 127.0.0.1:8000 --log-level=info
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/forgeboard-frontend.service <<EOF
[Unit]
Description=ForgeBoard React Frontend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$FRONTEND_DIR
ExecStart=$(which npx) vite preview --port 5173 --host 127.0.0.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable forgeboard-backend forgeboard-frontend
systemctl restart forgeboard-backend forgeboard-frontend
ok "Servicios iniciados"

info "Configurando Nginx..."
cat > /etc/nginx/sites-available/forgeboard <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 50M;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
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
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/forgeboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
ok "Nginx configurado"

info "Configurando SSL con Let's Encrypt..."
apt-get install -y -qq certbot python3-certbot-nginx
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN || true
systemctl enable certbot.timer 2>/dev/null || true
ok "SSL configurado"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ForgeBoard desplegado exitosamente${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  Sitio:    https://$DOMAIN/"
echo "  Admin:    https://$DOMAIN/admin/"
echo "  Usuario:  admin / admin123"
echo ""
