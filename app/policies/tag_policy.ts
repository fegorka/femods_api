import User from '#models/user'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import RoleService from '#services/role_service'
import Tag from '#models/tag'

export default class TagPolicy extends BasePolicy {
  @allowGuest()
  async index(_user: User): Promise<AuthorizerResponse> {
    return true
  }

  async store(user: User): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  @allowGuest()
  async show(_user: User, _tag: Tag): Promise<AuthorizerResponse> {
    return true
  }

  async update(user: User, _tag: Tag): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }

  async destroy(user: User, _tag: Tag): Promise<AuthorizerResponse> {
    return await RoleService.userHaveRoleCheck(['super'], user)
  }
}
