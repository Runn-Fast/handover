import { api } from './index.js'

export interface Person {
  id: number
  firstName: string
  lastName: string
  email: string
  archived: boolean
  references: Reference[]
  teamId: number | null
  tags: Tag[]
  holidaysGroupId: number | null
}

interface Reference {
  referenceName: string
  externalId: string
}

interface Tag {
  id: number
  name: string
}

export interface People {
  values: Person[]
  nextCursor: string
}

export const getPeople = async (cursor?: string) => {
  const endpoint = '/people/'
  const params = { limit: 50, cursor }

  try {
    const data = await api(endpoint, params)
    return data
  } catch (error) {
    console.error('Error fetching people:', error)
  }
}
