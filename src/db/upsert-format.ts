import type { Prisma } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

const upsertFormat = async (format: Prisma.FormatUncheckedCreateInput) => {
  return errorBoundary(() =>
    prisma.format.upsert({
      create: format,
      update: format,
      where: { id: format.id },
    }),
  )
}

export { upsertFormat }
