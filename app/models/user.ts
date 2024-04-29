import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import {
  afterCreate,
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { cuid } from '@adonisjs/core/helpers'
import Pack from '#models/pack'
import Role from '#models/role'
import UserStatus from '#models/user_status'

//import { compose } from '@adonisjs/core/helpers'
//import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
//import hash from '@adonisjs/core/services/hash'
//const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
//  uids: ['email'],
//  passwordColumnName: 'password',
//})
//export default class User extends compose(BaseModel, AuthFinder) {

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare publicId: string

  @column()
  declare avatarUrl: string

  @column()
  declare name: string | null

  @column()
  declare publicName: string | null

  @column()
  declare providerId: string

  @column()
  declare provider: string

  @column()
  declare email: string

  @column()
  declare userStatusId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => UserStatus)
  declare userStatus: BelongsTo<typeof UserStatus>

  @hasMany(() => Pack)
  declare packs: HasMany<typeof Pack>

  @manyToMany(() => Role)
  declare roles: ManyToMany<typeof Role>

  @afterCreate()
  static async assignRole(user: User) {
    const defaultRole = await Role.findByOrFail({ name: 'default' })
    await user.related('roles').attach([defaultRole.id])
  }

  @beforeCreate()
  static async assignStatus(user: User) {
    const defaultStatus = await UserStatus.findByOrFail({ name: 'default' })
    user.userStatusId = defaultStatus.id
  }

  @beforeCreate()
  static async assignId(instance: User) {
    instance.id = cuid()
  }

  @beforeCreate()
  static async assignPublicId(instance: User) {
    instance.publicId = cuid()
  }

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'fefo_',
    tokenSecretLength: 60,
  })
}
