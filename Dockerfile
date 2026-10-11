# Multi-stage Dockerfile for Vastu Ritam (Development & Production)
FROM node:22-slim AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Development stage (runs tsx server.ts with Vite middleware on port 3000)
FROM deps AS development
ENV NODE_ENV=development
ENV PORT=3000
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage (builds production Vite SPA bundle into dist/)
FROM deps AS builder
COPY . .
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json server.ts tsconfig.json firebase-applet-config.json data-store.json ./
COPY public ./public
COPY src ./src
COPY drizzle ./drizzle

# Ensure uploads directory exists
RUN mkdir -p /app/public/uploads

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npx", "tsx", "server.ts"]
