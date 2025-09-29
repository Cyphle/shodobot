# ---- Build Stage ----
FROM node:22.18.0-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:latest AS prod

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Configuration non-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    mkdir -p /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    chown -R nginx:nginx /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    touch /tmp/nginx.pid /tmp/access.log /tmp/error.log && \
    chown nginx:nginx /tmp/nginx.pid /tmp/access.log /tmp/error.log

USER nginx

EXPOSE 8080/tcp

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
