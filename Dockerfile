# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Copy .env if it exists, otherwise use default
RUN if [ -f .env ]; then cp .env .env.build; else echo "VITE_SERVER_URL=https://api.afrisinc.com/" > .env.build; fi

# Build with environment variables
RUN set -a && . ./.env.build && set +a && yarn build


# ---------- Serve ----------
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
