import createActionUserMapper from '../utils/createActionUserMapper.js'

const IMPORTANT = /^\s*important[:,]?\s/i

const mapActionAsImportant = createActionUserMapper({
  regExp: IMPORTANT,
  async mapAction(action) {
    const { userName, text } = action
    const userText = text?.replace(IMPORTANT, '') ?? ''
    return {
      ...action,
      user: 'Important',
      userName: 'Important',
      text: `(${userName}): ${userText}`,
    }
  },
})

export default mapActionAsImportant
