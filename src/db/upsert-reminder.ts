import type { Prisma } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

const upsertReminder = async (reminder: Prisma.ReminderUncheckedCreateInput) =>
  errorBoundary(() =>
    prisma.reminder.upsert({
      create: reminder,
      update: reminder,
      where: { userDate: { userId: reminder.userId, date: reminder.date } },
    }),
  )

export { upsertReminder }
