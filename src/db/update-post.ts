import type { Prisma } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

const updatePost = async (postId: number, data: Prisma.PostUpdateInput) =>
  errorBoundary(async () =>
    prisma.post.update({
      where: { id: postId },
      data,
    }),
  )

export { updatePost }
