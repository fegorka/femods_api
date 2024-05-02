/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const GameVersionsController = () => import('#controllers/game_versions_controller')
const UsersController = () => import('#controllers/users_controller')

const providers: RegExp = /discord|github/

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .get('auth/:provider/redirect', '#controllers/auth_controller.loginProviderRedirect')
  .where('provider', providers)
router
  .get('auth/:provider/callback', '#controllers/auth_controller.loginProviderHandleCallback')
  .where('provider', providers)

router
  .post('auth/logout/self', '#controllers/auth_controller.logoutSelf')
  .use(middleware.auth({ guards: ['api'] }))

router
  .post('auth/logout/everywhere', '#controllers/auth_controller.logoutEverywhere')
  .use(middleware.auth({ guards: ['api'] }))

router
  .resource('users', UsersController)
  .except(['create', 'edit', 'store'])
  .use(['index', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

router
  .resource('gameversions', GameVersionsController)
  .except(['create', 'edit'])
  .use(['index', 'store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))
