# Getting Started

Crypt backend Monorepo

## Prerequisites

[NodeJS](https://nodejs.org/en/)

`npm` or `yarn`

[Typescript](https://www.typescriptlang.org/)

[PostgreSQL](https://www.postgresql.org/)

[Redis](https://redis.io/)

## Step. 1: Clone a new project

Clone Repository

```
git clone https://github.com/patriicke/mg-backend.git
```

## Step. 2: Checkout to branch

Latest branch with all Packages

```
git checkout main
```

Install packages

```
yarn install
```

## Step. 3: Create a database for this project

- First, open a terminal window and log in to your Postgres server using the psql command:

```
psql -U postgres
```

This command will log you in to the default database using the default Postgres user "postgres".

- Once you're logged in, you can create a new database using the CREATE DATABASE command. Here's an example:

```
postgres=# CREATE DATABASE monorepo;
```

This command will create a new database called "monorepo". You can replace "monorepo" with the name of your choice.

## Step. 3: Setup configuration files

Navigate to the config folder from the root directory. You can see 4 sample `yml` files for development, test, production, and default environments. Copy the contents from `development.sample.yml` or the section below and paste it into a new file named `development.yml`, and reconfigure if necessary. Continue doing the same for all the files. The yml files are used according to the Node Environment being used.

```text{1,4,6-8}
server:
  port: 7777
  origin: 'http://localhost:3000'

db:
  host: 'localhost'
  type: 'postgres'
  port: 5432
  username: 'postgres'
  password: 'root'
  synchronize: false
  database: 'monorepo'

jwt:
  # expiresIn: 10
  expiresIn: 900
  refreshExpiresIn: 604800
  cookieExpiresIn: 604800

feJwt:
  secret: 'example@123'

app:
  fallbackLanguage: 'en'
  name: 'monorepo'
  version: 'v0.1'
  description: 'Official monorepo API'
  appUrl: 'http://localhost:7777'
  frontendUrl: 'http://localhost:3000'
  sameSite: true

mail:
  host: 'smtp.mailtrap.io'
  port: 2525
  user: ''
  pass: ''
  from: 'monorepo'
  fromMail: 'info@app.com'
  preview: true
  secure: false
  ignoreTLS: true
  queueName: 'monorepo-mail'

queue:
  driver: 'redis'
  host: 'localhost'
  port: 6379
  db: ''
  password: ''
  username: ''

throttle:
  global:
    ttl: 60
    limit: 60
  login:
    prefix: 'login_fail_throttle'
    limit: 5
    duration: 2592000
    blockDuration: 3000

twofa:
  authenticationAppNAme: 'monorepo'

opensea:
  apiKey: ''
  provider: ''
  
googleOauth:
  clientId: xxxxxxxx
  clientSecret: xxxxxxx

nowPay:
  baseUri: 'xxxxx'
  apiKey: 'xxxxxx'
  secretKey: 'xxxx'

```

In above configuration file, you can see the following sections:

- `server` - This section contains the server configuration. The `port` is the port number on which the server will run. The `origin` is the URL of the frontend application. This is used for CORS.
- `db` - This section contains the database configuration. The `host` is the host name of the database server. The `type` is the database type. The `port` is the port number on which the database server is running. The `username` is the username of the database user. The `password` is the password of the database user. The `synchronize` is a boolean value that determines whether the database schema should be automatically created or not. The `database` is the name of the database to be used.
- `jwt` - This section contains the JWT configuration. The `expiresIn` is the number of seconds after which the JWT token will expire. The `refreshExpiresIn` is the number of seconds after which the refresh token will expire. The `cookieExpiresIn` is the number of seconds after which the cookie will expire.
- `feJwt` - This section contains the JWT configuration for the frontend application. The `secret` is the secret key used to sign the JWT token.
- `app` - This section contains the application configuration. The `fallbackLanguage` is the default language of the application. The `name` is the name of the application. The `version` is the version of the application. The `description` is the description of the application. The `appUrl` is the URL of the backend application. The `frontendUrl` is the URL of the frontend application. The `sameSite` is a boolean value that determines whether the cookie should be sent only to the same site or not.
- `mail` - This section contains the mail configuration. The `host` is the host name of the mail server. The `port` is the port number on which the mail server is running. The `user` is the username of the mail server. The `pass` is the password of the mail server. The `from` is the name of the sender. The `fromMail` is the email address of the sender. The `preview` is a boolean value that determines whether the mail should be sent or not. The `secure` is a boolean value that determines whether the mail server uses SSL or not. The `ignoreTLS` is a boolean value that determines whether the mail server uses TLS or not. The `queueName` is the name of the queue to be used for sending mails.
- `queue` - This section contains the queue configuration. The `driver` is the driver to be used for the queue. The `host` is the host name of the queue server. The `port` is the port number on which the queue server is running. The `db` is the database number to be used. The `password` is the password of the queue server. The `username` is the username of the queue server.
- `throttle` - This section contains the throttle configuration. The `global` is the global throttle configuration. The `ttl` is the number of seconds after which the throttle will expire. The `limit` is the number of requests allowed in the given time. The `login` is the login throttle configuration. The `prefix` is the prefix to be used for the login throttle. The `limit` is the number of requests allowed in the given time. The `duration` is the number of seconds after which the throttle will expire. The `blockDuration` is the number of seconds after which the throttle will be blocked.
- `twofa` - This section contains the two-factor authentication configuration. The `authenticationAppNAme` is the name of the application to be used for two-factor authentication.
- `opensea` - This section contains the OpenSea configuration. The `apiKey` is the API key to be used for OpenSea. The `provider` is the provider to be used for OpenSea.
- `googleOauth` - This section contains the Google OAuth configuration. The `clientId` is the client ID to be used for Google OAuth. The `clientSecret` is the client secret to be used for Google OAuth.
- `nowPay` - This section now pay crypto payment gateway configuration. The `baseUri` is the base URI to be used for now pay. The `apiKey` is the API key to be used for now pay. The `secretKey` is the secret key to be used for now pay.

## Step 4: Available Scripts

To migrate tables

```
yarn migration:run
```

To seed initial data

```
yarn seed:run
```

If you wish to undo the last migration:

```
yarn migration:revert
```

If you wish to undo the last seed:

```
yarn seed:revert
```

## Step 5: Run Application

#### For development<br>

- Backend API

```
yarn start:beapi:dev
```

- Frontend API

```
yarn start:feapi:dev
```

- Queue Service

```
yarn start:queue:dev
```

#### For production

- Backend API

```
yarn start:beapi
```

- Frontend API

```
yarn start:feapi
```

- Queue Service

```
yarn start:queue:prod
```

You need redis up and running to run queue service.

## API Swagger Documentation

After running either the backend API or the frontend API,<br>
Open <http://127.0.0.1:7777>
