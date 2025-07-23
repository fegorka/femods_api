import type { EnvKeysRequestSignSecretRequired } from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'
import vine from '@vinejs/vine'
import { RequestSignService } from '#services/request_sign_service'
import { MemoryStoreService } from '#services/memory_store_service'
import '#validation_macros/is_cuid_macro'

export default class VerifyMiddleware {
  async handle(
    { response, request }: HttpContext,
    next: NextFn,
    options: { secret: EnvKeysRequestSignSecretRequired } = { secret: 'REQUEST_SIGN_SECRET_SELF' }
  ) {
    if (
      env.get('REQUEST_SIGN_VERIFY_DISABLE_ON_DEVELOPMENT', false) &&
      env.get('NODE_ENV') === 'development'
    )
      return await next()

    try {
      await vine.validate({
        schema: vine.object({
          'x-signature-hash': vine.string().maxLength(64),
          'x-signature-timestamp': vine.number().positive().withoutDecimals().max(999999999999999),
          'x-signature-nonce': vine.string().cuid(),
        }),
        data: request.headers(),
      })
    } catch (error) {
      throw error
    }

    const signature = request.header('x-signature-hash')
    const timestamp = request.header('x-signature-timestamp')
    const nonce = request.header('x-signature-nonce')

    // timestamp as number correct bc vine.validate guarantees it
    if (Math.abs(Date.now() - (timestamp as unknown as number)) > 300_000) {
      return response.status(400).send({ error: 'Invalid timestamp' })
    }

    if (await MemoryStoreService.has(`reqeust.signature.nonce:${nonce}`)) {
      return response.status(409).send({ error: 'Nonce already used' })
    }

    const isValidSignature = RequestSignService.validateRequestSignature(
      {
        ...(request.body().data || undefined),
        ...{
          timestamp: timestamp,
          nonce: nonce,
        },
      },
      // signature as string correct bc vine.validate guarantees it
      signature as string,
      options.secret
    )

    if (!isValidSignature) {
      return response.status(401).send({ error: 'Invalid signature' })
    }

    await MemoryStoreService.set(`reqeust.signature.nonce:${nonce}`, '1', 300)
    return await next()
  }
}
