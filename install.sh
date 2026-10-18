#!/usr/bin/env bash

# ==============================================================================
# Timo X Panel & Wings Auto-Installer
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
echo "  ████████╗██╗███╗   ███╗ ██████╗     ██╗  ██╗"
echo "  ╚══██╔══╝██║████╗ ████║██╔═══██╗    ╚██╗██╔╝"
echo "     ██║   ██║██╔████╔██║██║   ██║     ╚███╔╝ "
echo "     ██║   ██║██║╚██╔╝██║██║   ██║     ██╔██╗ "
echo "     ██║   ██║██║ ╚═╝ ██║╚██████╔╝    ██╔╝ ██╗"
echo "     ╚═╝   ╚═╝╚═╝     ╚═╝ ╚═════╝     ╚═╝  ╚═╝"
echo "        TIMO X PANEL & WINGS AUTO-INSTALLER"
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

# Collect Installation Details
echo -e "\n${BOLD}${BLUE}=== 1. Panel Configuration ===${NC}"

read -rp "Enter Domain or Server FQDN (e.g. panel.example.com): " FQDN
while [[ -z "$FQDN" ]]; do
    echo -e "${RED}[ERROR] Domain or IP address cannot be empty!${NC}"
    read -rp "Enter Domain or Server FQDN (e.g. panel.example.com): " FQDN
done

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
if [[ -z "$DB_PASSWORD" ]]; then
    DB_PASSWORD="$DEFAULT_DB_PASS"
    echo -e "${GREEN}[INFO] Auto-generated Database Password: ${YELLOW}${DB_PASSWORD}${NC}"
fi

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

# Wings installation option
echo -e "\n${BOLD}${BLUE}=== 2. Wings (Daemon) Configuration ===${NC}"
read -rp "Do you want to install Wings on this server as well? [Y/n]: " INSTALL_WINGS
INSTALL_WINGS=${INSTALL_WINGS:-Y}
if [[ "$INSTALL_WINGS" =~ ^[Yy]$ ]]; then
    WINGS_ENABLED=true
    TOTAL_STEPS=9
    echo -e "${GREEN}[INFO] Wings will be installed alongside Timo X Panel.${NC}"
else
    WINGS_ENABLED=false
    TOTAL_STEPS=8
    echo -e "${YELLOW}[INFO] Skipping Wings installation.${NC}"
fi

# Determine source directory of files
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IS_LOCAL_SOURCE=false
if [[ -f "$SCRIPT_DIR/artisan" && -f "$SCRIPT_DIR/composer.json" ]]; then
    IS_LOCAL_SOURCE=true
fi

GIT_REPO_URL="https://github.com/timoxite/ptero.git"
if [[ "$IS_LOCAL_SOURCE" = false && ! -f "/tmp/panel_source.zip" ]]; then
    echo -e "\n${CYAN}You are running the installer remotely.${NC}"
    read -rp "Enter Git Repo URL [Default: $GIT_REPO_URL]: " INPUT_REPO_URL
    GIT_REPO_URL=${INPUT_REPO_URL:-$GIT_REPO_URL}
fi

echo -e "\n${GREEN}[INFO] Starting installation... Please wait, this may take 3-5 minutes.${NC}\n"

# Step 1: Install System Dependencies
echo -e "${BLUE}--> [1/${TOTAL_STEPS}] Installing PHP, Nginx, MariaDB, and tools...${NC}"
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
echo -e "${BLUE}--> [2/${TOTAL_STEPS}] Installing Composer...${NC}"
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
fi

# Step 3: Install Node.js 22 & Yarn
echo -e "${BLUE}--> [3/${TOTAL_STEPS}] Installing Node.js 22 and Yarn...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
fi
npm install -g yarn

# Step 4: Configure Database
echo -e "${BLUE}--> [4/${TOTAL_STEPS}] Configuring MariaDB database...${NC}"

