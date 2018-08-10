FROM node:8-slim

RUN apt-get update \
    && apt-get install pdftk poppler-utils ghostscript tesseract-ocr

WORKDIR /server

COPY . /server
RUN npm install --unsafe-perm

EXPOSE 3000
CMD [ "npm", "start" ]