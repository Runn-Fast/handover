import { PostWithItems } from '../core/index.js'

const mapPostToContent = (post: PostWithItems): string => {
  const { title, items } = post

  const lines = items.flatMap((item) => {
    return item.text
      .trim()
      .replace(/^\s*-\s*/gm, '')
      .split('\n')
      .filter((line) => line.length > 0)
  })

  const formattedLines = lines.map((line) => `• ${line}`).join('\n')

  const text =
    formattedLines.length === 0
      ? `\n*${title}*\n_missing handover items_`
      : `\n*${title}*\n${formattedLines}`

  return text
}

export { mapPostToContent }
