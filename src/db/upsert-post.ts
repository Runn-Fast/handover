import type { Prisma } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

const upsertPost = async (post: Prisma.PostUncheckedCreateInput) =>
  errorBoundary(() =>
    prisma.post.upsert({
      create: post,
      update: post,
      where: { userDate: { userId: post.userId, date: post.date } },
    }),
  )

export { upsertPost }
