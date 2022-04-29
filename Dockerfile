FROM node:16
WORKDIR /usr/src/server
COPY . .
RUN npm install
EXPOSE 4685 8080
CMD [ "node", "webserver.js" ]