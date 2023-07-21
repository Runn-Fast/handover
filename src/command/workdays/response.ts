import type { WebClient } from '@slack/web-api'
import { publishPrivateContentToSlack } from '../../publish-to-slack.js'
import { formatDayOfWeekList } from '../../date-utils.js'

const noWorkdays = 'You have no workdays set.'

type UpdateResponse = {
  web: WebClient
  userId: string
  workdays: number[]
}

const defaultResponse = async ({ web, userId, workdays }: UpdateResponse) => {
  await publishPrivateContentToSlack({
    web,
    userId,
    text:
      workdays.length === 0
        ? noWorkdays
        : `Your workdays are currently set as ${formatDayOfWeekList(
            workdays,
          )}.`,
  })
}

const updateResponse = async ({ web, userId, workdays }: UpdateResponse) => {
  await publishPrivateContentToSlack({
    web,
    userId,
    text:
      workdays.length === 0
        ? noWorkdays
        : `✅ Sounds good, you will only get reminders on ${formatDayOfWeekList(
            workdays,
          )}.`,
  })
}

export { defaultResponse, updateResponse }
