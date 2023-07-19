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

## DB migration

1. Update the `schema.prisma` file (for more details about Prisma Schema, please visit [Prisma Docs](https://www.prisma.io/docs/concepts/components/prisma-schema))

2. To create and run a new migration automatically for applying schema changes, run the following command:

```shell
pnpm prisma migrate dev --name=[name for migration]
```
