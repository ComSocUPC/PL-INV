# Dockerfile para API Gateway Simple
# 📡 Este container ejecuta el punto de entrada principal del sistema

# Usamos una imagen base ligera de Node.js
FROM node:18-alpine

# 📂 Establecemos el directorio de trabajo
WORKDIR /app

# 📦 Copiamos los archivos de dependencias primero (para aprovechar el cache de Docker)
COPY package*.json ./

# ⬇️ Instalamos las dependencias
RUN npm ci --only=production

# 📁 Copiamos el resto del código
COPY . .

# 👤 Creamos un usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 🔒 Cambiamos al usuario no-root
USER nodejs

# 🚪 Exponemos el puerto 3000
EXPOSE 3000

# 🏥 Health check para Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 🚀 Comando para iniciar la aplicación
CMD ["npm", "start"]

# 📝 Metadatos del container
LABEL maintainer="Tutorial Microservicios"
LABEL description="API Gateway simple para almacén educativo"
LABEL version="1.0.0"
