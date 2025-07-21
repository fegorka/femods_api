import type { EnvKeysRequestSignSecretRequired } from '#start/env'

import env from '#start/env'
import { cuid } from '@adonisjs/core/helpers'
import { createHmac } from 'node:crypto'

type RequestSignMeta = {
  timestamp: string
  nonce: string
}

export class RequestSignService {
  static generateSignature<T extends object & { signMeta: RequestSignMeta }>(
    payload: T,
    secret: string
  ): string {
    const serializedPayload = JSON.stringify(payload, Object.keys(payload).sort())
    return createHmac('sha256', secret).update(serializedPayload).digest('hex')
  }

  static validateRequestSignature<
    T extends object & {
      signMeta: RequestSignMeta
    },
  >(payload: T, signature: string, secret: EnvKeysRequestSignSecretRequired): boolean {
    // env.get as string correct bc EnvKeysRequestSignSecretRequired & adonis env guarantees key & value is exist
    return this.generateSignature(payload, env.get(secret) as string) === signature
  }

  static generateSignMeta(): RequestSignMeta {
    return { timestamp: Date.now().toString(), nonce: cuid() }
  }

  static generateSelfRequestSignature<
    T extends object & {
      signMeta: RequestSignMeta
    },
  >(payload: T) {
    // env.get as string correct bc adonis env guarantees key & value is exist
    return this.generateSignature(payload, env.get('REQUEST_SIGN_SECRET_SELF') as string)
  }

  static generateRequestSignature<
    T extends object & {
      signMeta: RequestSignMeta
    },
  >(payload: T, secret: EnvKeysRequestSignSecretRequired) {
    // env.get as string correct bc EnvKeysRequestSignSecretRequired & adonis env guarantees key & value is exist
    return this.generateSignature(payload, env.get(secret) as string)
  }
}
