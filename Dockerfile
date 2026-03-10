# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for Prisma generate)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema and generated client from builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy application source code
COPY --chown=nodeuser:nodejs src ./src

# Create logs directory with correct permissions
RUN mkdir -p logs && chown -R nodeuser:nodejs logs

# Switch to non-root user
USER nodeuser

# Expose application port
EXPOSE 3000

# Use dumb-init as PID 1 to properly handle signals (SIGTERM, SIGINT)
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/server.js"]
