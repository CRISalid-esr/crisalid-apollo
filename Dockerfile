# Stage 1: Build
FROM node:22.9.0 as builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:22.9.0 as production

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/dist /app/dist

RUN npm install --omit=dev

EXPOSE 4000

CMD ["npm", "start"]
