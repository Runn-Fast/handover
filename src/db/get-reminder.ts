import { errorBoundary } from '@stayradiated/error-boundary'
import type { Reminder } from '@prisma/client'
import { prisma } from './prisma.js'

const getReminder = async (reminder: {
  userId: string
  date: string
}): Promise<Reminder | Error | undefined> => {
  const row = await errorBoundary(async () =>
    prisma.reminder.findUnique({
      where: {
        userDate: { userId: reminder.userId, date: new Date(reminder.date) },
      },
    }),
  )
  return row ?? undefined
}

export { getReminder }
