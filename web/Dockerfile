FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist

EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "--port", "4173"]
