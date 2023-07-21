import { describe, test, expect } from 'vitest'
import { isReminderNeeded } from './is-reminder-needed.js'

describe('isReminderNeeded', () => {
  test('should return true on workday', async () => {
    const reminderNeeded = await isReminderNeeded({
      userWorkdays: [1, 2],
      userDate: '2023-07-18',
      userTime: '10:00',
      dailyReminderTime: '09:00',
    })

    expect(reminderNeeded).toEqual(true)
  })

  test('should return false on day off', async () => {
    const reminderNeeded = await isReminderNeeded({
      userWorkdays: [1, 2],
      userDate: '2023-07-16',
      userTime: '10:00',
      dailyReminderTime: '09:00',
    })

    expect(reminderNeeded).toEqual(false)
  })
})
