# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Run prisma migrations + seed before starting
RUN npx prisma generate

EXPOSE 4000

CMD npx prisma migrate deploy && npm run prisma:seed && node dist/index.js