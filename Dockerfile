# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instala OpenSSL (compatível com Prisma + Node 20)
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .

# Gera client do Prisma
RUN npx prisma generate

EXPOSE 4000

# Executa migrations + seed antes de iniciar
CMD npx prisma migrate deploy && npm run prisma:seed && node dist/index.js