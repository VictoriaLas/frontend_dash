# 1) Compila la SPA con Vite
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Sirve dist/ con nginx y hace de proxy de /api hacia el backend
FROM nginx:1.27-alpine
# URL del backend vista desde el contenedor (se puede cambiar al arrancar)
ENV BACKEND_URL=http://backend:8000
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
