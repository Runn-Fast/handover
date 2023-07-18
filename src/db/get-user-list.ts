import type { User } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

const getUserList = async (): Promise<User[] | Error> => {
  return errorBoundary(async () => prisma.user.findMany())
}

export { getUserList }
