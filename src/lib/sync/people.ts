import { Person, getPeople } from 'src/api/people.js'

interface PersonFound {
  id: number
  firstName?: string
}

export const findPerson = (
  userName: string,
  people: Person[],
): PersonFound | null => {
  const [firstName, _] = userName.split(' ')
  const person = people.find((person) => {
    return person.firstName.toLowerCase() === firstName?.toLowerCase()
  })
  return person
    ? {
        id: person.id,
        firstName: person.firstName,
      }
    : null
}

export const findPeopleFromList = async (
  userName: string,
  cursor?: string,
  count: number = 1,
): Promise<PersonFound | null> => {
  console.log(`findPeopleFromList called ${count} times`)

  const response = await getPeople(cursor)

  if (!response || !response.values) {
    console.error('Failed to fetch people or response is malformed.')
    return null
  }

  const personFound = findPerson(userName, response.values)

  if (personFound) {
    return personFound
  } else if (response.nextCursor) {
    return findPeopleFromList(userName, response.nextCursor, count + 1)
  }

  // the person is not found and there is no next cursor
  return null
}

// 1. findPeopleFromList(userName)
// 2-a. could not find person -> enter Runn ID manually
// 2-b. found person -> fetch timeOffs with the person ID
