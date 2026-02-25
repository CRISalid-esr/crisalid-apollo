# Stage 1: build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: production
FROM node:24-alpine AS production

RUN apk add --no-cache netcat-openbsd

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/dist /app/dist

RUN npm install --omit=dev

EXPOSE 4000

CMD ["npm", "start"]
