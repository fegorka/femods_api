import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { cuid } from '@adonisjs/core/helpers'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare public_id: string

  @column()
  declare avatarUrl: string

  @column()
  declare name: string | null

  @column()
  declare public_name: string

  @column()
  declare providerId: string

  @column()
  declare provider: string

  @column()
  declare email: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeCreate()
  static async addIdHook(user: User) {
    user.id = cuid()
  }

  @beforeCreate()
  static async addPublicIdHook(user: User) {
    user.public_id = cuid()
  }

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'fefo_',
    tokenSecretLength: 60,
  })

  //  static get primaryKey() {
  //    return 'id'
  //  }

  //  static get incrementing() {
  //    return false
  //  }
}
