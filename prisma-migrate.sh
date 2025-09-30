#!/bin/sh

set -e

# Run Prisma migrations and generate client
npx prisma migrate deploy
npx prisma generate

# Start the server
npm run start