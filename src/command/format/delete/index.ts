import { CliCommand } from 'cilly'
import { z } from 'zod'
import { publishPrivateContentToSlack } from '../../../publish-to-slack.js'
import { deleteFormat } from '../../../format.js'
import type { CreateCmdFn } from '../../_utils/types.js'
import { createHelpHandler } from '../../_utils/create-help-handler.js'

const $FormatDeleteCmdArgs = z.object({
  id: z.string(),
})

const createFormatDeleteCmd: CreateCmdFn = (context) => {
  const { web, userId } = context

  const formatDeleteCmd = new CliCommand('delete')
    .withHelpHandler(createHelpHandler(context))
    .withArguments({
      name: 'id',
      required: true,
    })
    .withHandler(async (anyArgs) => {
      const { id } = $FormatDeleteCmdArgs.parse(anyArgs)

      const response = await deleteFormat({ id })

      await publishPrivateContentToSlack({
        web,
        userId,
        text: response,
      })
    })

  return formatDeleteCmd
}

export { createFormatDeleteCmd }
