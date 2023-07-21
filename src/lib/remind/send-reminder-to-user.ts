import type { WebClient } from '@slack/web-api'
import * as dateFns from 'date-fns'
import { publishPrivateContentToSlack } from '../../publish-to-slack.js'
import { formatDateAsISODate } from '../../date-utils.js'
import { generateReminder } from '../../ai.js'
import * as db from '../../db/index.js'
import type { UserWithPosts } from '../../db/index.js'
import { getLatestPost } from './get-latest-post.js'

type SendReminderToUserOptions = {
  web: WebClient
  user: UserWithPosts
  userDate: string
  daysSinceLastPostCutOff: number
}

const sendReminderToUser = async (
  options: SendReminderToUserOptions,
): Promise<void | Error> => {
  const { web, user, userDate, daysSinceLastPostCutOff } = options

  const dateOfLastPostUTC = getLatestPost(user.posts)?.date.getTime()

  const daysSinceLastPost = dateOfLastPostUTC
    ? dateFns.differenceInDays(
        dateFns.parseISO(userDate),
        dateFns.parseISO(
          formatDateAsISODate({
            instant: dateOfLastPostUTC,
            timeZone: user.timeZone,
          }),
        ),
      )
    : Number.POSITIVE_INFINITY

  let reminderText = await generateReminder({
    name: user.name,
    daysSinceLastPost,
  })

  if (daysSinceLastPost >= daysSinceLastPostCutOff) {
    reminderText += `\n_It has been ${daysSinceLastPost} days since your last handover post. If you do not post a handover today this will be the last reminder you receive._`
  }

  const messageTs = await publishPrivateContentToSlack({
    web,
    userId: user.id,
    text: reminderText,
  })
  if (messageTs instanceof Error) {
    return messageTs
  }

  const upsertReminderResult = await db.upsertReminder({
    userId: user.id,
    date: userDate,
    text: reminderText,
    channel: user.id,
    ts: messageTs,
  })
  if (upsertReminderResult instanceof Error) {
    return upsertReminderResult
  }
}

export { sendReminderToUser }
