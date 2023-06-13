# Handover

> A slackbot for writing handover posts

![screenshot of slack](./example.png)

## Running

> TODO: Update README

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
