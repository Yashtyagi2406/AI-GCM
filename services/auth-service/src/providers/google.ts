/**
 * Google OAuth2 provider — Phase 3 stub.
 * SRS §14.1: "SSO: Okta, Azure AD, Google Workspace, SAML 2.0, OIDC."
 * Full implementation is planned for Phase 3 (Months 9–15).
 */

export function getGoogleAuthUrl(): string {
  throw new Error('Google OAuth2 is not yet configured. Please use email/password login.')
}

export async function handleGoogleCallback(_code: string): Promise<never> {
  throw new Error('Google OAuth2 is not yet configured. This is a Phase 3 feature.')
}
