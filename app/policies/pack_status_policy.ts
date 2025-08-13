import User from '#models/user'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import PackStatus from '#models/pack_status'

export default class PackStatusPolicy extends BasePolicy {
  async index(_user: User): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return true
  }

  async store(user: User): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  @allowGuest()
  async show(_user: User, _packStatus: PackStatus): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return true
  }

  async update(user: User, _packStatus: PackStatus): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async destroy(user: User, _packStatus: PackStatus): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  private isDisableOnDevelop =
    env.get('POLICY_DISABLE_ON_DEVELOPMENT', false) && env.get('NODE_ENV') === 'development'
}
