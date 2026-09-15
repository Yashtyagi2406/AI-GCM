FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate && pnpm install --no-frozen-lockfile
COPY . .
RUN mkdir -p public
ARG AUTH_SERVICE_URL=http://localhost:3002
ARG API_GATEWAY_URL=http://localhost:3001
ARG PROXY_URL=http://localhost:8080
ENV AUTH_SERVICE_URL=$AUTH_SERVICE_URL
ENV API_GATEWAY_URL=$API_GATEWAY_URL
ENV PROXY_URL=$PROXY_URL
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV NODE_ENV=production PORT=3000
CMD ["node", "server.js"]
