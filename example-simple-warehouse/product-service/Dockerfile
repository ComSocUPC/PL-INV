# 🐳 Dockerfile para Product Service
# Este archivo define cómo construir la imagen Docker del servicio de productos

# 📦 Imagen base: Node.js versión 18 (LTS - Long Term Support)
# Alpine es una distribución Linux muy ligera, perfecta para contenedores
FROM node:18-alpine

# 👤 Crear usuario no privilegiado por seguridad
# Nunca ejecutar aplicaciones como root en producción
RUN addgroup -g 1001 -S nodejs && \
    adduser -S productuser -u 1001 -G nodejs

# 📁 Directorio de trabajo dentro del contenedor
WORKDIR /app

# 📋 Copiar archivos de dependencias primero
# Esto permite aprovechar la cache de Docker si no cambian las dependencias
COPY package*.json ./

# 📦 Instalar dependencias
# --only=production instala solo las dependencias necesarias (no las de desarrollo)
RUN npm ci --only=production && npm cache clean --force

# 📄 Copiar el resto del código de la aplicación
COPY . .

# 🔒 Cambiar propietario de los archivos al usuario no privilegiado
RUN chown -R productuser:nodejs /app
USER productuser

# 🌐 Puerto que expondrá el contenedor
# Este debe coincidir con el puerto configurado en index.js
EXPOSE 3002

# 🏥 Configurar health check
# Docker verificará periódicamente si el servicio está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# 🚀 Comando para iniciar la aplicación
# El servicio iniciará automáticamente cuando se ejecute el contenedor
CMD ["npm", "start"]

# 📝 Notas para principiantes:
# 
# 1. FROM: Define la imagen base (Node.js 18 en Alpine Linux)
# 2. RUN: Ejecuta comandos durante la construcción de la imagen
# 3. WORKDIR: Establece el directorio de trabajo
# 4. COPY: Copia archivos del host al contenedor
# 5. EXPOSE: Documenta qué puerto usa la aplicación
# 6. CMD: Define el comando que se ejecuta al iniciar el contenedor
# 7. USER: Cambia al usuario no privilegiado por seguridad
# 8. HEALTHCHECK: Permite a Docker verificar si el servicio está saludable
#
# Para construir la imagen:
# docker build -t product-service .
#
# Para ejecutar el contenedor:
# docker run -p 3002:3002 product-service
