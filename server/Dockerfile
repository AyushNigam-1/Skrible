FROM node:20-alpine

ENV NODE_ENV=production

ENV PORT=7860
EXPOSE 7860

WORKDIR /app

COPY package*.json ./

RUN npm ci --include=dev

COPY . .

RUN npm run build

RUN npm prune --production

RUN chown -R node:node /app
USER node

CMD ["npm", "start"]