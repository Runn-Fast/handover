import { WebClient, WebAPIPlatformError } from '@slack/web-api'

import { assertNever } from '../assert.js'

import { SLACK_CHANNEL } from '../constants.js'
import { Content, PrivateContent, PublicContent, Store } from '../types.js'

const publishPublicContentToSlack = async (
  web: WebClient,
  store: Store,
  content: PublicContent,
): Promise<void> => {
  const { id, text } = content

  const existingTs = await store.getContentTs(id)
  if (existingTs == null) {
    const result = await web.chat.postMessage({
      channel: SLACK_CHANNEL,
      text,
    })

    const ts = result.ts!
    await store.setContentTs(id, ts)
  } else {
    try {
      await web.chat.update({
        ts: existingTs,
        channel: SLACK_CHANNEL,
        text,
      })
    } catch (error) {
      console.error(error)
      if ((error as WebAPIPlatformError)?.data?.error === 'message_not_found') {
        await store.delContentTs(id)
        return publishPublicContentToSlack(web, store, content)
      }
    }
  }
}

const publishPrivateContentToSlack = async (
  web: WebClient,
  content: PrivateContent,
) => {
  const { user, text } = content

  await web.chat.postMessage({
    channel: user,
    text,
  })
}

const publishToSlack =
  (web: WebClient, store: Store) =>
  async (content: Content): Promise<void> => {
    switch (content.type) {
      case 'PUBLIC':
        return publishPublicContentToSlack(web, store, content)

      case 'PRIVATE':
        return publishPrivateContentToSlack(web, content)

      default:
        return assertNever(content)
    }
  }

export default publishToSlack
