import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import User from '#models/user'
import UserStatus from '#models/user_status'

export default class UserStatusPolicy extends BasePolicy {
  async index(_user: User): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return true
  }

  async store(user: User): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async show(user: User, userStatus: UserStatus): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return user.userStatusId === userStatus.id || RoleService.userHaveRoleCheck(['super'], user)
  }

  async update(user: User, _userStatus: UserStatus): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async destroy(user: User, _userStatus: UserStatus): Promise<AuthorizerResponse> {
    if (this.isDisableOnDevelop) return true
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  private isDisableOnDevelop =
    env.get('POLICY_DISABLE_ON_DEVELOPMENT', false) && env.get('NODE_ENV') === 'development'
}
