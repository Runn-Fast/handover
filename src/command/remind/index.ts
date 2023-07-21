import { CliCommand } from 'cilly'
import { z } from 'zod'
import { publishPrivateContentToSlack } from '../../publish-to-slack.js'
import { updateUser, getUser } from '../../db/index.js'
import { HANDOVER_DAILY_REMINDER_TIME } from '../../constants.js'
import type { CreateCmdFn } from '../_utils/types.js'
import { createHelpHandler } from '../_utils/create-help-handler.js'

const $RemindCmdOptions = z.object({
  at: z.string().optional(),
})

const createRemindCmd: CreateCmdFn = (context) => {
  const { web, userId } = context

  const remindCmd = new CliCommand('remind')
    .withHelpHandler(createHelpHandler(context))
    .withDescription('Remind me to post my handover')
    .withOptions({
      description: 'Time of day to send the reminder',
      name: ['-t', '--at'],
      args: [{ name: 'time' }],
    })
    .withHandler(async (_args, anyOptions) => {
      const { at: dailyReminderTime } = $RemindCmdOptions.parse(anyOptions)

      if (typeof dailyReminderTime === 'string') {
        const result = await updateUser({
          userId,
          data: {
            dailyReminderTime,
          },
        })
        if (result instanceof Error) {
          throw result
        }

        await publishPrivateContentToSlack({
          web,
          userId,
          text: `Ok, I will remind you each week day at ${dailyReminderTime}`,
        })
      } else {
        const user = await getUser({ userId })
        if (user instanceof Error) {
          throw user
        }

        const { dailyReminderTime } = user
        if (dailyReminderTime) {
          await publishPrivateContentToSlack({
            web,
            userId,
            text: `You will be reminded each week day at ${dailyReminderTime}`,
          })
        } else {
          await publishPrivateContentToSlack({
            web,
            userId,
            text: `You will be reminded each week day at the default time of ${HANDOVER_DAILY_REMINDER_TIME}`,
          })
        }
      }
    })

  return remindCmd
}

export { createRemindCmd }
