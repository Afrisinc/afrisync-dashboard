# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build argument for API server URL (required from GitHub Secrets)
ARG VITE_SERVER_URL

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build with environment variable from build argument
RUN VITE_SERVER_URL=${VITE_SERVER_URL} yarn build


# ---------- Serve ----------
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
