const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remainingMs?: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  if (now - record.lastAttempt > WINDOW_MS) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remainingMs: WINDOW_MS - (now - record.lastAttempt),
    };
  }

  record.count++;
  record.lastAttempt = now;
  return { allowed: true };
}

export function resetRateLimit(identifier: string) {
  loginAttempts.delete(identifier);
}
