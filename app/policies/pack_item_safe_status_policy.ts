import User from '#models/user'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'

export default class PackItemSafeStatusPolicy extends BasePolicy {
  async index(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async store(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  @allowGuest()
  async show(): Promise<AuthorizerResponse> {
    return true
  }

  async update(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async destroy(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }
}
