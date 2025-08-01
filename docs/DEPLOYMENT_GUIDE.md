# Guía de Despliegue en Producción

Esta guía proporciona instrucciones detalladas para desplegar el sistema de inventario en un entorno de producción.

## 📋 Prerequisitos

### Servidor
- Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- Mínimo 4 GB RAM, 2 CPUs
- Recomendado: 8 GB RAM, 4 CPUs
- 50 GB espacio en disco libre

### Software
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Nginx (proxy reverso)
- Certbot (SSL)

## 🚀 Instalación

### 1. Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

### 2. Configuración del Proyecto

```bash
# Clonar repositorio
git clone <your-repo-url> /opt/inventory-system
cd /opt/inventory-system

# Crear archivo de configuración de producción
cp .env.example .env.production
```

### 3. Configurar Variables de Entorno

Editar `.env.production`:

```bash
# === CONFIGURACIÓN DE PRODUCCIÓN ===
NODE_ENV=production

# Base de datos
DATABASE_URL=postgres://inventory_user:STRONG_PASSWORD@postgres:5432/inventory_prod
POSTGRES_USER=inventory_user
POSTGRES_PASSWORD=STRONG_PASSWORD
POSTGRES_DB=inventory_prod

# JWT
JWT_SECRET=YOUR_SUPER_STRONG_JWT_SECRET_512_BITS

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=REDIS_STRONG_PASSWORD

# MQTT
MQTT_URL=mqtt://mosquitto:1883
MQTT_USERNAME=mqtt_user
MQTT_PASSWORD=MQTT_STRONG_PASSWORD

# URLs de servicios (internas)
AUTH_SERVICE_URL=http://auth-service:3000
PRODUCT_SERVICE_URL=http://product-service:3000
INVENTORY_SERVICE_URL=http://inventory-service:3000
IOT_SERVICE_URL=http://iot-gateway:3000

# Logs
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090

# Backup
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
```

### 4. Configuración de Nginx

Crear `/etc/nginx/sites-available/inventory-system`:

```nginx
upstream api_gateway {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redireccionar a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Logs
    access_log /var/log/nginx/inventory-access.log;
    error_log /var/log/nginx/inventory-error.log;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://api_gateway/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 8 8k;
    }

    # Health checks
    location /health {
        proxy_pass http://api_gateway/health;
        access_log off;
    }

    # Static files
    location /static/ {
        alias /opt/inventory-system/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. Crear Docker Compose de Producción

Crear `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--no-auth-warning", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  mosquitto:
    image: eclipse-mosquitto:2
    volumes:
      - ./config/mosquitto.prod.conf:/mosquitto/config/mosquitto.conf
      - mosquitto_data:/mosquitto/data
      - mosquitto_logs:/mosquitto/log
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "mosquitto_pub -h localhost -t test -m test -u ${MQTT_USERNAME} -P ${MQTT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5

  api-gateway:
    build:
      context: .
      dockerfile: services/api-gateway/Dockerfile
      target: production
    ports:
      - "3001:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      AUTH_SERVICE_URL: http://auth-service:3000
      PRODUCT_SERVICE_URL: http://product-service:3000
      INVENTORY_SERVICE_URL: http://inventory-service:3000
      IOT_SERVICE_URL: http://iot-gateway:3000
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  auth-service:
    build:
      context: .
      dockerfile: services/auth-service/Dockerfile
      target: production
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  product-service:
    build:
      context: .
      dockerfile: services/product-service/Dockerfile
      target: production
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      AUTH_SERVICE_URL: http://auth-service:3000
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  inventory-service:
    build:
      context: .
      dockerfile: services/inventory-service/Dockerfile
      target: production
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      MQTT_URL: mqtt://${MQTT_USERNAME}:${MQTT_PASSWORD}@mosquitto:1883
      PRODUCT_SERVICE_URL: http://product-service:3000
    depends_on:
      - postgres
      - redis
      - mosquitto
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  iot-gateway:
    build:
      context: .
      dockerfile: services/iot-gateway/Dockerfile
      target: production
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      MQTT_URL: mqtt://${MQTT_USERNAME}:${MQTT_PASSWORD}@mosquitto:1883
      PRODUCT_SERVICE_URL: http://product-service:3000
      INVENTORY_SERVICE_URL: http://inventory-service:3000
    depends_on:
      - postgres
      - redis
      - mosquitto
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
      target: production
    ports:
      - "3000:80"
    environment:
      REACT_APP_API_URL: https://yourdomain.com/api
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  mosquitto_data:
  mosquitto_logs:

networks:
  default:
    name: inventory-prod-network
```

### 6. Configuración SSL

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Configurar renovación automática
sudo crontab -e
# Agregar línea:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. Scripts de Deployment

Crear `scripts/deploy.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Iniciando deployment de producción..."

# Variables
PROJECT_DIR="/opt/inventory-system"
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear backup
echo "📦 Creando backup..."
mkdir -p $BACKUP_DIR
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_DIR/backup_$DATE.sql

# Pull latest changes
echo "📥 Descargando últimos cambios..."
git pull origin main

# Build nuevas imágenes
echo "🔨 Construyendo imágenes..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Detener servicios
echo "⏹️  Deteniendo servicios..."
docker-compose -f docker-compose.prod.yml down

# Iniciar servicios
echo "▶️  Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar health checks
echo "🏥 Verificando health checks..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment completado!"
```

### 8. Monitoring y Logs

Crear `docker-compose.monitoring.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin_password_change_me
    restart: unless-stopped

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki-config.yml:/etc/loki/local-config.yaml
      - loki_data:/tmp/loki
    command: -config.file=/etc/loki/local-config.yaml
    restart: unless-stopped

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./monitoring/promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: -config.file=/etc/promtail/config.yml
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
```

## 🔒 Seguridad

### Firewall
```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3000:3010/tcp  # Bloquear acceso directo a servicios
```

### Backup Automático
```bash
# Script de backup automático
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Backup base de datos
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Limpiar backups antiguos
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Configurar en crontab
# 0 2 * * * /opt/inventory-system/scripts/backup.sh
```

## 📊 Monitoreo

### Health Checks
- `/health` en cada servicio
- Prometheus metrics en `/metrics`
- Logs centralizados con Loki

### Alertas Críticas
- Servicios caídos
- Alto uso de CPU/memoria
- Errores de base de datos
- Disco lleno

## 🔧 Mantenimiento

### Actualización
```bash
cd /opt/inventory-system
sudo ./scripts/deploy.sh
```

### Logs
```bash
# Ver logs de todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs -f api-gateway
```

### Escalamiento
```bash
# Escalar servicios
docker-compose -f docker-compose.prod.yml up -d --scale product-service=3
```

## 🆘 Troubleshooting

### Servicio no responde
1. Verificar health check: `curl http://localhost:3001/health`
2. Verificar logs: `docker-compose logs api-gateway`
3. Verificar recursos: `docker stats`

### Base de datos
1. Verificar conexión: `docker-compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB`
2. Verificar logs: `docker-compose logs postgres`

### Restaurar backup
```bash
gunzip -c /opt/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
```
