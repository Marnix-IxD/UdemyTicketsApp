FROM node:14.17.6-alpine3.14

WORKDIR /app
COPY package.json .
RUN npm install --only=prod
COPY . . 

CMD ["npm", "run", "dev"]
