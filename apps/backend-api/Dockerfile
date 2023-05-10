FROM node:16

ADD . /app

WORKDIR /app

RUN ls /app -al

RUN yarn && yarn build:beapi

COPY apps/backend-api/package.json dist/apps/backend-api/
COPY apps/backend-api/tsconfig.build.json dist/apps/backend-api/
COPY apps/backend-api/tsconfig.json dist/apps/backend-api/

EXPOSE 4000

RUN yarn --cwd dist/apps/backend-api
RUN yarn --cwd dist/apps/libs/auth0-gateways
RUN yarn --cwd dist/apps/libs/common-module
RUN yarn --cwd dist/apps/libs/config
RUN yarn --cwd dist/apps/libs/modules
RUN yarn --cwd dist/apps/libs/s3-helper

RUN ls dist/apps/backend-api -al

RUN ls /app -al

RUN yarn

CMD yarn --cwd apps start:backend