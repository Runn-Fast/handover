import type { Prisma, User } from '@prisma/client'
import { prisma } from './prisma.js'

type UpdateUserOptions = {
  userId: string
  data: Prisma.UserUpdateInput
}

const updateUser = async (
  options: UpdateUserOptions,
): Promise<User | Error> => {
  const { userId, data } = options

  if (data.dailyReminderTime && typeof data.dailyReminderTime === 'string') {
    const isValidTime = /^\d\d:\d\d$/.test(data.dailyReminderTime)
    if (!isValidTime) {
      return new Error('Invalid time, must be in the format HH:MM')
    }
  }

  return await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  })
}

export { updateUser }
