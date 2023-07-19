import { CliCommand } from 'cilly'
import { z } from 'zod'
import { publishPrivateContentToSlack } from '../../../publish-to-slack.js'
import type { CreateCmdFn } from '../../_utils/types.js'
import { createHelpHandler } from '../../_utils/create-help-handler.js'
import { updateUser } from '../../../db/update-user.js'

const $ReminderDeleteCmdArgs = z.object({
  option: z.string().regex(/^(dayoff)$/),
})

const createRemindDeleteCmd: CreateCmdFn = (context) => {
  const { web, userId } = context

  const remindDeleteCmd = new CliCommand('delete')
    .withHelpHandler(createHelpHandler(context))
    .withArguments({
      name: 'option',
      required: true,
      description: 'The option to delete: `dayoff`', // we could delete reminder time as well in the future if it's needed
    })
    .withHandler(async (anyArgs) => {
      const { option } = $ReminderDeleteCmdArgs.parse(anyArgs)

      if (option === 'dayoff') {
        const response = await updateUser({
          userId,
          data: {
            dayOff: null,
          },
        })

        if (response instanceof Error) {
          await publishPrivateContentToSlack({
            web,
            userId,
            text: `⚠️ Error:\n${response}`,
          })
          return
        }

        await publishPrivateContentToSlack({
          web,
          userId,
          text: '✅ Your day off has been deleted successfully. No worries!',
        })
      }
    })

  return remindDeleteCmd
}

export { createRemindDeleteCmd }
