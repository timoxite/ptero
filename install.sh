#!/usr/bin/env bash

# ==============================================================================
# Pterodactyl Custom Blue Theme Auto-Installer
# Supported OS: Ubuntu 20.04 / 22.04 / 24.04, Debian 11 / 12
# ==============================================================================

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}${BOLD}"
echo "  ██████╗ ████████╗███████╗██████╗  ██████╗ "
echo "  ██╔══██╗╚══██╔══╝██╔════╝██╔══██╗██╔═══██╗"
echo "  ██████╔╝   ██║   █████╗  ██████╔╝██║   ██║"
echo "  ██╔═══╝    ██║   ██╔══╝  ██╔══██╗██║   ██║"
echo "  ██║        ██║   ███████╗██║  ██║╚██████╔╝"
echo "  ╚═╝        ╚═╝   ╚══════╝╚═╝  ╚═╝ ╚═════╝ "
echo "   Custom Blue Animated Theme Auto-Installer"
echo -e "${NC}\n"

# Check root privileges
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}[ERROR] This script must be run as root! Use: sudo bash $0${NC}"
   exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION_ID=$VERSION_ID
else
    echo -e "${RED}[ERROR] Unsupported operating system.${NC}"
    exit 1
fi

if [[ "$OS" != "ubuntu" && "$OS" != "debian" ]]; then
    echo -e "${RED}[ERROR] This installer only supports Ubuntu and Debian.${NC}"
    exit 1
fi

echo -e "${GREEN}[INFO] Detected OS: $PRETTY_NAME${NC}"

# Detect Public IP
SERVER_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

# Collect Installation Details
echo -e "\n${BOLD}${BLUE}=== 1. Installation Configuration ===${NC}"

read -rp "Enter Domain or Server IP [Default: $SERVER_IP]: " FQDN
FQDN=${FQDN:-$SERVER_IP}

read -rp "Enter Admin Email: " ADMIN_EMAIL
while [[ -z "$ADMIN_EMAIL" ]]; do
    echo -e "${RED}Admin email cannot be empty!${NC}"
    read -rp "Enter Admin Email: " ADMIN_EMAIL
done

read -rp "Enter Admin Username [Default: admin]: " ADMIN_USER
ADMIN_USER=${ADMIN_USER:-admin}

read -rp "Enter Admin First Name [Default: Admin]: " ADMIN_FIRSTNAME
ADMIN_FIRSTNAME=${ADMIN_FIRSTNAME:-Admin}

read -rp "Enter Admin Last Name [Default: User]: " ADMIN_LASTNAME
ADMIN_LASTNAME=${ADMIN_LASTNAME:-User}

read -srp "Enter Admin Password: " ADMIN_PASSWORD
echo ""
while [[ -z "$ADMIN_PASSWORD" ]]; do
    echo -e "${RED}Password cannot be empty!${NC}"
    read -srp "Enter Admin Password: " ADMIN_PASSWORD
    echo ""
done

# Database password
DEFAULT_DB_PASS=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 24)
read -srp "Enter MySQL Database Password [Press ENTER to auto-generate]: " DB_PASSWORD
echo ""
DB_PASSWORD=${DB_PASSWORD:-$DEFAULT_DB_PASS}

# SSL option
SSL_ENABLED=false
if [[ "$FQDN" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${YELLOW}[NOTE] IP address detected ($FQDN). SSL via Let's Encrypt requires a domain name, skipping SSL.${NC}"
else
    read -rp "Do you want to configure free SSL (HTTPS) via Let's Encrypt for $FQDN? [y/N]: " ENABLE_SSL
    if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]]; then
        SSL_ENABLED=true
    fi
fi

# Determine source directory of files
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IS_LOCAL_SOURCE=false
if [[ -f "$SCRIPT_DIR/artisan" && -f "$SCRIPT_DIR/composer.json" ]]; then
    IS_LOCAL_SOURCE=true
fi

GIT_REPO_URL=""
if [[ "$IS_LOCAL_SOURCE" = false && ! -f "/tmp/panel_source.zip" ]]; then
    echo -e "\n${CYAN}You are running the installer remotely.${NC}"
    read -rp "Enter Git Repo URL of your modified panel (or press ENTER if already extracted to /var/www/pterodactyl): " GIT_REPO_URL
fi

echo -e "\n${GREEN}[INFO] Starting installation... Please wait, this may take 3-5 minutes.${NC}\n"

# Step 1: Install System Dependencies
echo -e "${BLUE}--> [1/8] Installing PHP, Nginx, MariaDB, and tools...${NC}"
export DEBIAN_FRONTEND=noninteractive

apt update -y
apt install -y software-properties-common curl apt-transport-https ca-certificates gnupg unzip git tar

# Setup Ondrej PHP repo for Ubuntu/Debian
if [[ "$OS" == "ubuntu" ]]; then
    add-apt-repository -y ppa:ondrej/php
elif [[ "$OS" == "debian" ]]; then
    curl -sSLo /tmp/debsury.gpg https://packages.sury.org/php/apt.gpg
    apt-key add /tmp/debsury.gpg
    echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list
fi

apt update -y
apt install -y php8.3 php8.3-{cli,gd,mysql,pdo,mbstring,tokenizer,bcmath,xml,fpm,curl,zip} \
    mariadb-server nginx

systemctl enable --now mariadb
systemctl enable --now nginx

# Step 2: Install Composer
echo -e "${BLUE}--> [2/8] Installing Composer...${NC}"
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
fi

