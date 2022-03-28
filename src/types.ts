export type Message = {
  message?: Message
  previous_message?: Message
  subtype?: string | undefined
  text?: string
  ts: string
  user?: string
}

export type MessageAction = {
  user: string
  userName?: string
  ts?: string
  text?: string
  previousText?: string
}

export type AddAction = MessageAction & {
  type: 'ADD'
}

export type RemoveAction = MessageAction & {
  type: 'REMOVE'
}

export type ChangeAction = MessageAction & {
  type: 'CHANGE'
}

export type ResetAction = MessageAction & {
  type: 'RESET'
}

export type TitleAction = MessageAction & {
  type: 'TITLE'
}

export type RemindAction = MessageAction & {
  type: 'REMIND'
}

export type Action =
  | AddAction
  | RemoveAction
  | ChangeAction
  | ResetAction
  | TitleAction
  | RemindAction

export type PostItem = {
  sourceTs: string
  text: string
}

export type UserPost = {
  type: 'USER'
  date: number
  user: string
  title: string
  items: PostItem[]
}

export type HandoverPost = {
  type: 'HANDOVER'
  date: number
  title: string
}

export type RemindPost = {
  type: 'REMIND'
  user: string
}

export type Post = UserPost | HandoverPost | RemindPost

export type UserPostMap = Map<string, UserPost>

export type PublicContent = {
  type: 'PUBLIC'
  id: string
  text: string
}

export type PrivateContent = {
  type: 'PRIVATE'
  user: string
  text: string
}

export type Content = PublicContent | PrivateContent

export type TeamConfig = {
  title: string
  timezone: string
  schedule: string
  remindAt: string
  users: string[]
}

export type Team = {
  title: string
  timezone: string
  schedule: string
  remindAt: string
  users: string[]
}

export type UserNameFetcher = (user: string) => Promise<string>

export type Store = {
  getDate: () => Promise<number>
  setDate: (date: number) => Promise<void>

  getUserPost: (user: string) => Promise<UserPost>
  setUserPost: (user: string, value: UserPost) => Promise<void>
  delUserPost: (user: string) => Promise<void>

  getContentTs: (id: string) => Promise<string>
  setContentTs: (id: string, value: string) => Promise<void>
  delContentTs: (id: string) => Promise<void>
}
