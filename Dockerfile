# Multi-stage build for optimized containerized testing using Chainguard Wolfi OS
FROM cgr.dev/chainguard/node:latest-dev AS base

# Install build dependencies and setup environment in single root block
USER root
RUN apk update && apk add --no-cache \
    python3 \
    make \
    gcc \
    glibc-dev \
    linux-headers \
    curl \
    bash && \
    mkdir -p /app/node_modules /app/.npm && \
    chown -R 65532:65532 /app

# Set working directory and switch to non-root user
WORKDIR /app
USER 65532:65532

# Dependencies stage - optimized for caching
FROM base AS dependencies

# Copy only package files first for optimal layer caching
COPY --chown=65532:65532 package.json pnpm-lock.yaml ./

# Install dependencies before copying source code
RUN pnpm install --frozen-lockfile --ignore-scripts --prefer-frozen-lockfile \
    && pnpm store prune

# Copy source files after dependencies are installed
COPY --chown=65532:65532 scripts/ ./scripts/
COPY --chown=65532:65532 binding.gyp ./
COPY --chown=65532:65532 src/ ./src/
COPY --chown=65532:65532 test/ ./test/
COPY --chown=65532:65532 tsconfig.json vitest.config.ts ./

# Skip native build in container - it's built in CI
RUN echo "⏭️  Skipping native build in container - built in CI"

# Production stage - minimal runtime using distroless Chainguard image
FROM cgr.dev/chainguard/node:latest AS runtime

# Copy installed dependencies from dependencies stage
COPY --from=dependencies --chown=65532:65532 /app/node_modules ./node_modules

# Note: Native modules are built separately in CI and not included in container
RUN echo "📝 Container ready for native module compilation"
 
# Switch to non-root user (Chainguard uses UID 65532)
USER 65532:65532

# Set environment variables for optimized testing
ENV NODE_ENV=test \
    CI=true

# Expose debugging port
EXPOSE 9229

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0)" || exit 1

# Use dumb-init for proper signal handling in distroless environment
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Default command optimized for speed
CMD ["pnpm", "test"]
