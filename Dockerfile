# syntax=docker/dockerfile:1

# ============================================================================
# Build & run: docker compose up -d --build
# Public NEXT_PUBLIC_* values are supplied as safe build args. Secrets and
# server-only AI values are runtime environment only.
# ============================================================================

FROM node:22-alpine AS deps
WORKDIR /app
# HUSKY=0: skip git hooks di script `prepare` — tidak ada .git di dalam image
ENV HUSKY=0
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    BUILD_STANDALONE=true \
    HUSKY=0
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL=http://localhost:8002
ARG NEXT_PUBLIC_ASSETS_DIR=
ARG NEXT_PUBLIC_SHOW_COMPONENTS=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_ASSETS_DIR=$NEXT_PUBLIC_ASSETS_DIR \
    NEXT_PUBLIC_SHOW_COMPONENTS=$NEXT_PUBLIC_SHOW_COMPONENTS
RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=80 \
    HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
# Output standalone berisi server.js + hasil trace dependency minimum;
# .next/static dan public TIDAK ikut otomatis — harus di-copy manual.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 80
# Non-root bind port 80 aman di Docker >= 20.10 (ip_unprivileged_port_start=0).
# Di runtime lain (mis. k8s tanpa sysctl itu), override PORT ke >= 1024.
CMD ["node", "server.js"]
