# Estágio 1: Build do React/Vite
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install && npm cache clean --force

COPY . .
RUN npm run build

# Estágio 2: Servidor Nginx para os arquivos estáticos
FROM nginx:alpine

# Copia o build (pasta dist do Vite) para a pasta do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração para que o React Router funcione corretamente (SPA)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]