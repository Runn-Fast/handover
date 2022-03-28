import Bolt from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import pull from 'pull-stream'
import { through as mapAsync } from 'pull-promise'
import many from 'pull-many'
import catchError from 'pull-catch'
import { tap } from 'pull-tap'

import createStore from './store/index.js'

import createUserNameFetcher from './fetch/createUserNameFetcher.js'

import createActionSource from './streams/createActionSource.js'
import { createMessageSource } from './streams/createMessageSource.js'
import filterMessage from './streams/filterMessage.js'
import mapActionAddUserName from './streams/mapActionAddUserName.js'
import mapActionToPost from './streams/mapActionToPost.js'
import mapActionAsImportant from './streams/mapActionAsImportant.js'
import mapActionAsDifferentUser from './streams/mapActionAsDifferentUser.js'
import mapActionWithURL from './streams/mapActionWithURL.js'
import mapMessageToAction from './streams/mapMessageToAction.js'
import mapPostToContent from './streams/mapPostToContent.js'
import publishToSlack from './streams/publishToSlack.js'

import {
  SLACK_BOT_TOKEN,
  SLACK_APP_TOKEN,
  HANDOVER_CONFIG,
  PORT,
  SLACK_SIGNING_SECRET,
  CACHE_DIR,
} from './constants.js'

import { Message, Action, Post, Content } from './types.js'

const { filter, map, drain, flatten } = pull

const start = async () => {
  const store = await createStore(CACHE_DIR)

  const web = new WebClient(SLACK_BOT_TOKEN)

  const fetchUserName = createUserNameFetcher(web)

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

  const sourceMessage = await createMessageSource(slackBoltApp)

  const sourceActionFromConfig = await createActionSource({
    web,
    teams: HANDOVER_CONFIG,
  })

  const sourceActionFromSlack = pull(
    sourceMessage,
    tap<Message>((message) => {
      console.log('source', message)
    }),
    filter<Message>(filterMessage),
    map<Message, Action>(mapMessageToAction),
    catchError<void>((error) => {
      console.error('Error:', error)
    }),
  )

  pull(
    many([sourceActionFromConfig, sourceActionFromSlack]),
    tap<Action>(console.log.bind(console, 'action')),

    mapAsync<Action, Action>(mapActionAddUserName(fetchUserName)),

    mapAsync<Action, Action[]>(mapActionAsImportant),
    flatten<Action[]>(),

    mapAsync<Action, Action[]>(mapActionAsDifferentUser(fetchUserName)),
    flatten<Action[]>(),

    map<Action, Action>(mapActionWithURL),
    tap<Action>(console.log.bind(console, 'action.mapped')),

    mapAsync<Action, Post[]>(mapActionToPost(store)),
    flatten<Post[]>(),
    tap<Post>(console.log.bind(console, 'post')),

    map<Post, Content>(mapPostToContent),
    catchError<void>((error) => {
      console.error('Error:', error)
    }),
    drain<Content>(publishToSlack(web, store)),
  )

  console.info(`Listening to slack messages...`)
}

start().catch(console.error)
