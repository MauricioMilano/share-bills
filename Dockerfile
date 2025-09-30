# Dockerfile único para Backend + Frontend

# Etapa 1: Build do frontend
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Etapa 2: Build do backend
FROM node:20-alpine as backend-build
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Etapa 3: Final
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY --from=backend-build /app /app
COPY --from=frontend-build /app/frontend/dist /app/dist/public
EXPOSE 4000
CMD npx prisma migrate deploy && npm run prisma:seed && node dist/index.js