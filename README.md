# Handover

> A slackbot for writing handover posts

## Running

### From Source

```shell
git clone https://github.com/Runn-Fast/handover
cd handover

npm install
npm run build

cat << EOF > .env
CACHE_DIR='/tmp/handover'
SLACK_TOKEN='xoxp-**********-************-************-********************************'
SLACK_SIGNING_SECRET='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
SLACK_CHANNEL='C6JTYKM50'
HANDOVER_CONFIG='[["The IT Crowd", "Europe/London", "0 10 * * 1-5", ["roy", "moss", "jen"]]]'
PORT='8080'
EOF

npm start
```

## Slack Permissions

- `chat:write`
- `users.profile:read`
- `users:read`

## Environment Variables

```
CACHE_DIR: (string) Path to a directory for where to write cache files
SLACK_TOKEN: (string) Slack OAuth Access Token 
SLACK_SIGNING_SECRET: (string) Slack Signing Secret
SLACK_CHANNEL: (string) ID of the Slack channel to post the handover to
PORT: (number, optional) The port to start the server on
HANDOVER_CONFIG: JSON formatted string of the handover config (see below)
```

## How It Works

## Handover Config

This config is used to automate daily posts.

```json5
// structure
// [[title, timezone, schedule, [users...]]]

[
  [
    // title
    "The IT Crowd",

    // timezone
    "Europe/Timezone",

    // schedule (see https://crontab.guru)
    "0 10 * * 1-5",

    // list of slack usernames
    [
      "roy",
      "moss",
      "jen",
    ]
  ]
]
```

(slack)
⮩ slack-message-received
  ⮩ prepare-user-message
    ⮩ user-message-created
    ⮩ user-message-changed
    ⮩ user-message-removed

(action) 
⮩ prepare-user-message
  ⮩ user-message-reset 
⮩ handover-created
⮩ time-to-remind-user
