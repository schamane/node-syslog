# Multi-stage build for optimized containerized testing
FROM node:22-alpine3.19 AS base

# Install build dependencies in a single layer with minimal packages
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
    bash \
    && rm -rf /var/cache/apk/*

# Install pnpm globally
RUN npm install -g pnpm --no-audit --no-fund

# Create app directory with proper permissions
WORKDIR /app
RUN mkdir -p /app/node_modules /app/.npm && chown -R node:node /app

# Dependencies stage - optimized for caching
FROM base AS dependencies

# Copy only package files for optimal layer caching
COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --chown=node:node scripts/ ./scripts/
COPY --chown=node:node binding.gyp ./
COPY --chown=node:node src/ ./src/

# Configure npm for performance
RUN npm config set cache /app/.npm --global

# Install dependencies with optimizations
RUN pnpm install --frozen-lockfile --ignore-scripts --prefer-frozen-lockfile \
    && pnpm store prune

# Skip native build in container - it's built in CI
RUN echo "⏭️  Skipping native build in container - built in CI"

# Production stage - minimal runtime
FROM base AS runtime

# Copy installed dependencies from dependencies stage
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=dependencies --chown=node:node /app/.npm ./.npm

# Copy built native module if it exists
COPY --from=dependencies --chown=node:node /app/lib ./lib || true
COPY --from=dependencies --chown=node:node /app/build ./build || true

# Copy application code
COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --chown=node:node scripts/ ./scripts/
COPY --chown=node:node src/ ./src/
COPY --chown=node:node test/ ./test/
COPY --chown=node:node tsconfig.json vitest.config.ts ./
COPY --chown=node:node binding.gyp ./

# Validate native module installation
RUN echo "🔍 Validating native module installation..." \
    && if [ -d "lib/binding" ]; then \
        echo "✅ Native module directory found"; \
        find lib/binding -name "*.node" -exec echo "Found: {}" \; \
        || echo "⚠️  No .node files found in lib/binding"; \
    else \
        echo "⚠️  Native module directory not found, will build on demand"; \
    fi

# Switch to non-root user
USER node

# Set environment variables for optimized testing
ENV NODE_ENV=test \
    CI=true \
    npm_config_cache=/app/.npm \
    PNPM_HOME=/app/.npm

# Expose debugging port
EXPOSE 9229

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0)" || exit 1

# Default command optimized for speed
CMD ["pnpm", "test"]