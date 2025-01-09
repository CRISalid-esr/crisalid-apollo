# Stage 1: build
FROM node:22.9.0 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: production
FROM node:22.9.0 AS production

RUN apt-get update && apt-get install -y netcat-openbsd

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/dist /app/dist

RUN npm install --omit=dev

EXPOSE 4000

CMD ["npm", "start"]
