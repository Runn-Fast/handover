import type { PostWithItems } from './db/index.js'
import type { FormatFunction } from './types.js'
import { applyFormatFnList } from './format.js'

const lineStartsWithBullet = (line: string): boolean => {
  const bulletList = [
    8226, // •
    9702, // ◦
    9642, // ▪
  ]
  const firstCodePoint = line.trimStart().codePointAt(0)
  if (typeof firstCodePoint !== 'number') {
    return false
  }

  return bulletList.includes(firstCodePoint)
}

type FormatPostAsTextOptions = {
  post: PostWithItems
  formatFnList?: FormatFunction[]
}

const formatPostAsText = (options: FormatPostAsTextOptions): string => {
  const { post, formatFnList: formatFunctionList = [] } = options
  const { title, items } = post

  const lines = items.flatMap((item) =>
    item.text
      .trim()
      .replaceAll(/^\s*-\s*/gm, '')
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => {
        return applyFormatFnList(line, formatFunctionList)
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
