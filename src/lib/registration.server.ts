import { env } from 'cloudflare:workers';

import { REGISTRATION_CLOSED_I18N_KEY } from './registration';

export { REGISTRATION_CLOSED_I18N_KEY };

interface AppEnv {
  REGISTRATION_DEADLINE?: string;
}

export function getRegistrationDeadline(): Date | null {
  const raw = (env as unknown as AppEnv).REGISTRATION_DEADLINE?.trim();
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) {
    console.warn(
      '[registration] REGISTRATION_DEADLINE is set but could not be parsed as a date; treating registration as open.',
      { raw },
    );
    return null;
  }
  return d;
}

export function isRegistrationOpen(): boolean {
  const deadline = getRegistrationDeadline();
  return deadline ? Date.now() < deadline.getTime() : true;
}
