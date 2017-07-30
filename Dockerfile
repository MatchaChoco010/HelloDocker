FROM node:8.2.1

COPY package.json package-lock.json /testapp/
WORKDIR /testapp/
RUN npm install
COPY app/* app/

CMD ["npm", "start"]
