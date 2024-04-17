import User from '#models/user'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { SocialProviderNames, SocialProviderDrivers } from '@adonisjs/ally/types'

export default class AuthProviderCallBackService {
  static async updateOrCreateUserAndGiveToken(
    provider: SocialProviderNames,
    providerUser: SocialProviderDrivers
  ): Promise<AccessToken> {
    const providerUserData = await providerUser.user()

    const findUserByProvider = {
      provider: provider.toLowerCase(),
      provider_id: providerUserData.id,
    }

    const userDetails = {
      name: providerUserData.nickName as string,
      avatar_url: providerUserData.avatarUrl as string,
      provider_id: providerUserData.id as string,
      provider: provider,
      email: providerUserData.email as string,
    }

    return await User.accessTokens.create(
      await User.updateOrCreate(findUserByProvider, userDetails)
    )
  }
}
