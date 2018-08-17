FROM node:8-slim

RUN apt-get update \
    && apt-get --yes install pdftk poppler-utils

WORKDIR /server

COPY . /server
RUN npm install -g typescript ts-node-dev
RUN npm install --unsafe-perm

ENV PORT=5005
EXPOSE 5005

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ 'curl', '-f' 'http://localhost:5005/~node/health' ]

CMD [ "npm", "start" ]