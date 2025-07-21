import { VineString } from '@vinejs/vine'
import { isCuidRule } from '#validation_rules/is_cuid_rule'

VineString.macro('cuid', function (this: VineString) {
  return this.use(isCuidRule())
})

declare module '@vinejs/vine' {
  interface VineString {
    /**
     * Validates the field as a CUID.
     */
    cuid(): this
  }
}
