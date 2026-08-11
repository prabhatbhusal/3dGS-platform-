FROM node:24-alpine

WORKDIR /app

# install deps
COPY package*.json ./
RUN npm install

# copy source
COPY . .

# generate prisma client (if present)
RUN npx prisma generate || true

EXPOSE 3000

ENV PORT=3000

CMD ["node", "app.js"]
