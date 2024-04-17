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

const providers: RegExp = /discord|github/

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .get(
    'auth/:provider/redirect',
    '#controllers/auth_social_providers_controller.loginProviderRedirect'
  )
  .where('provider', providers)
router
  .get(
    'auth/:provider/callback',
    '#controllers/auth_social_providers_controller.loginProviderHandleCallback'
  )
  .where('provider', providers)

router.post('auth/logout/self', '#controllers/auth_social_providers_controller.logoutSelf').use(
  middleware.auth({
    guards: ['api'],
  })
)

router
  .post('auth/logout/everywhere', '#controllers/auth_social_providers_controller.logoutEverywhere')
  .use(
    middleware.auth({
      guards: ['api'],
    })
  )
