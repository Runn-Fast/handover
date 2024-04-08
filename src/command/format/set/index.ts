import { CliCommand } from 'cilly'
import { z } from 'zod'
import { publishPrivateContentToSlack } from '../../../publish-to-slack.js'
import type { CreateCmdFunction } from '../../_utils/types.js'
import { createHelpHandler } from '../../_utils/create-help-handler.js'
import { setFormat } from '../../../format.js'

const $FormatSetCmdArguments = z.object({
  id: z.string(),
  pattern: z.string(),
  replacement: z.string(),
})
const $FormatSetCmdOptions = z.object({
  description: z.string(),
})

const createFormatSetCmd: CreateCmdFunction = (context) => {
  const { web, userId } = context
  const formatSetCmd = new CliCommand('set')
    .withHelpHandler(createHelpHandler(context))
    .withArguments(
      {
        name: 'id',
        required: true,
      },
      {
        name: 'pattern',
        required: true,
      },
      {
        name: 'replacement',
        required: true,
      },
    )
    .withOptions({
      name: ['-d', '--description'],
      args: [{ name: 'text', required: true }],
    })
    .withHandler(async (anyArguments, anyOptions) => {
      const { id, pattern, replacement } =
        $FormatSetCmdArguments.parse(anyArguments)
      const { description } = $FormatSetCmdOptions.parse(anyOptions)

      const response = await setFormat({
        id,
        pattern,
        replacement,
        userId,
        description,
      })

      await publishPrivateContentToSlack({
        web,
        userId,
        text: response,
      })
    })
  return formatSetCmd
}

export { createFormatSetCmd }
