import type { Prisma } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

const upsertUser = async (user: Prisma.UserUncheckedCreateInput) =>
  errorBoundary(() =>
    prisma.user.upsert({
      create: user,
      update: user,
      where: { id: user.id },
    }),
  )

export { upsertUser }
