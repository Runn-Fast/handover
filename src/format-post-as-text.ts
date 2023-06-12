import type { PostWithItems } from './db.js'

const formatPostAsText = (post: PostWithItems): string => {
  const { title, items } = post

  const lines = items.flatMap((item) =>
    item.text
      .trim()
      .replace(/^\s*-\s*/gm, '')
      .split('\n')
      .filter((line) => line.length > 0),
  )

  const formattedLines = lines
    .map((line) => {
      if (line.trim().startsWith('•')) {
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
