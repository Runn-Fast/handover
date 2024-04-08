import { CliCommand } from 'cilly'
import { z } from 'zod'
import type { CreateCmdFunction } from '../../_utils/types.js'
import { createHelpHandler } from '../../_utils/create-help-handler.js'
import { $DayOfWeek } from '../validators.js'
import { updateUser } from '../../../db/update-user.js'
import { updateResponse } from '../response.js'

const $WorkdaysOnCmdArguments = z.object({
  days: z.array($DayOfWeek),
})

const createWorkdaysOnCmd: CreateCmdFunction = (context) => {
  const { web, userId } = context

  const workdaysOnCmd = new CliCommand('on')
    .withHelpHandler(createHelpHandler(context))
    .withArguments({
      name: 'days',
      required: true,
      variadic: true,
    })
    .withHandler(async (anyArguments) => {
      const { days: workdays } = $WorkdaysOnCmdArguments.parse(anyArguments)

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
