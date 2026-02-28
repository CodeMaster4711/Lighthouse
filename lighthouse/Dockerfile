FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
COPY lighthouse/package.json ./lighthouse/

RUN npm install

COPY lighthouse/ ./lighthouse/

RUN npm run build -w lighthouse

FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY --from=builder /app/lighthouse/build ./build
COPY package*.json ./
COPY lighthouse/package.json ./lighthouse/

RUN npm ci --omit=dev

RUN mkdir -p /app/data

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "build"]
