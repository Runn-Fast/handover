import { CliCommand } from 'cilly'
import { z } from 'zod'
import { publishPrivateContentToSlack } from '../../publish-to-slack.js'
import type { CreateCmdFn } from '../_utils/types.js'
import { createHelpHandler } from '../_utils/create-help-handler.js'
import {
  dailyReminderDefaultHandler,
  dailyReminderTimeUpdateHandler,
  dayOffHandler,
  dayOffValidator,
} from '../_utils/reminder-handler.js'
import { createRemindDeleteCmd } from './delete/index.js'

const $RemindCmdOptions = z.object({
  at: z.string().optional(),
  dayOff: z.string().optional(),
})

const createRemindCmd: CreateCmdFn = (context) => {
  const remindDeleteCmd = createRemindDeleteCmd(context)
  const { web, userId } = context

  const remindCmd = new CliCommand('remind')
    .withHelpHandler(createHelpHandler(context))
    .withSubCommands(remindDeleteCmd)
    .withDescription('Remind me to post my handover')
    .withOptions(
      {
        description: 'Time of day to send the reminder',
        name: ['-t', '--at'],
        args: [{ name: 'time' }],
      },
      {
        description:
          'Specify your day off to snooze the reminder ( 1 | 2 | 3 | 4 | 5 ) where 1 is Monday',
        name: ['-d', '--day-off'],
        args: [{ name: 'dayOff' }],
      },
    )
    .withHandler(async (_args, anyOptions) => {
      const { at: dailyReminderTime, dayOff } =
        $RemindCmdOptions.parse(anyOptions)

      if (!dailyReminderTime && !dayOff) {
        await dailyReminderDefaultHandler({ userId, web })
        return
      }

      if (dailyReminderTime && typeof dailyReminderTime === 'string') {
        const error = await dailyReminderTimeUpdateHandler({
          userId,
          dailyReminderTime,
          web,
        })

        if (error) {
          throw error
        }
      }

      if (dayOff) {
        const result = dayOffValidator(dayOff)

        if (typeof result === 'string') {
          await publishPrivateContentToSlack({
            web,
            userId,
            text: `⚠️ ${result}`,
          })
          return
        }

        await dayOffHandler({ userId, dayOff, web })
      }
    })

  return remindCmd
}

export { createRemindCmd }
