FROM node:16

ADD . /app

WORKDIR /app

RUN ls /app -al

RUN yarn && yarn build:feapi

COPY apps/frontend-api/package.json dist/apps/frontend-api/
COPY apps/frontend-api/tsconfig.build.json dist/apps/frontend-api/
COPY apps/frontend-api/tsconfig.json dist/apps/frontend-api/

EXPOSE 4000

RUN yarn --cwd dist/apps/frontend-api
RUN yarn --cwd dist/apps/libs/auth0-gateways
RUN yarn --cwd dist/apps/libs/common-module
RUN yarn --cwd dist/apps/libs/config
RUN yarn --cwd dist/apps/libs/modules
RUN yarn --cwd dist/apps/libs/s3-helper

RUN ls dist/apps/frontend-api -al

RUN ls /app -al

RUN yarn

CMD yarn --cwd apps start:frontend