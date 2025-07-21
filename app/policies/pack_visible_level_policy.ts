import User from '#models/user'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import PackVisibleLevel from '#models/pack_visible_level'

export default class PackVisibleLevelPolicy extends BasePolicy {
  async index(_user: User): Promise<AuthorizerResponse> {
    return true
  }

  async store(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  @allowGuest()
  async show(_user: User, _packVisibleLevel: PackVisibleLevel): Promise<AuthorizerResponse> {
    return true
  }

  async update(user: User, _packVisibleLevel: PackVisibleLevel): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async destroy(user: User, _packVisibleLevel: PackVisibleLevel): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }
}
