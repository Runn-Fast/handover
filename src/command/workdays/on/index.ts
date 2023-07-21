import { CliCommand } from 'cilly'
import { z } from 'zod'
import type { CreateCmdFn } from '../../_utils/types.js'
import { createHelpHandler } from '../../_utils/create-help-handler.js'
import { $DayOfWeek } from '../validators.js'
import { updateUser } from '../../../db/update-user.js'
import { updateResponse } from '../response.js'

const $WorkdaysOnCmdArgs = z.object({
  days: z.array($DayOfWeek),
})

const createWorkdaysOnCmd: CreateCmdFn = (context) => {
  const { web, userId } = context

  const workdaysOnCmd = new CliCommand('on')
    .withHelpHandler(createHelpHandler(context))
    .withArguments({
      name: 'days',
      required: true,
      variadic: true,
    })
    .withHandler(async (anyArgs) => {
      const { days } = $WorkdaysOnCmdArgs.parse(anyArgs)
      const workdays = days as number[]

      const user = await updateUser({
        userId,
        data: {
          workdays,
        },
      })

      if (user instanceof Error) {
        throw user
      }

      if (user.workdays) {
        await updateResponse({ web, userId, workdays: user.workdays })
      }
    })

  return workdaysOnCmd
}

export { createWorkdaysOnCmd }
