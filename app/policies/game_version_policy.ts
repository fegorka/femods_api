import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import User from '#models/user'
import GameVersion from '#models/game_version'

export default class GameVersionPolicy extends BasePolicy {
  async index(_user: User): Promise<AuthorizerResponse> {
    return true
  }

  async store(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  @allowGuest()
  async show(_user: User, _gameVersion: GameVersion): Promise<AuthorizerResponse> {
    return true
  }

  async update(user: User, _gameVersion: GameVersion): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async destroy(user: User, _gameVersion: GameVersion): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }
}
