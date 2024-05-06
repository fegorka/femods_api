export default class HelperService {
  static cuidLength: number = 24
  static cuidRegex: RegExp = /[0-9a-km-zA-HJ-NP-Z]+$/

  static trimVersion(version: string): string {
    const segments = version.split('.')
    if (segments.length === 3 && segments[2] === '0') return segments.slice(0, 2).join('.')
    return version
  }
}
