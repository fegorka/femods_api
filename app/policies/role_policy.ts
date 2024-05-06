import User from '#models/user'
import Role from '#models/role'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'

export default class RolePolicy extends BasePolicy {
  async index(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  async store(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async show(user: User, role: Role): Promise<AuthorizerResponse> {
    return user.id === role.id || RoleService.userHaveRoleCheck(['extended', 'super'], user)
  }

  async update(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async destroy(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }
}
