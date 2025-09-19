FROM node:20-alpine AS base
WORKDIR /app

# Install OpenSSL here too for Prisma generate
RUN apk add --no-cache openssl

COPY package.json package-lock.json* tsconfig.json ./
RUN npm ci || npm install

COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate
RUN npm run build
RUN test -d dist || (echo "❌ Build failed: dist folder not found!" && exit 1)

