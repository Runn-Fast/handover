import type { User } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

type GetUserOptions = {
  userId: string
}

const getUser = async (options: GetUserOptions): Promise<User | Error> => {
  const { userId } = options
  return errorBoundary(async () =>
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
    }),
  )
}

export { getUser }
