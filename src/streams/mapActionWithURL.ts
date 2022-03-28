import { Action } from '../types.js'

const URL = /\[(.*?)]\(<(.*?)>\)/g

const mapActionWithURL = (action: Action): Action => {
  const { text } = action

  if (text == null) {
    return action
  }

  const newText = text.replace(URL, (_, name, url) => {
    return `<${url}|${name}>`
  })

  return {
    ...action,
    text: newText,
  }
}

export default mapActionWithURL
