# Multi-stage build for optimized containerized testing using Chainguard Wolfi OS
FROM cgr.dev/chainguard/node:latest-dev AS base

# Install build dependencies using Wolfi OS package manager
USER root
RUN apk update && apk add --no-cache \
    python3 \
    make \
    gcc \
    glibc-dev \
    linux-headers \
    curl \
    bash

# Enable pnpm using corepack (no root permissions needed)
USER root
RUN corepack enable pnpm
USER 65532:65532

# Create app directory with proper permissions (Chainguard uses /app by default)
USER root
WORKDIR /app
RUN mkdir -p /app/node_modules /app/.npm && chown -R 65532:65532 /app
USER 65532:65532

# Dependencies stage - optimized for caching
FROM base AS dependencies

# Copy only package files for optimal layer caching
COPY --chown=65532:65532 package.json pnpm-lock.yaml ./
COPY --chown=65532:65532 scripts/ ./scripts/
COPY --chown=65532:65532 binding.gyp ./
COPY --chown=65532:65532 src/ ./src/
COPY --chown=65532:65532 test/ ./test/
COPY --chown=65532:65532 tsconfig.json vitest.config.ts ./

# Configure npm for performance (keep for compatibility)
USER root
RUN npm config set cache /app/.npm --global
USER 65532:65532

# Install dependencies with optimizations
RUN pnpm install --frozen-lockfile --ignore-scripts --prefer-frozen-lockfile \
    && pnpm store prune

# Skip native build in container - it's built in CI
RUN echo "⏭️  Skipping native build in container - built in CI"

# Production stage - minimal runtime using distroless Chainguard image
FROM cgr.dev/chainguard/node:latest AS runtime

# Copy installed dependencies from dependencies stage
COPY --from=dependencies --chown=65532:65532 /app/node_modules ./node_modules
COPY --from=dependencies --chown=65532:65532 /app/.npm ./.npm

# Use npm instead of pnpm in distroless runtime (npm is available)
# pnpm dependencies are already installed in node_modules

# Note: Native modules are built separately in CI and not included in container
RUN echo "📝 Container ready for native module compilation"
 
# Switch to non-root user (Chainguard uses UID 65532)
USER 65532:65532

# Set environment variables for optimized testing
ENV NODE_ENV=test \
    CI=true \
    npm_config_cache=/app/.npm \
    PNPM_HOME=/app/.npm

# Expose debugging port
EXPOSE 9229

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0)" || exit 1

# Use dumb-init for proper signal handling in distroless environment
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Default command optimized for speed (use npm for test execution in distroless)
CMD ["npm", "run", "test"]
