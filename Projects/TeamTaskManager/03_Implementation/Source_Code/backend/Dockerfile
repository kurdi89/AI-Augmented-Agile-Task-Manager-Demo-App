FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 4000

CMD [ "npm", "start" ]
