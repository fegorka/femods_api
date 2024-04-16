import User from '#models/user'
import { DiscordDriver } from '@adonisjs/ally/drivers/discord'
import { GithubDriver } from '@adonisjs/ally/drivers/github'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { SocialProviderNames } from '@adonisjs/ally/types'

export default class AuthProviderCallBackService {
  static async updateOrCreateUserAndGiveToken(
    provider: SocialProviderNames,
    providerUser: DiscordDriver | GithubDriver
  ): Promise<AccessToken> {
    const providerUserData = await providerUser.user()

    const findUser = {
      provider: provider.toLowerCase(),
      provider_id: providerUserData.id,
    }

    const userDetails = {
      name: providerUserData.nickName as string,
      public_name: providerUserData.name as string,
      avatar_url: providerUserData.avatarUrl as string,
      provider_id: providerUserData.id as string,
      provider: provider,
      email: providerUserData.email as string,
    }

    return await User.accessTokens.create(await User.updateOrCreate(findUser, userDetails))
  }
}
