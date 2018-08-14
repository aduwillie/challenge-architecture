FROM node:8-slim

WORKDIR /server

COPY . /server
RUN npm install -g typescript ts-node ts-node-dev
RUN npm install --unsafe-perm

ENV PORT=5003
EXPOSE 5003
CMD [ "npm", "start" ]