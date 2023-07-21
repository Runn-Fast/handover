import { CliCommand } from 'cilly'
import { z } from 'zod'
import type { CreateCmdFn } from '../../_utils/types.js'
import { createHelpHandler } from '../../_utils/create-help-handler.js'
import { $DayOfWeek } from '../validators.js'
import { updateUser } from '../../../db/update-user.js'
import { getUser } from '../../../db/get-user.js'
import { updateResponse } from '../response.js'

const $WorkdaysOffCmdArgs = z.object({
  days: z.array($DayOfWeek),
})

const createWorkdaysOffCmd: CreateCmdFn = (context) => {
  const { web, userId } = context

  const workdaysOffCmd = new CliCommand('off')
    .withHelpHandler(createHelpHandler(context))
    .withArguments({
      name: 'days',
      required: true,
      variadic: true,
    })
    .withHandler(async (anyArgs) => {
      const { days } = $WorkdaysOffCmdArgs.parse(anyArgs)
      const workdaysToDrop = days as number[]

      const user = await getUser({ userId })
      if (user instanceof Error) {
        throw user
      }

      const updatedWorkdays = user.workdays.filter((workDay) => {
        return !workdaysToDrop.includes(workDay)
      })

      console.log({ workdaysToDrop, updatedWorkdays })

      const updatedUser = await updateUser({
        userId,
        data: {
          workdays: updatedWorkdays,
        },
      })
      if (updatedUser instanceof Error) {
        throw updatedUser
      }

      await updateResponse({ web, userId, workdays: updatedWorkdays })
    })

  return workdaysOffCmd
}

export { createWorkdaysOffCmd }
