import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

const updateFormatDeletedAt = async (formatId: string) => {
  return errorBoundary(async () =>
    prisma.format.update({
      data: { deletedAt: new Date() },
      where: { id: formatId },
    }),
  )
}

export { updateFormatDeletedAt }
