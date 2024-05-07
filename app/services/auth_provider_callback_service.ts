import User from '#models/user'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { SocialProviderNames, SocialProviderDrivers } from '@adonisjs/ally/types'
import hash from '@adonisjs/core/services/hash'

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

    const user = await User.updateOrCreate(findUserByProvider, userDetails)

    if (await hash.needsReHash(user.email)) {
      user.email = await hash.make(providerUserData.email)
      await user.save()
    }

    return await User.accessTokens.create(user)
  }
}
