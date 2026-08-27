FROM node:22-alpine3.19 AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 4000
CMD ["node", "dist/index.js"]
