import { z } from 'zod';

export const EDUCATION_LEVELS = [
  'High School',
  "Bachelor's (in progress)",
  "Bachelor's",
  "Master's (in progress)",
  "Master's",
  'PhD (in progress)',
  'PhD',
  'Bootcamp Graduate',
  'Self-taught',
  'Other',
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

// Translation keys for validation messages (resolve with t() in UI).
const V = {
  emailRequired: 'validation.emailRequired',
  invalidEmail: 'validation.invalidEmail',
  codeMustBe6Digits: 'validation.codeMustBe6Digits',
  fullNameRequired: 'validation.fullNameRequired',
  fullNameMax: 'validation.fullNameMax',
  iinInvalid: 'validation.iinInvalid',
  phoneRequired: 'validation.phoneRequired',
  phoneInvalid: 'validation.phoneInvalid',
  educationInvalid: 'validation.educationInvalid',
  cvUrlInvalid: 'validation.cvUrlInvalid',
  teamNameMin: 'validation.teamNameMin',
  teamNameMax: 'validation.teamNameMax',
  inviteCodeRequired: 'validation.inviteCodeRequired',
  inviteCodeInvalid: 'validation.inviteCodeInvalid',
} as const;

// ── Email (login step 1) ─────────────────────────────────────────────────────
export const emailSchema = z.object({
  email: z.string().min(1, V.emailRequired).email(V.invalidEmail),
});

export type EmailInput = z.infer<typeof emailSchema>;

// ── OTP (login step 2) ──────────────────────────────────────────────────────
export const otpSchema = z.object({
  otp: z.string().length(6, V.codeMustBe6Digits).regex(/^\d{6}$/, V.codeMustBe6Digits),
});

export type OtpInput = z.infer<typeof otpSchema>;

// ── Onboarding ───────────────────────────────────────────────────────────────
export const onboardingSchema = z.object({
  fullName: z
    .string()
    .min(1, V.fullNameRequired)
    .max(100, V.fullNameMax)
    .transform((v) => v.trim()),
  iin: z.string().regex(/^\d{12}$/, V.iinInvalid),
  phone: z
    .string()
    .min(1, V.phoneRequired)
    .regex(/^\+?[\d][\d\s\-().]{5,24}$/, V.phoneInvalid),
  educationLevel: z
    .string()
    .refine(
      (v): v is EducationLevel => (EDUCATION_LEVELS as readonly string[]).includes(v),
      V.educationInvalid,
    ),
  cvUrl: z
    .string()
    .url(V.cvUrlInvalid)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// ── Team ─────────────────────────────────────────────────────────────────────

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(3, V.teamNameMin)
    .max(30, V.teamNameMax)
    .transform((v) => v.trim()),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const inviteSlugSchema = z.object({
  slug: z
    .string()
    .min(1, V.inviteCodeRequired)
    .max(50)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, V.inviteCodeInvalid),
});

export type InviteSlugInput = z.infer<typeof inviteSlugSchema>;
