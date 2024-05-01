// Slack _sometimes_ escapes text in messages. This function unescapes it.
const unescapeSlackText = (text: string): string => {
  return text
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

export { unescapeSlackText }
