import type { Prisma, PostItem } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

type UpsertPostItemResult = {
  before: PostItem | undefined
  after: PostItem
}

const upsertPostItem = async (
  postItem: Prisma.PostItemUncheckedCreateInput,
): Promise<UpsertPostItemResult | Error> => {
  const originalPostItem = await errorBoundary(() =>
    prisma.postItem.findUnique({
      where: { channelTs: { channel: postItem.channel, ts: postItem.ts } },
    }),
  )
  if (originalPostItem instanceof Error) {
    return originalPostItem
  }

  const upsertResult = await errorBoundary(() =>
    prisma.postItem.upsert({
      create: postItem,
      update: postItem,
      where: { channelTs: { channel: postItem.channel, ts: postItem.ts } },
    }),
  )
  if (upsertResult instanceof Error) {
    return upsertResult
  }

  return {
    before: originalPostItem ?? undefined,
    after: upsertResult,
  }
}

export { upsertPostItem }
