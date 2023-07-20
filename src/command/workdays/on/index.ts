import { CliCommand } from 'cilly'
import { z } from 'zod'
import type { CreateCmdFn } from '../../_utils/types.js'
import { createHelpHandler } from '../../_utils/create-help-handler.js'
import validators from '../validators.js'
import { updateUser } from '../../../db/update-user.js'
import { dayNamesMap } from '../../../date-utils.js'
import { updateResponse } from '../response.js'

const $WorkdaysOnCmdArgs = z.object({
  days: z.string().array(),
})

const createWorkdaysOnCmd: CreateCmdFn = (context) => {
  const { web, userId } = context

  const workdaysOnCmd = new CliCommand('on')
    .withHelpHandler(createHelpHandler(context))
    .withArguments({
      name: 'days',
      required: true,
      variadic: true,
      validator: (days) => validators.isValidDay(days),
    })
    .withHandler(async (anyArgs) => {
      const { days } = $WorkdaysOnCmdArgs.parse(anyArgs)
      const workdays = days.map(
        (day) => dayNamesMap[day.toLowerCase() as keyof typeof dayNamesMap],
      )

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
        updateResponse({ web, userId, workdays: user.workdays })
      }
    })

  return workdaysOnCmd
}

export { createWorkdaysOnCmd }
