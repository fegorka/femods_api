import User from '#models/user'

export default class RoleService {
  static async userHaveRoleCheck(roleNames: string[], user: User | null): Promise<boolean> {
    if (user === null) return false
    const userRoles = await user.related('roles').query().wherePivot('user_id', user.id)
    return userRoles.some((role) => roleNames.includes(role.name))
  }
}
