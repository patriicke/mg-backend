FROM node:18-alpine

WORKDIR /usr/src/app

COPY . .
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN yarn install

RUN yarn build

