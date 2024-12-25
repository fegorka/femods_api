import User from '#models/user'
import UserStatus from '#models/user_status'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'

export default class UserStatusPolicy extends BasePolicy {
  async index(): Promise<AuthorizerResponse> {
    return true
  }

  async store(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async show(user: User, userStatus: UserStatus): Promise<AuthorizerResponse> {
    return user.userStatusId === userStatus.id || RoleService.userHaveRoleCheck(['super'], user)
  }

  async update(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async destroy(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }
}
