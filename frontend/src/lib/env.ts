/**
 * NEXHIRE AI — Runtime environment validation.
 * Surface missing/misconfigured env vars at startup, not at runtime.
 * Public (NEXT_PUBLIC_*) values are safe to ship to the browser.
 */

const REQUIRED_PUBLIC = ['NEXT_PUBLIC_API_BASE_URL'] as const;

const REQUIRED_PUBLIC_REGEX: Record<string, RegExp> = {
  NEXT_PUBLIC_API_BASE_URL: /^https?:\/\/.+$/,
};

let validated = false;

/** Throw at first use if any required public env is missing or malformed. */
export function assertEnv(): void {
  if (validated) return;
  const errors: string[] = [];

  for (const key of REQUIRED_PUBLIC) {
    const value = process.env[key];
    if (!value) {
      errors.push(`Missing required env var: ${key}`);
      continue;
    }
    const rule = REQUIRED_PUBLIC_REGEX[key];
    if (rule && !rule.test(value)) {
      errors.push(`Env var ${key} has invalid format: "${value}"`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `[NEXHIRE] Environment validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }
  validated = true;
}

export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'NEXHIRE AI',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api',
  googleClientId: process.env.NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID ?? '',
  microsoftClientId: process.env.NEXT_PUBLIC_OAUTH_MICROSOFT_CLIENT_ID ?? '',
} as const;
