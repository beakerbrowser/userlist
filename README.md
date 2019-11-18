# Userlist

A simple service for listing your profile drive under your Twitter username.

## Dev environment

Requires Postgres 11.

You'll need a Twitter app for development. The login callback path is `/login/twitter/callback` so a simple solution for use during dev is `http://lvh.me:3000/login/twitter/callback` which will point to localhost.

## Env vars

General service settings:

```
NODE_ENV="development" | "production"
SERVICE_TITLE="Beaker Userlist"
SESSION_KEY={insert random chars here}
SERVICE_ORIGIN="http://lvh.me:3000"
```

Twitter OAuth:

```
TWITTER_CONSUMER_KEY={insert twitter app key here}
TWITTER_CONSUMER_SECRET={insert twitter app secret here}
```

Database (when NODE_ENV == production):

```
RDS_HOSTNAME={...}
RDS_USERNAME={...}
RDS_PASSWORD={...}
RDS_PORT={...}
RDS_DB_NAME={...}
```

Database (when NODE_ENV == development):

```
PGHOST=localhost
PGUSER={...}
PGPASSWORD={...}
PGPORT=5432
PGDATABASE=userlist
```