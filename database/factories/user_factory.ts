import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { PackFactory } from '#database/factories/pack_factory'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    const truncateString = (str: string, maxLength: number) =>
      str.length > maxLength ? str.slice(0, maxLength) : str
    return {
      name: truncateString(faker.internet.displayName(), 32),
      publicName: truncateString(faker.internet.userName(), 32),
      avatarUrl: `${faker.internet.url({ appendSlash: false })}/avatar.png`,

      provider: faker.helpers.arrayElement(['discord', 'github']),
      providerId: faker.string.uuid(),

      email: faker.internet.email(),
    }
  })
  .state('withoutPublicName', (instance) => (instance.publicName = null))
  .relation('packs', () => PackFactory)
  .build()
