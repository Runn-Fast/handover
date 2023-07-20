import { CliCommand } from 'cilly'
import { z } from 'zod'
import pullAll from 'lodash/pullAll.js'
import type { CreateCmdFn } from '../../_utils/types.js'
import { createHelpHandler } from '../../_utils/create-help-handler.js'
import validators from '../validators.js'
import { updateUser } from '../../../db/update-user.js'
import { dayNamesMap } from '../../../date-utils.js'
import { getUser } from '../../../db/get-user.js'
import { updateResponse } from '../response.js'

const $WorkdaysOffCmdArgs = z.object({
  days: z.string().array(),
})

const createWorkdaysOffCmd: CreateCmdFn = (context) => {
  const { web, userId } = context

  const workdaysOffCmd = new CliCommand('off')
    .withHelpHandler(createHelpHandler(context))
    .withArguments({
      name: 'days',
      required: true,
      variadic: true,
      validator: (days) => validators.isValidDay(days),
    })
    .withHandler(async (anyArgs) => {
      const { days } = $WorkdaysOffCmdArgs.parse(anyArgs)
      const workdaysToDrop = days.map(
        (day) => dayNamesMap[day.toLowerCase() as keyof typeof dayNamesMap],
      )

      const user = await getUser({ userId })
      if (user instanceof Error) {
        throw user
      }

      const updatedWorkdays = pullAll(user.workdays, workdaysToDrop)

      const updatedUser = await updateUser({
        userId,
        data: {
          workdays: updatedWorkdays,
        },
      })
      if (updatedUser instanceof Error) {
        throw updatedUser
      }

      if (user.workdays) {
        updateResponse({ web, userId, workdays: user.workdays })
      }
    })

  return workdaysOffCmd
}

export { createWorkdaysOffCmd }
