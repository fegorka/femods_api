import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'

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
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
