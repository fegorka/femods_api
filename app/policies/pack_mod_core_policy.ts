import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import User from '#models/user'
import PackModCore from '#models/pack_mod_core'

export default class PackModCorePolicy extends BasePolicy {
  async index(_user: User): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return true
  }

  async store(user: User): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return await RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  @allowGuest()
  async show(_user: User, _packModCore: PackModCore): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return true
  }

  async update(user: User, _packModCore: PackModCore): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async destroy(user: User, _packModCore: PackModCore): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  private isDisableOnDevelop =
    env.get('POLICY_DISABLE_ON_DEVELOPMENT', false) && env.get('NODE_ENV') === 'development'
}
