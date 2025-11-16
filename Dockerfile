FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install tini for signal handling
RUN apk add --no-cache tini

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy .env.example as .env
COPY .env.example .env

# Environment variable to choose mode (stdio or http)
ENV SERVER_MODE=http

# Expose HTTP port
EXPOSE 9090

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start the HTTP server by default (for Railway/n8n)
CMD ["node", "dist/http-server.js"]
