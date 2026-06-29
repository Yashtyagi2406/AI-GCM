/**
 * TOTP MFA provider — Phase 3 stub.
 * SRS §14.1: Full MFA (TOTP, hardware keys) is planned for Phase 3.
 * Phase 1 ships with email+password only.
 */

export function generateTotpSecret(_userId: string): never {
  throw new Error('MFA is not yet enabled. This is a Phase 3 feature.')
}

export function verifyTotp(_secret: string, _token: string): never {
  throw new Error('MFA is not yet enabled. This is a Phase 3 feature.')
}
