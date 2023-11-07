import { test, expect, describe } from 'vitest'
import { findPerson } from './people.js'
import { Person } from 'src/api/people.js'

const peopleResponse: Person[] = [
  {
    id: 2832,
    firstName: 'Andria',
    lastName: 'Hibe',
    email: 'andria+runn@runn.io',
    archived: false,
    references: [],
    teamId: null,
    tags: [],
    holidaysGroupId: null,
  },
  {
    id: 25032,
    firstName: 'Zehavit',
    lastName: 'Zaslansky',
    email: 'zehavit+runn@runn.io',
    archived: false,
    references: [],
    teamId: 63,
    tags: [
      {
        id: 21,
        name: 'Powlowskicester',
      },
    ],
    holidaysGroupId: null,
  },
  {
    id: 19859,
    firstName: 'Aaron',
    lastName: 'Carlino',
    email: 'aaron+runn@runn.io',
    archived: false,
    references: [],
    teamId: 63,
    tags: [],
    holidaysGroupId: null,
  },
]

describe('findPerson', () => {
  test('finds a person by full name', async () => {
    const person = findPerson('Aaron Carlino', peopleResponse)
    expect(person?.firstName).toEqual('Aaron')
  })

  test('finds a person by first name in lowercase', async () => {
    const person = findPerson('andria', peopleResponse)
    expect(person?.firstName).toEqual('Andria')
  })

  test('finds a person by first name in uppercase', async () => {
    const person = findPerson('Zehavit', peopleResponse)
    expect(person?.firstName).toEqual('Zehavit')
  })
})
