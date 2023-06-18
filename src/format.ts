import type { Format } from '@prisma/client'
import parseRegExp from 'regex-parser'
import * as dateFns from 'date-fns'
import { upsertFormat, getFormatList, updateFormatDeletedAt } from './db.js'
import type { FormatFn } from './types.js'

type SetFormatOptions = {
  id: string
  pattern: string
  replacement: string
  userId: string
}

const setFormat = async (options: SetFormatOptions): Promise<string> => {
  const { id, pattern, replacement, userId } = options

  try {
    parseRegExp(pattern)
  } catch (error) {
    let errorMessage: string
    errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error)
    return `⚠️ Error parsing pattern as Regular Expression:\n${errorMessage}`
  }

  const result = await upsertFormat({
    id,
    pattern,
    replacement,
    userId,
    deletedAt: null,
  })
  if (result instanceof Error) {
    return `⚠️ Database Error:\n${result.message}`
  }

  return `✅ Added format \`${id}\` to map regexp \`${pattern}\` ⇒ \`${replacement}\``
}

type ListFormatsOptions = Record<string, unknown>

const listFormats = async (_options: ListFormatsOptions): Promise<string> => {
  const list = await getFormatList()
  if (list instanceof Error) {
    return `⚠️ Database Error:\n${list.message}`
  }

  let formatList = list
    .map((format) => {
      return `• ${format.id} \`${format.pattern}\` ⇒ \`${
        format.replacement
      }\` by <@${format.userId}> on ${dateFns.format(
        format.updatedAt,
        'yyyy.MM.dd',
      )}`
    })
    .join('\n')

  if (!formatList) {
    formatList = '_No formats found._'
  }

  const response = `*Available Formats:*\n${formatList}`

  return response
}

type DeleteFormatOptions = {
  id: string
}

const deleteFormat = async (options: DeleteFormatOptions): Promise<string> => {
  const { id } = options

  const result = await updateFormatDeletedAt(id)
  if (result instanceof Error) {
    return `⚠️ Could not delete format with ID: "${id}"`
  }

  return `🗑 Successfully deleted format with ID: "${id}"`
}

type CreateFormatFnOptions = Pick<Format, 'pattern' | 'replacement'>

const createFormatFn = (format: CreateFormatFnOptions): FormatFn => {
  const { pattern, replacement } = format
  const regexp = parseRegExp(pattern)

  return (text: string): string => {
    return text.replace(regexp, replacement)
  }
}

const getFormatFnList = async (): Promise<FormatFn[]> => {
  const list = await getFormatList()
  if (list instanceof Error) {
    return []
  }

  return list.map((format) => createFormatFn(format))
}

const applyFormatFnList = (text: string, formatFnList: FormatFn[]): string => {
  return formatFnList.reduce((text, formatFn) => formatFn(text), text)
}

export {
  setFormat,
  listFormats,
  deleteFormat,
  createFormatFn,
  getFormatFnList,
  applyFormatFnList,
}
