# Stage 1: Compile Angular production build
FROM node:20-alpine AS build
WORKDIR /app

# 1. Copia los archivos de dependencias desde la subcarpeta
COPY farmaceuticas-peru-front-end/package*.json ./
RUN npm install

# 2. Copia TODO el contenido de la subcarpeta del front directamente al WORKDIR (/app)
COPY farmaceuticas-peru-front-end/. .
RUN npm run build -- --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/pryecto-de-farmacias/browser /usr/share/nginx/html

# NUEVA LÍNEA AGREGADA: Copia el nginx.conf de la raíz al contenedor
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
