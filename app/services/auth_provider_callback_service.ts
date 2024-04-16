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
      // email: providerUserData.email as string,
    }

    const userDetails = {
      name: providerUserData.nickName as string,
      public_name: providerUserData.name as string,
      avatar_url: providerUserData.avatarUrl as string,
      provider_id: providerUserData.id as string,
      provider: provider,
      email: providerUserData.email as string,
    }

    //const user = await User.updateOrCreate(findUser, userDetails)
    //return await User.accessTokens.create(user)
    return await this.refreshAndReturnUserToken(await User.updateOrCreate(findUser, userDetails))
  }

  private static async refreshAndReturnUserToken(user: User): Promise<AccessToken> {
    // TODO: need checking like if token exist – delete, because we can't create more then 1 token for 1 user
    /* if (
      (await database
        .from('access_tokens')
        .where('tokenable_id', user.id)
        .select('id')
        .firstOrFail()) !== null
    ) {
      await database.from('acess_tokens').where('tokenable_id', user.id).delete()
    }
    */
    return await User.accessTokens.create(user)
  }
}
