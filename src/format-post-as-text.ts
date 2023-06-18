import type { PostWithItems } from './db.js'
import type { FormatFn } from './types.js'
import { applyFormatFnList } from './format.js'

const lineStartsWithBullet = (line: string): boolean => {
  return /^\s*[•◦▪︎]/.test(line)
}

type FormatPostAsTextOptions = {
  post: PostWithItems
  formatFnList?: FormatFn[]
}

const formatPostAsText = (options: FormatPostAsTextOptions): string => {
  const { post, formatFnList = [] } = options
  const { title, items } = post

  const lines = items.flatMap((item) =>
    item.text
      .trim()
      .replace(/^\s*-\s*/gm, '')
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => {
        return applyFormatFnList(line, formatFnList)
      }),
  )

  const formattedLines = lines
    .map((line) => {
      if (lineStartsWithBullet(line)) {
        return line
      }

      return `• ${line}`
    })
    .join('\n')

  const text =
    formattedLines.length === 0
      ? `\n_${title}_\n`
      : `\n*${title}*\n${formattedLines}`

  return text
}

export { formatPostAsText }
