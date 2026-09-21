# Stage 1: Install dependencies
FROM node:22-bookworm AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# Stage 2: Build the application
FROM node:22-bookworm AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# Stage 3: Run the production application
FROM node:22-bookworm AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "start"]
