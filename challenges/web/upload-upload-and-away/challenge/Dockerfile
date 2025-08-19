FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN ["npx", "tsc"]

USER node
CMD ["sh", "-c", "npm start"]
