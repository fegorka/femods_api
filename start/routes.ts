/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .get('auth/:provider/redirect', '#controllers/auth_social_providers_controller.redirect')
  .where('provider', /discord|github/)
router
  .get('auth/:provider/callback', '#controllers/auth_social_providers_controller.handleCallback')
  .where('provider', /discord|github/)

// TODO: need added token guard, not params, this just for test
//router
//  .get('auth/tokensRevoke/:userId', '#controllers/auth_social_providers_controller.tokensRevoke')
//  .where('userId', /[a-z0-9]{24}/)