# Safely escape backslashes and single quotes for SQL string
SAFE_DB_PASS=$(printf '%s' "$DB_PASSWORD" | sed -e "s/\\\\/\\\\\\\\/g" -e "s/'/\\\\'/g")

DB_CLI="mysql"
if command -v mariadb &> /dev/null; then
    DB_CLI="mariadb"
fi

$DB_CLI -u root <<EOF
CREATE DATABASE IF NOT EXISTS panel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'pterodactyl'@'127.0.0.1' IDENTIFIED BY '${SAFE_DB_PASS}';
ALTER USER 'pterodactyl'@'127.0.0.1' IDENTIFIED BY '${SAFE_DB_PASS}';
GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'127.0.0.1' WITH GRANT OPTION;

CREATE USER IF NOT EXISTS 'pterodactyl'@'localhost' IDENTIFIED BY '${SAFE_DB_PASS}';
ALTER USER 'pterodactyl'@'localhost' IDENTIFIED BY '${SAFE_DB_PASS}';
GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'localhost' WITH GRANT OPTION;

CREATE USER IF NOT EXISTS 'pterodactyl'@'%' IDENTIFIED BY '${SAFE_DB_PASS}';
ALTER USER 'pterodactyl'@'%' IDENTIFIED BY '${SAFE_DB_PASS}';
GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'%' WITH GRANT OPTION;

FLUSH PRIVILEGES;
EOF

# Step 5: Place Panel Files
echo -e "${BLUE}--> [5/${TOTAL_STEPS}] Setting up Timo X Panel files...${NC}"
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

# Ensure all Laravel required storage and cache directories exist with permissions
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p storage/app/public
mkdir -p bootstrap/cache
mkdir -p public/assets
chmod -R 777 storage bootstrap/cache

# Step 6: Install Dependencies & Build Frontend
echo -e "${BLUE}--> [6/${TOTAL_STEPS}] Installing composer packages and compiling Timo X Panel...${NC}"

# Setup Environment early so composer hooks don't complain about encryption key
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        cat << 'EOF' > .env
APP_NAME="Timo X Panel"
APP_ENV=production
APP_DEBUG=false
APP_KEY=
APP_THEME=pterodactyl
APP_TIMEZONE=UTC
APP_URL=http://localhost
APP_LOCALE=en
APP_ENVIRONMENT_ONLY=true

LOG_CHANNEL=daily
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=panel
DB_USERNAME=pterodactyl
DB_PASSWORD=

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

CACHE_DRIVER=file
QUEUE_CONNECTION=database
SESSION_DRIVER=file

HASHIDS_SALT=
HASHIDS_LENGTH=8
EOF
    fi
fi

# Ensure assets directory exists for yarn clean & build
mkdir -p public/assets

export COMPOSER_ALLOW_SUPERUSER=1
composer install --no-dev --optimize-autoloader --no-interaction

php artisan key:generate --force --no-interaction

# Build the custom theme
yarn install --production=false
yarn run build:production

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

# Configure database connection
if ! php artisan p:environment:database \
    --host="127.0.0.1" \
    --port="3306" \
    --database="panel" \
    --username="pterodactyl" \
    --password="${DB_PASSWORD}" \
    --no-interaction; then
    echo -e "${YELLOW}[NOTE] Retrying database connection with host 'localhost'...${NC}"
    php artisan p:environment:database \
        --host="localhost" \
        --port="3306" \
        --database="panel" \
        --username="pterodactyl" \
        --password="${DB_PASSWORD}" \
        --no-interaction
fi

# Run migrations
echo -e "${BLUE}--> Running database migrations...${NC}"
php artisan migrate --seed --force --no-interaction
php artisan tinker --execute="DB::table('settings')->updateOrInsert(['key' => 'settings::app:name'], ['value' => 'Timo X Panel']);" 2>/dev/null || true

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
echo -e "${BLUE}--> [7/${TOTAL_STEPS}] Configuring Queue Worker & Cron...${NC}"

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
echo -e "${BLUE}--> [8/${TOTAL_STEPS}] Configuring Nginx Web Server...${NC}"

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
    certbot --nginx -d "${FQDN}" --non-interactive --agree-tos -m "${ADMIN_EMAIL}" || {
        echo -e "${YELLOW}[NOTE] Certbot failed, which is normal when using Cloudflare Tunnel or Proxy.${NC}"
        echo -e "${YELLOW}Cloudflare handles SSL/HTTPS automatically on its edge.${NC}"
    }
    systemctl restart nginx
