FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install --omit=dev

COPY src ./src
COPY scripts ./scripts

RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]