# Step 3: Install Node.js 22 & Yarn
echo -e "${BLUE}--> [3/8] Installing Node.js 22 and Yarn...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
fi
npm install -g yarn

# Step 4: Configure Database
echo -e "${BLUE}--> [4/8] Configuring MariaDB database...${NC}"
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS panel;
CREATE USER IF NOT EXISTS 'pterodactyl'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER 'pterodactyl'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'127.0.0.1' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EOF

# Step 5: Place Panel Files
echo -e "${BLUE}--> [5/8] Setting up Pterodactyl files...${NC}"
mkdir -p /var/www/pterodactyl

if [[ "$IS_LOCAL_SOURCE" = true && "$SCRIPT_DIR" != "/var/www/pterodactyl" ]]; then
    echo "Copying files from $SCRIPT_DIR to /var/www/pterodactyl..."
    rsync -av --exclude 'node_modules' --exclude '.git' "$SCRIPT_DIR/" /var/www/pterodactyl/
elif [[ -n "$GIT_REPO_URL" ]]; then
    echo "Cloning repository from $GIT_REPO_URL..."
    rm -rf /var/www/pterodactyl/*
    git clone "$GIT_REPO_URL" /var/www/pterodactyl
fi

cd /var/www/pterodactyl

# Step 6: Install Dependencies & Build Frontend
echo -e "${BLUE}--> [6/8] Installing composer packages and compiling Blue Theme...${NC}"
composer install --no-dev --optimize-autoloader --no-interaction

# Build the custom blue theme
yarn install --production=false
yarn run build:production

# Setup Environment
if [ ! -f .env ]; then
    cp .env.example .env
fi

php artisan key:generate --force --no-interaction

# Configure environment settings non-interactively
PROTOCOL="http"
if [ "$SSL_ENABLED" = true ]; then
    PROTOCOL="https"
fi

php artisan p:environment:setup \
    --new-salt \
    --author="${ADMIN_EMAIL}" \
    --url="${PROTOCOL}://${FQDN}" \
    --timezone="UTC" \
    --cache="file" \
    --session="file" \
    --queue="database" \
    --telemetry=false \
    --no-interaction

php artisan p:environment:database \
    --host="127.0.0.1" \
    --port="3306" \
    --database="panel" \
    --username="pterodactyl" \
    --password="${DB_PASSWORD}" \
    --no-interaction

# Run migrations
echo -e "${BLUE}--> Running database migrations...${NC}"
php artisan migrate --seed --force --no-interaction

# Create Admin User
echo -e "${BLUE}--> Creating Admin Account...${NC}"
php artisan p:user:make \
    --email="${ADMIN_EMAIL}" \
    --username="${ADMIN_USER}" \
    --name-first="${ADMIN_FIRSTNAME}" \
    --name-last="${ADMIN_LASTNAME}" \
    --password="${ADMIN_PASSWORD}" \
    --admin=1 \
    --no-interaction

# Permissions
chown -R www-data:www-data /var/www/pterodactyl/*
chmod -R 755 /var/www/pterodactyl/storage /var/www/pterodactyl/bootstrap/cache

# Step 7: Setup Queue Worker & Crontab
echo -e "${BLUE}--> [7/8] Configuring Queue Worker & Cron...${NC}"

cat << 'EOF' > /etc/systemd/system/pteroq.service
[Unit]
Description=Pterodactyl Queue Worker
After=redis-server.service

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/pterodactyl/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now pteroq.service

# Setup cron
(crontab -l -u www-data 2>/dev/null | grep -v "artisan schedule:run"; echo "* * * * * php /var/www/pterodactyl/artisan schedule:run >> /dev/null 2>&1") | crontab -u www-data -

# Step 8: Configure Nginx & SSL
echo -e "${BLUE}--> [8/8] Configuring Nginx Web Server...${NC}"

cat << EOF > /etc/nginx/sites-available/pterodactyl.conf
server {
    listen 80;
    server_name ${FQDN};

    root /var/www/pterodactyl/public;
    index index.html index.htm index.php;
    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    access_log off;
    error_log  /var/log/nginx/pterodactyl.app-error.log error;

    client_max_body_size 100m;
    client_body_timeout 120s;

    sendfile off;

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_param HTTP_PROXY "";
        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/pterodactyl.conf
ln -s /etc/nginx/sites-available/pterodactyl.conf /etc/nginx/sites-enabled/pterodactyl.conf

nginx -t
systemctl restart nginx

# Configure SSL if enabled
if [ "$SSL_ENABLED" = true ]; then
    echo -e "${BLUE}--> Requesting SSL Certificate from Let's Encrypt...${NC}"
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d "${FQDN}" --non-interactive --agree-tos -m "${ADMIN_EMAIL}"
    systemctl restart nginx
fi

# Final Summary
echo -e "\n${GREEN}${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}   PTERODACTYL PANEL INSTALLED SUCCESSFULLY! (BLUE THEME)       ${NC}"
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e " Panel URL:      ${CYAN}${PROTOCOL}://${FQDN}${NC}"
echo -e " Admin Username: ${YELLOW}${ADMIN_USER}${NC}"
echo -e " Admin Email:    ${YELLOW}${ADMIN_EMAIL}${NC}"
echo -e " Database Pass:  ${YELLOW}${DB_PASSWORD}${NC}"
echo -e " Database Name:  ${YELLOW}panel${NC}"
echo -e "${GREEN}================================================================${NC}\n"