fi

# Step 9: Install Docker & Wings Daemon (if selected)
if [ "$WINGS_ENABLED" = true ]; then
    echo -e "${BLUE}--> [9/${TOTAL_STEPS}] Installing Docker & Wings Daemon...${NC}"

    # Install Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${CYAN}--> Installing Docker...${NC}"
        curl -sSL https://get.docker.com/ | CHANNEL=stable bash
        systemctl enable --now docker
    else
        echo -e "${GREEN}--> Docker is already installed and running.${NC}"
    fi

    # Determine Architecture
    ARCH=$(uname -m)
    if [[ "$ARCH" == "x86_64" ]]; then
        WINGS_ARCH="amd64"
    elif [[ "$ARCH" == "aarch64" || "$ARCH" == "arm64" ]]; then
        WINGS_ARCH="arm64"
    else
        WINGS_ARCH="amd64"
    fi

    echo -e "${CYAN}--> Downloading Wings binary for ${WINGS_ARCH}...${NC}"
    mkdir -p /etc/pterodactyl /var/log/pterodactyl
    curl -L -o /usr/local/bin/wings "https://github.com/pterodactyl/wings/releases/latest/download/wings_linux_${WINGS_ARCH}"
    chmod u+x /usr/local/bin/wings

    echo -e "${CYAN}--> Configuring Wings systemd service...${NC}"
    cat << 'EOF' > /etc/systemd/system/wings.service
[Unit]
Description=Pterodactyl Wings Daemon
After=docker.service
Requires=docker.service
PartOf=docker.service

[Service]
User=root
WorkingDirectory=/etc/pterodactyl
LimitNOFILE=4096
PIDFile=/var/run/wings/daemon.pid
ExecStart=/usr/local/bin/wings
Restart=on-failure
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable wings
    echo -e "${GREEN}--> Wings binary and service configured successfully!${NC}"
fi

# Final Summary
echo -e "\n${GREEN}${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}      TIMO X PANEL INSTALLED SUCCESSFULLY!                      ${NC}"
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e " Panel URL:        ${CYAN}${PROTOCOL}://${FQDN}${NC}"
echo -e " Admin Username:   ${YELLOW}${ADMIN_USER}${NC}"
echo -e " Admin Email:      ${YELLOW}${ADMIN_EMAIL}${NC}"
echo -e " Database Pass:    ${YELLOW}${DB_PASSWORD}${NC}"
echo -e " Database Name:    ${YELLOW}panel${NC}"
if [ "$WINGS_ENABLED" = true ]; then
echo -e " Wings Daemon:     ${GREEN}Installed (/usr/local/bin/wings)${NC}"
echo -e " Docker Status:    ${GREEN}Active & Running${NC}"
echo -e "\n${CYAN}${BOLD}==> Next Steps to Connect Wings (Node):${NC}"
echo -e " 1. Log in to your panel at: ${CYAN}${PROTOCOL}://${FQDN}${NC}"
echo -e " 2. Go to Admin -> Locations -> Click 'Create New' (e.g. Code: local)."
echo -e " 3. Go to Admin -> Nodes -> Click 'Create New'."
echo -e "    - Set FQDN: ${YELLOW}${FQDN}${NC}"
echo -e "    - Memory & Disk: Set according to your server specs."
echo -e " 4. Open the created Node -> Click the 'Configuration' tab."
echo -e " 5. Copy the auto-configure command, run it in terminal, then run:"
echo -e "    ${YELLOW}systemctl restart wings${NC}"
fi
echo -e "${GREEN}================================================================${NC}\n"
