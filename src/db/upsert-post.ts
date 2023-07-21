import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

type UpsertPostInput = {
  userId: string
  date: Date
  title: string

  channel?: string
  ts?: string
}

const upsertPost = async (post: UpsertPostInput) =>
  errorBoundary(() =>
    prisma.post.upsert({
      create: post,
      update: post,
      where: { userDate: { userId: post.userId, date: post.date } },
    }),
  )

export { upsertPost }
