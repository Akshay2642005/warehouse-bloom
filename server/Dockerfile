FROM node:20-alpine AS base
WORKDIR /app

# Install OpenSSL here too for Prisma generate
RUN apk add --no-cache openssl

COPY package.json package-lock.json* tsconfig.json ./
RUN npm ci || npm install

COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate
EXPOSE 4000


CMD ["npm", "run" "db:migrate"]
CMD ["npm", "run", "dev"]

