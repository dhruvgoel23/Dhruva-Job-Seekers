export interface OtpSession {
  code: string;
  destination: string; // phone or email
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

export const OTP_CONFIG = {
  CODE_LENGTH: 6,
  EXPIRY_SECONDS: 300, // 5 minutes
  RESEND_COOLDOWN_SECONDS: 45,
  MAX_VERIFICATION_ATTEMPTS: 5,
  HOURLY_RATE_LIMIT: 4,
};

export function generateRandomOtpCode(length: number = OTP_CONFIG.CODE_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export function createOtpSession(destination: string, overrideCode?: string): OtpSession {
  const now = Date.now();
  return {
    code: overrideCode || generateRandomOtpCode(),
    destination,
    createdAt: now,
    expiresAt: now + OTP_CONFIG.EXPIRY_SECONDS * 1000,
    attempts: 0,
    maxAttempts: OTP_CONFIG.MAX_VERIFICATION_ATTEMPTS,
  };
}

export function verifyOtpCode(
  session: OtpSession,
  inputCode: string,
  currentTime: number = Date.now()
): {
  success: boolean;
  error?: string;
  remainingAttempts: number;
  isExpired: boolean;
} {
  if (currentTime > session.expiresAt) {
    return {
      success: false,
      error: 'OTP code has expired. Please request a new one.',
      remainingAttempts: 0,
      isExpired: true,
    };
  }

  if (session.attempts >= session.maxAttempts) {
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Please request a new code.',
      remainingAttempts: 0,
      isExpired: false,
    };
  }

  session.attempts += 1;

  const sanitizedInput = inputCode.trim();
  if (sanitizedInput === session.code) {
    return {
      success: true,
      remainingAttempts: session.maxAttempts - session.attempts,
      isExpired: false,
    };
  }

  const remaining = Math.max(0, session.maxAttempts - session.attempts);
  return {
    success: false,
    error: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    remainingAttempts: remaining,
    isExpired: false,
  };
}

export function getResendCooldownRemaining(
  lastSentAt: number,
  cooldownSeconds: number = OTP_CONFIG.RESEND_COOLDOWN_SECONDS,
  currentTime: number = Date.now()
): number {
  const elapsedSeconds = Math.floor((currentTime - lastSentAt) / 1000);
  return Math.max(0, cooldownSeconds - elapsedSeconds);
}

export function isRateLimited(
  sendTimestamps: number[],
  limit: number = OTP_CONFIG.HOURLY_RATE_LIMIT,
  windowMs: number = 60 * 60 * 1000,
  currentTime: number = Date.now()
): boolean {
  const recentSends = sendTimestamps.filter((ts) => currentTime - ts <= windowMs);
  return recentSends.length >= limit;
}
