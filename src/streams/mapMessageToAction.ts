import { Message, Action } from '../types.js'

const mapMessageToAction = (message: Message): Action => {
  if (message.subtype === 'message_changed') {
    return {
      type: 'CHANGE',
      user: message?.message?.user ?? 'anonymous',
      userName: message?.message?.user,
      ts: message?.message?.ts,
      text: message?.message?.text,
      previousText:
        message.previous_message != null
          ? message.previous_message.text
          : undefined,
    }
  }

  if (message.subtype === 'message_deleted') {
    return {
      type: 'REMOVE',
      user: message?.previous_message?.user ?? 'anonymous',
      userName: message?.previous_message?.user,
      ts: message?.previous_message?.ts,
      text: message?.previous_message?.text,
    }
  }

  return {
    type: 'ADD',
    user: message.user ?? 'anonymous',
    userName: message.user,
    ts: message.ts,
    text: message.text,
  }
}

export default mapMessageToAction
