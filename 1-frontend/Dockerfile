FROM node:18-alpine as build

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --silent

# Copiar código fuente y construir
COPY . ./
RUN npm run build

# Etapa de producción con nginx
FROM nginx:stable-alpine

# Copiar archivos construidos
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
