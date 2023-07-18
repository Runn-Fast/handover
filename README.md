# Handover

> A slackbot for writing handover posts

![screenshot of slack](./example.png)

## Prerequisite

`npm install -g pnpm`

## Create database

```shell
# create a new database for testing
pnpm prisma:test db push

# create a new database for a dev environment
pnpm prisma db push
```

## Running

1. Create an .env file

```shell
cp .env.example .env
```

2. Search for `Handover Bot Test Env(ZilchWorld)` on `1Password`. Copy the credentials from `1Password` and paste them into the `.env` file

3. Create a new account for `zilchworld.slack.com` or request an access on the #dev-handover channel

4. Run the handover bot locally

```shell
pnpm run dev
```

## Run Tests

```shell
cp .env.example .env.test

# update DATABASE_URL to point to Postgre
edit .env.test

# install dependencies (if you haven't already)
pnpm install

# run database migrations
pnpm run prisma:test push db

# run tests!
pnpm run test
```
