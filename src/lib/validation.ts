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

// ── Email (login step 1) ─────────────────────────────────────────────────────
export const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export type EmailInput = z.infer<typeof emailSchema>;

// ── OTP (login step 2) ──────────────────────────────────────────────────────
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export type OtpInput = z.infer<typeof otpSchema>;

// ── Onboarding ───────────────────────────────────────────────────────────────
export const onboardingSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be 100 characters or fewer')
    .transform((v) => v.trim()),
  iin: z.string().regex(/^\d{12}$/, 'IIN must be exactly 12 digits'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d][\d\s\-().]{5,24}$/, 'Enter a valid phone number (e.g. +7 700 000 0000)'),
  educationLevel: z
    .string()
    .refine(
      (v): v is EducationLevel => (EDUCATION_LEVELS as readonly string[]).includes(v),
      'Select a valid education level',
    ),
  cvUrl: z
    .string()
    .url('CV URL is not valid')
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
