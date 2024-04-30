import vine from '@vinejs/vine'

export const requestParamsCuidValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine
        .string()
        .fixedLength(24)
        .regex(/[0-9a-km-zA-HJ-NP-Z]+$/),
    }),
  })
)
