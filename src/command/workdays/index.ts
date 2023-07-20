import { CliCommand } from 'cilly'
import type { CreateCmdFn } from '../_utils/types.js'
import { createHelpHandler } from '../_utils/create-help-handler.js'
import { createWorkdaysOnCmd } from './on/index.js'
import { createWorkdaysOffCmd } from './off/index.js'
import { defaultResponse } from './response.js'
import { getUser } from '../../db/get-user.js'

const createWorkdaysCmd: CreateCmdFn = (context) => {
  const workdaysOnCmd = createWorkdaysOnCmd(context)
  const workdaysOffCmd = createWorkdaysOffCmd(context)
  const { web, userId } = context

  const workdaysCmd = new CliCommand('workdays')
    .withHelpHandler(createHelpHandler(context))
    .withSubCommands(workdaysOnCmd, workdaysOffCmd)
    .withDescription('workdays that you will be reminded to post your handover')
    .withHandler(async (_args) => {
      const user = await getUser({ userId })
      if (user instanceof Error) {
        throw user
      }

      defaultResponse({ web, userId, workdays: user.workdays })
    })

  return workdaysCmd
}

export { createWorkdaysCmd }
