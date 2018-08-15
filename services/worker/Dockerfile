FROM node:8-slim

RUN apt-get update \
    && apt-get --yes install pdftk poppler-utils \
    && apt-get --yes install imagemagick ghostscript

WORKDIR /server

COPY . /server
RUN npm install -g typescript ts-node-dev
RUN npm install --unsafe-perm

ENV PORT=5006
EXPOSE 5006

CMD [ "npm", "start" ]