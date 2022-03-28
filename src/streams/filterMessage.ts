import { Message } from '../types.js'

const filterMessage = (message: Message): boolean => {
  switch (message.subtype) {
    case 'bot_message':
    case 'reminder_add':
      return false

    case 'message_deleted':
      if (message.previous_message == null) {
        return false
      }

      return true

    default:
      return true
  }
}

export default filterMessage
