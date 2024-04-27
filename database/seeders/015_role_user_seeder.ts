import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import User from '#models/user'

export default class extends BaseSeeder {
  static environment = ['development']
  async run() {
    const users = await User.all()
    const defaultRole = await Role.findByOrFail({ name: 'default' })

    for (const user of users) {
      if (
        (await User.query()
          .where('id', user.id)
          .andHas('roles')
          .where('name', 'default')
          .first()) !== null
      )
        return
      await user.related('roles').attach([defaultRole.id])
    }
    // ⚠️ using another loop causes an "error: aborted" (work with database connections pool)
    // in some package (maybe knex) contained in lucid
  }
}
