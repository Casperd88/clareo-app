FROM node:22-alpine AS base

WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

RUN mkdir -p uploads && chown expressjs:nodejs uploads

USER expressjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
