import type { HttpContext } from '@adonisjs/core/http'
import AuthProviderCallBackService from '#services/auth_provider_callback_service'
import { SocialProviderNames } from '@adonisjs/ally/types'
import { AccessToken } from '@adonisjs/auth/access_tokens'

export default class AuthSocialProvidersController {
  async redirect({ ally, params }: HttpContext) {
    return ally.use(params.provider as SocialProviderNames).redirect()
  }

  async handleCallback({ ally, params }: HttpContext) {
    const provider: SocialProviderNames = params.provider
    const providerUser = ally.use(provider)

    if (providerUser.accessDenied()) {
      return 'Access was denied'
    }
    if (providerUser.stateMisMatch()) {
      return 'Request expired. try again'
    }
    if (providerUser.hasError()) {
      return providerUser.getError()
    }

    return await AuthProviderCallBackService.updateOrCreateUserAndGiveToken(provider, providerUser)
  }
}
