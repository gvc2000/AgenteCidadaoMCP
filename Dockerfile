FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install tini for proper signal handling
RUN apk add --no-cache tini

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy environment template
COPY .env.example .env

# Set environment
ENV NODE_ENV=production

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start server
CMD ["node", "dist/server.js"]
