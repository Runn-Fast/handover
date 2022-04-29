import Bolt from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import * as dateFns from 'date-fns'

import createUserFetcher from './fetch/create-user-fetcher.js'

import { listenToMessage } from './streams/listen-to-message.js'
import { mapMessageToAction } from './streams/map-message-to-action.js'
import { mapPostToContent } from './streams/map-post-to-content.js'
import { publishPublicContentToSlack } from './streams/publish-to-slack.js'

import {
  SLACK_BOT_TOKEN,
  SLACK_APP_TOKEN,
  HANDOVER_CHANNEL,
  HANDOVER_TITLE,
  // HANDOVER_USERS,
  PORT,
  SLACK_SIGNING_SECRET,
} from './constants.js'

import * as core from './core/index.js'

const start = async () => {
  const web = new WebClient(SLACK_BOT_TOKEN)

  const fetchUser = createUserFetcher(web)

  const slackBoltApp = new Bolt.App({
    port: PORT,
    signingSecret: SLACK_SIGNING_SECRET,
    token: SLACK_BOT_TOKEN,
    socketMode: true,
    appToken: SLACK_APP_TOKEN,
    customRoutes: [
      {
        path: '/',
        method: ['GET'],
        handler(_request, res) {
          res.end('BEEP BOOP. I AM HANDOVER BOT.')
        },
      },
    ],
  })

  await listenToMessage(slackBoltApp, async (message) => {
    console.log(message)
    const action = mapMessageToAction(message)
    console.log(action)

    if (action.type === 'ADD' || action.type === 'CHANGE') {
      const user = await fetchUser(action.userId)
      if (!user) {
        throw new Error(`Could not find user with ID: ${action.userId}`)
      }

      await core.upsertUser({
        id: user.id,
        name: user.name,
        timeZone: user.tz,
      })

      await core.addPostItem({
        userId: action.userId,
        channel: action.channel,
        ts: action.ts,
        text: action.text,
      })
    } else if (action.type === 'REMOVE') {
      await core.deletePostItem({
        channel: action.channel,
        ts: action.ts,
      })
    }

    const post = await core.getLatestPostWithItems({ userId: action.userId })
    if (!post) {
      return
    }

    const heading = await core.upsertHeading({
      date: post.date,
      title: `*${HANDOVER_TITLE}: ${dateFns.format(post.date, 'PPPP')}*`,
    })
    if (!heading.ts) {
      const headingTs = await publishPublicContentToSlack({
        web,
        channel: HANDOVER_CHANNEL,
        ts: undefined,
        text: heading.title,
      })
      await core.updateHeading(heading.id, {
        channel: HANDOVER_CHANNEL,
        ts: headingTs,
      })
    }

    const text = mapPostToContent(post)
    const ts = post.ts ?? undefined

    const publishedTs = await publishPublicContentToSlack({
      web,
      channel: HANDOVER_CHANNEL,
      ts,
      text,
    })

    await core.updatePost(post.id, {
      channel: HANDOVER_CHANNEL,
      ts: publishedTs,
    })
  })

  console.info(`Listening to slack messages...`)
}

start().catch(console.error)
