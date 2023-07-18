import { CliCommand } from 'cilly'
import { publishPrivateContentToSlack } from '../../../publish-to-slack.js'
import { listFormats } from '../../../format.js'
import type { CreateCmdFn } from '../../_utils/types.js'
import { createHelpHandler } from '../../_utils/create-help-handler.js'

const createFormatListCmd: CreateCmdFn = (context) => {
  const { web, userId } = context

  const formatListCmd = new CliCommand('list')
    .withHelpHandler(createHelpHandler(context))
    .withHandler(async () => {
      const response = await listFormats({})

      await publishPrivateContentToSlack({
        web,
        userId,
        text: response,
      })
    })

  return formatListCmd
}

export { createFormatListCmd }
