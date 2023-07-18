import type { User, Post, PostItem } from '@prisma/client'

export type UserWithPosts = User & { posts: Post[] }
export type PostWithItems = Post & { items: PostItem[] }
