import pkg, { Prisma, PostItem, User } from '@prisma/client'
import * as dateFns from 'date-fns'
import { default as dateFnsTz } from 'date-fns-tz'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

const upsertUser = (user: Prisma.UserUncheckedCreateInput) => {
  return prisma.user.upsert({
    create: user,
    update: user,
    where: { id: user.id },
  })
}

const upsertHeading = (heading: Prisma.HeadingUncheckedCreateInput) => {
  return prisma.heading.upsert({
    create: heading,
    update: heading,
    where: { date: heading.date },
  })
}

const updateHeading = (headingId: number, data: Prisma.HeadingUpdateInput) => {
  return prisma.heading.update({
    where: { id: headingId },
    data,
  })
}

const upsertPost = (post: Prisma.PostUncheckedCreateInput) => {
  return prisma.post.upsert({
    create: post,
    update: post,
    where: { userDate: { userId: post.userId, date: post.date } },
  })
}

const updatePost = (postId: number, data: Prisma.PostUpdateInput) => {
  return prisma.post.update({
    where: { id: postId },
    data,
  })
}

const upsertPostItem = (postItem: Prisma.PostItemUncheckedCreateInput) => {
  return prisma.postItem.upsert({
    create: postItem,
    update: postItem,
    where: { channelTs: { channel: postItem.channel, ts: postItem.ts } },
  })
}

const getUser = async (userId: string): Promise<User> => {
  return prisma.user.findUnique({
    where: { id: userId },
    rejectOnNotFound: true,
  })
}

const getDateFromTs = (ts: string, timeZone: string): string => {
  const zonedDate = dateFnsTz.utcToZonedTime(
    dateFns.fromUnixTime(Number.parseInt(ts)),
    timeZone,
  )
  return (
    dateFns.formatISO(zonedDate, { representation: 'date' }) + 'T00:00:00+00:00'
  )
}

type AddPostItemOptions = {
  userId: string
  channel: string
  ts: string
  text: string
}
const addPostItem = async (options: AddPostItemOptions): Promise<PostItem> => {
  const { userId, channel, ts, text } = options

  const user = await getUser(userId)
  const date = getDateFromTs(ts, user.timeZone)

  const post = await upsertPost({
    userId,
    title: user.name,
    date,
  })

  const postItem = await upsertPostItem({
    text,
    postId: post.id,
    channel,
    ts,
  })

  return postItem
}

type DeletePostItemOptions = {
  channel: string
  ts: string
}

const deletePostItem = (options: DeletePostItemOptions) => {
  const { channel, ts } = options
  return prisma.postItem.delete({
    where: { channelTs: { channel, ts } },
  })
}

const getLatestPostWithItems = (options: { userId: string }) => {
  const { userId } = options
  return prisma.post.findFirst({
    where: { userId },
    orderBy: {
      date: 'desc',
    },
    include: {
      items: {
        orderBy: {
          ts: 'asc',
        },
      },
    },
  })
}

type PostWithItems = NonNullable<
  Awaited<ReturnType<typeof getLatestPostWithItems>>
>

export {
  upsertUser,
  upsertHeading,
  updateHeading,
  upsertPost,
  updatePost,
  addPostItem,
  deletePostItem,
  getLatestPostWithItems,
}
export type { PostWithItems }
