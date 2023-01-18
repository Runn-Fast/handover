import { WebClient, WebAPIPlatformError } from '@slack/web-api'

type PublishPublicContentToSlackOptions = {
  web: WebClient
  channel: string
  ts: string | undefined
  text: string
}

const publishPublicContentToSlack = async (
  options: PublishPublicContentToSlackOptions,
): Promise<string> => {
  const { web, channel, ts, text } = options

  if (!ts) {
    const result = await web.chat.postMessage({
      channel,
      text,
      unfurl_links: false,
    })
    return result.ts!
  }

  try {
    await web.chat.update({
      ts,
      channel,
      text,
    })
    return ts
  } catch (error: unknown) {
    console.error(error)
    if ((error as WebAPIPlatformError)?.data?.error === 'message_not_found') {
      return publishPublicContentToSlack({ web, channel, text, ts: undefined })
    }

    throw error
  }
}

type PublishPrivateContentToSlackOptions = {
  web: WebClient
  userId: string
  text: string
}

const publishPrivateContentToSlack = async (
  options: PublishPrivateContentToSlackOptions,
): Promise<string> => {
  const { web, userId, text } = options

  const message = await web.chat.postMessage({
    channel: userId,
    text,
    unfurl_links: false,
  })

  return message.ts!
}

export { publishPublicContentToSlack, publishPrivateContentToSlack }
