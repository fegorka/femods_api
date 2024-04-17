import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'
import { DiscordDriver } from '@adonisjs/ally/drivers/discord'
import { GithubDriver } from '@adonisjs/ally/drivers/github'

const allyConfig = defineConfig({
  discord: services.discord({
    clientId: env.get('DISCORD_CLIENT_ID'),
    clientSecret: env.get('DISCORD_CLIENT_SECRET'),
    callbackUrl: '',
    scopes: ['identify', 'email'],
  }),
  github: services.github({
    clientId: env.get('GITHUB_CLIENT_ID'),
    clientSecret: env.get('GITHUB_CLIENT_SECRET'),
    callbackUrl: '',
    scopes: ['user'],
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  type SocialProviderNames = 'discord' | 'github'
  type SocialProviderDrivers = DiscordDriver | GithubDriver
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
