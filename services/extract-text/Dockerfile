FROM node:8-slim

RUN apt-get update \
    && apt-get --yes install pdftk poppler-utils

WORKDIR /server

COPY . /server
RUN npm install -g typescript ts-node-dev
RUN npm install --unsafe-perm

ENV PORT=5002
EXPOSE 5002

CMD [ "npm", "start" ]