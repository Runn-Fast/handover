import { WebClient } from '@slack/web-api'
import { publishPrivateContentToSlack } from '../../publish-to-slack.js'
import { formatDayNames } from '../../date-utils.js'

const noWorkdays = 'You have no workdays set.'

type UpdateResponse = {
  web: WebClient
  userId: string
  workdays: number[]
}

export const defaultResponse = async ({
  web,
  userId,
  workdays,
}: UpdateResponse) => {
  await publishPrivateContentToSlack({
    web,
    userId,
    text:
      workdays.length === 0
        ? noWorkdays
        : `Your workdays are currently set as ${formatDayNames(workdays)}.`,
  })
}

export const updateResponse = async ({
  web,
  userId,
  workdays,
}: UpdateResponse) => {
  await publishPrivateContentToSlack({
    web,
    userId,
    text:
      workdays.length === 0
        ? noWorkdays
        : `✅ Sounds good, you will only get reminders on ${formatDayNames(
            workdays,
          )}.`,
  })
}
