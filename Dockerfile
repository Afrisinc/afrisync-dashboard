# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build


# ---------- Serve ----------
FROM nginx:alpine

# Install envsubst to substitute environment variables
RUN apk add --no-cache gettext

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Set default backend URL (can be overridden at runtime)
ENV BACKEND_URL=localhost:3000

# Use a startup script to substitute environment variables
RUN echo '#!/bin/sh\nenvsubst "$$BACKEND_URL" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf\nnginx -g "daemon off;"' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
