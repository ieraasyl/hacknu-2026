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
  cityRequired: 'validation.cityRequired',
  cityMax: 'validation.cityMax',
  placeOfStudyRequired: 'validation.placeOfStudyRequired',
  placeOfStudyMax: 'validation.placeOfStudyMax',
  parentPhoneInvalid: 'validation.parentPhoneInvalid',
} as const;

// ── Email (login step 1) ─────────────────────────────────────────────────────
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, { error: V.emailRequired })
    .pipe(z.email({ error: V.invalidEmail })),
});

export type EmailInput = z.infer<typeof emailSchema>;

// ── OTP (login step 2) ──────────────────────────────────────────────────────
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { error: V.codeMustBe6Digits })
    .regex(/^\d{6}$/, { error: V.codeMustBe6Digits }),
});

export type OtpInput = z.infer<typeof otpSchema>;

const phoneRegex = /^\+?[\d][\d\s\-().]{5,24}$/;

// ── Onboarding ───────────────────────────────────────────────────────────────
export const onboardingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { error: V.fullNameRequired })
    .max(100, { error: V.fullNameMax }),
  iin: z.string().regex(/^\d{12}$/, { error: V.iinInvalid }),
  phone: z.string().min(1, { error: V.phoneRequired }).regex(phoneRegex, { error: V.phoneInvalid }),
  city: z.string().trim().min(1, { error: V.cityRequired }).max(100, { error: V.cityMax }),
  placeOfStudy: z
    .string()
    .trim()
    .min(1, { error: V.placeOfStudyRequired })
    .max(100, { error: V.placeOfStudyMax }),
  parentPhone: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined)
    .refine((v) => !v || phoneRegex.test(v), { message: V.parentPhoneInvalid }),
  educationLevel: z.enum(EDUCATION_LEVELS, { error: V.educationInvalid }),
  cvUrl: z
    .union([z.literal(''), z.url({ error: V.cvUrlInvalid })])
    .optional()
    .transform((v) => v || undefined),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// ── Team ─────────────────────────────────────────────────────────────────────
export const createTeamSchema = z.object({
  name: z.string().trim().min(3, { error: V.teamNameMin }).max(30, { error: V.teamNameMax }),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const inviteSlugSchema = z.object({
  slug: z
    .string()
    .min(1, { error: V.inviteCodeRequired })
    .max(50)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: V.inviteCodeInvalid }),
});

export type InviteSlugInput = z.infer<typeof inviteSlugSchema>;
