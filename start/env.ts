/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export type EnvKeysAppRequired = keyof typeof envSchemaAppRequired
const envSchemaAppRequired = {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),
}

export type EnvKeysAppOptional = keyof typeof envSchemaAppOptional
const envSchemaAppOptional = {}

export type EnvKeysRequestSignSecretRequired = keyof typeof envSchemaRequestSignSecretRequired
const envSchemaRequestSignSecretRequired = {
  REQUEST_SIGN_SECRET_SELF: Env.schema.string(),
  REQUEST_SIGN_SECRET_FEMODS: Env.schema.string(),
  REQUEST_SIGN_SECRET_FEID: Env.schema.string(),
}

export type EnvKeysRequestSignSecretOptional = keyof typeof envSchemaRequestSignSecretOptional
const envSchemaRequestSignSecretOptional = {
  REQUEST_SIGN_DISABLE_ON_DEVELOPMENT: Env.schema.boolean.optional(),
}

export type EnvKeysDatabaseRequired = keyof typeof envSchemaDatabaseRequired
const envSchemaDatabaseRequired = {
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_DATABASE: Env.schema.string(),
}

export type EnvKeysDatabaseOptional = keyof typeof envSchemaDatabaseOptional
const envSchemaDatabaseOptional = {
  DB_PASSWORD: Env.schema.string.optional(),
}

export type EnvKeysRedisRequired = keyof typeof envSchemaRedisRequired
const envSchemaRedisRequired = {
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),
}

export type EnvKeysRedisOptional = keyof typeof envSchemaRedisOptional
const envSchemaRedisOptional = {}

export type EnvKeysDiscordRequired = keyof typeof envSchemaDiscordRequired
const envSchemaDiscordRequired = {
  DISCORD_CLIENT_ID: Env.schema.string(),
  DISCORD_CLIENT_SECRET: Env.schema.string(),
  GITHUB_CLIENT_ID: Env.schema.string(),
  GITHUB_CLIENT_SECRET: Env.schema.string(),
}

export type EnvKeysDiscordOptional = keyof typeof envSchemaDiscordOptional
const envSchemaDiscordOptional = {}

export type EnvKeysAllRequired = keyof typeof envSchemaAllRequired
const envSchemaAllRequired = {
  ...envSchemaAppRequired,
  ...envSchemaDatabaseRequired,
  ...envSchemaRequestSignSecretRequired,
  ...envSchemaRedisRequired,
  ...envSchemaDiscordRequired,
}

export type EnvKeysAllOptional = keyof typeof envSchemaAllOptional
const envSchemaAllOptional = {
  ...envSchemaAppOptional,
  ...envSchemaDatabaseOptional,
  ...envSchemaRequestSignSecretOptional,
  ...envSchemaRedisOptional,
  ...envSchemaDiscordOptional,
}

export default await Env.create(new URL('../', import.meta.url), {
  ...envSchemaAllRequired,
  ...envSchemaAllOptional,
})
