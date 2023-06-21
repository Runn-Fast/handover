import type { Prisma, Post, PostItem } from '@prisma/client'
import pkg from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

const getUserList = async () => prisma.user.findMany()

// Find users that have posted something in the last 7 days
type GetActiveUserListOptions = {
  activeSince: Date
}
const getActiveUserList = async (options: GetActiveUserListOptions) => {
  const { activeSince } = options
  return errorBoundary(async () =>
    prisma.user.findMany({
      where: {
        posts: {
          some: {
            date: {
              gte: activeSince,
            },
            items: {
              some: {},
            },
          },
        },
      },
      include: {
        posts: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    }),
  )
}

const upsertUser = async (user: Prisma.UserUncheckedCreateInput) =>
  errorBoundary(() =>
    prisma.user.upsert({
      create: user,
      update: user,
      where: { id: user.id },
    }),
  )

const upsertHeading = async (heading: Prisma.HeadingUncheckedCreateInput) =>
  errorBoundary(() =>
    prisma.heading.upsert({
      create: heading,
      update: heading,
      where: { date: heading.date },
    }),
  )

const updateHeading = async (
  headingId: number,
  data: Prisma.HeadingUpdateInput,
) =>
  errorBoundary(() =>
    prisma.heading.update({
      where: { id: headingId },
      data,
    }),
  )

const upsertPost = async (post: Prisma.PostUncheckedCreateInput) =>
  errorBoundary(() =>
    prisma.post.upsert({
      create: post,
      update: post,
      where: { userDate: { userId: post.userId, date: post.date } },
    }),
  )

const updatePost = async (postId: number, data: Prisma.PostUpdateInput) =>
  errorBoundary(() =>
    prisma.post.update({
      where: { id: postId },
      data,
    }),
  )

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

const getReminder = async (reminder: { userId: string; date: string }) => {
  return errorBoundary(() =>
    prisma.reminder.findUnique({
      where: {
        userDate: { userId: reminder.userId, date: new Date(reminder.date) },
      },
    }),
  )
}

const upsertReminder = async (reminder: Prisma.ReminderUncheckedCreateInput) =>
  errorBoundary(() =>
    prisma.reminder.upsert({
      create: reminder,
      update: reminder,
      where: { userDate: { userId: reminder.userId, date: reminder.date } },
    }),
  )

const updateReminder = async (
  reminderId: number,
  data: Prisma.ReminderUpdateInput,
) =>
  errorBoundary(() =>
    prisma.reminder.update({
      where: { id: reminderId },
      data,
    }),
  )

type AddPostOptions = {
  userId: string
  title: string
  date: string
}
const addPost = async (options: AddPostOptions): Promise<Post | Error> => {
  const post = await upsertPost(options)
  return post
}

type AddPostItemOptions = {
  postId: number
  channel: string
  ts: string
  text: string
}
const addPostItem = async (
  options: AddPostItemOptions,
): Promise<UpsertPostItemResult | Error> => {
  return upsertPostItem(options)
}

type DeletePostItemOptions = {
  channel: string
  ts: string
}

const deletePostItem = async (options: DeletePostItemOptions) => {
  const { channel, ts } = options
  return errorBoundary(() =>
    prisma.postItem.delete({
      where: { channelTs: { channel, ts } },
    }),
  )
}

type GetPostByIdOptions = {
  id: number
}

const getPostById = async (options: GetPostByIdOptions) => {
  const { id } = options
  return errorBoundary(() =>
    prisma.post.findUniqueOrThrow({
      where: { id },
    }),
  )
}

type GetPostWithItemsOptions = {
  userId: string
  date: string
}

const getPostWithItems = async (options: GetPostWithItemsOptions) => {
  const { userId, date } = options
  return errorBoundary(() =>
    prisma.post.findUnique({
      where: { userDate: { userId, date: new Date(date) } },
      include: {
        items: {
          orderBy: {
            ts: 'asc',
          },
        },
      },
    }),
  )
}

type PostWithItems = Extract<
  NonNullable<Awaited<ReturnType<typeof getPostWithItems>>>,
  Post
>

const upsertFormat = async (format: Prisma.FormatUncheckedCreateInput) => {
  return errorBoundary(() =>
    prisma.format.upsert({
      create: format,
      update: format,
      where: { id: format.id },
    }),
  )
}

const updateFormatDeletedAt = async (formatId: string) => {
  return errorBoundary(() =>
    prisma.format.update({
      data: { deletedAt: new Date() },
      where: { id: formatId },
    }),
  )
}

const getFormatList = async () => {
  return errorBoundary(async () =>
    prisma.format.findMany({
      include: {
        user: true,
      },
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
  )
}

export {
  getUserList,
  getActiveUserList,
  upsertUser,
  upsertHeading,
  updateHeading,
  upsertPost,
  updatePost,
  upsertReminder,
  updateReminder,
  getReminder,
  addPost,
  addPostItem,
  deletePostItem,
  getPostById,
  getPostWithItems,
  upsertFormat,
  updateFormatDeletedAt,
  getFormatList,
}

export type { PostWithItems }
