# Node.js 22 Alpine Linux for containerized testing
FROM node:22-alpine3.19

# Install additional build dependencies for native addon compilation
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    musl-dev \
    linux-headers \
    libgcc \
    libstdc++ \
    paxctl \
    curl \
    bash

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Create node_modules with proper permissions (node user already exists)
RUN mkdir -p /app/node_modules && chown -R node:node /app

# Copy package files and scripts first for better caching
COPY --chown=node:node package.json pnpm-lock.yaml scripts/ ./

# Install dependencies (skip install script for now)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy the rest of the application
COPY --chown=node:node . .

# Switch to non-root user for security
USER node

# Set environment variables for containerized testing
ENV NODE_ENV=test
ENV CI=true

# Expose test port for potential debugging
EXPOSE 9229

# Default command runs tests in container
CMD ["pnpm", "test"]