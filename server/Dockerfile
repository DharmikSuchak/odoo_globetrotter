FROM node:20-alpine

WORKDIR /app

# Prisma's query engine needs OpenSSL on Alpine
RUN apk add --no-cache openssl

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install

# Copy prisma schema for client generation
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
