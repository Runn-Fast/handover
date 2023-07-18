import { errorBoundary } from '@stayradiated/error-boundary'
import type { Reminder } from '@prisma/client'
import { prisma } from './prisma.js'

const getReminder = async (reminder: {
  userId: string
  date: string
}): Promise<Reminder | Error> => {
  return errorBoundary(() =>
    prisma.reminder.findUniqueOrThrow({
      where: {
        userDate: { userId: reminder.userId, date: new Date(reminder.date) },
      },
    }),
  )
}

export { getReminder }
