FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY lighthouse/package.json ./package.json

RUN npm install

COPY lighthouse/ .

RUN npm run build && npm prune --omit=dev

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY lighthouse/package.json ./package.json
COPY database/ /database/

RUN mkdir -p /app/data

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV ORIGIN=http://localhost:3000
ENV DATABASE_PATH=/app/data/lighthouse.db

CMD ["node", "build"]
