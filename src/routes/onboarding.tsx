import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useState } from 'react';
import { getSession } from '../lib/auth.server';
import {
  getParticipant,
  upsertParticipant,
  uploadCvToGas,
  deleteCvFromGas,
} from '../lib/onboarding.server';
import { onboardingSchema, EDUCATION_LEVELS } from '../lib/validation';
import { CvDropzone } from '../components/ui/cv-dropzone';
import { useSession, signOut } from '../lib/auth-client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Field, FieldLabel, FieldDescription, FieldError } from '../components/ui/field';
import { Separator } from '../components/ui/separator';
import { TerminalDots } from '../components/ui/terminal-dots';
import { BackgroundGrid, GradientOrbs } from '../components/ui/background';
import { StepBadge } from '../components/ui/step-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

/* ─── Server Functions ─── */

const checkOnboardingStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest();
  const session = await getSession(request);
  if (!session) {
    throw redirect({ to: '/login', search: { redirect: undefined } });
  }
  const profile = await getParticipant(session.user.id);
  if (profile) {
    throw redirect({ to: '/dashboard' });
  }
  return { userId: session.user.id, name: session.user.name };
});

type OnboardingInput = {
  fullName: string;
  iin: string;
  phone: string;
  educationLevel: string;
  cvUrl?: string;
};

const uploadCv = createServerFn({ method: 'POST' })
  .inputValidator(
    (input: { fileName: string; mimeType: string; data: string; fullName: string; iin: string }) =>
      input,
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await getSession(request);
    if (!session) throw new Error('Unauthorized');
    return uploadCvToGas(data);
  });

const deleteCv = createServerFn({ method: 'POST' })
  .inputValidator((input: { fileId: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await getSession(request);
    if (!session) throw new Error('Unauthorized');
    await deleteCvFromGas(data.fileId);
  });

const saveOnboarding = createServerFn({ method: 'POST' })
  .inputValidator((data: OnboardingInput): OnboardingInput => {
    const parsed = onboardingSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0].message);
    }
    return parsed.data as unknown as OnboardingInput;
  })
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await getSession(request);
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: undefined } });
    }
    await upsertParticipant({
      userId: session.user.id,
      fullName: data.fullName,
      iin: data.iin,
      phone: data.phone,
      educationLevel: data.educationLevel,
      cvUrl: data.cvUrl || null,
    });
    throw redirect({ to: '/dashboard' });
  });

/* ─── Route ─── */

export const Route = createFileRoute('/onboarding')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: async () => {
    await checkOnboardingStatus();
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();
  const safeRedirect = redirectTo?.startsWith('/invite/') ? redirectTo : undefined;

  const [fullName, setFullName] = useState(session?.user?.name ?? '');
  const [iin, setIin] = useState('');
  const [phone, setPhone] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation with shared Zod schema
    const parsed = onboardingSchema.safeParse({
      fullName,
      iin,
      phone,
      educationLevel,
      cvUrl: cvUrl ?? '',
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await saveOnboarding({
        data: { fullName, iin, phone, educationLevel, cvUrl: cvUrl ?? undefined },
      });
      // If no redirect thrown, navigate manually
      await navigate({ to: safeRedirect ?? '/dashboard' });
    } catch (err) {
      // Handle serialized redirects from TanStack Start server functions
      if (err instanceof Response) {
        await navigate({ to: safeRedirect ?? '/dashboard' });
        return;
      }
      if (err != null && typeof err === 'object' && 'to' in err) {
        await navigate({ to: safeRedirect ?? ((err as { to: string }).to) });
        return;
      }
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hacknu-dark p-6">
      <BackgroundGrid />
      <GradientOrbs />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <a href="/" className="inline-block">
            <span className="text-3xl font-bold tracking-tighter text-hacknu-green">HackNU</span>
            <span className="text-3xl font-bold tracking-tighter text-hacknu-purple">/26</span>
          </a>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-3">
          <StepBadge step={1} label="Account" done />
          <div className="h-px flex-1 bg-hacknu-border" />
          <StepBadge step={2} label="Profile" active />
        </div>

        <Card className="border-hacknu-border bg-hacknu-dark-card">
          <CardHeader className="border-b border-hacknu-border">
            <TerminalDots label="onboarding.sh" />
          </CardHeader>

          <CardContent className="pt-4">
            <CardTitle className="mb-1 text-xl text-hacknu-text">Complete your profile</CardTitle>
            <CardDescription className="mb-6 text-hacknu-text-muted">
              Tell us a bit about yourself to finish registration
            </CardDescription>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full name */}
              <Field>
                <FieldLabel
                  htmlFor="fullName"
                  className="tracking-wider text-hacknu-text-muted uppercase"
                >
                  Full Name
                </FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ada Lovelace"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                  className="border-hacknu-border bg-hacknu-dark text-hacknu-text placeholder:text-hacknu-text-muted/50 focus-visible:border-hacknu-green"
                />
              </Field>

              {/* IIN */}
              <Field>
                <FieldLabel
                  htmlFor="iin"
                  className="tracking-wider text-hacknu-text-muted uppercase"
                >
                  IIN
                </FieldLabel>
                <Input
                  id="iin"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456789012"
                  maxLength={12}
                  value={iin}
                  onChange={(e) => setIin(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  required
                  disabled={loading}
                  className="border-hacknu-border bg-hacknu-dark font-mono tracking-widest text-hacknu-text placeholder:text-hacknu-text-muted/50 focus-visible:border-hacknu-green"
                />
              </Field>

              {/* Phone */}
              <Field>
                <FieldLabel
                  htmlFor="phone"
                  className="tracking-wider text-hacknu-text-muted uppercase"
                >
                  Phone Number
                </FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 700 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={loading}
                  className="border-hacknu-border bg-hacknu-dark text-hacknu-text placeholder:text-hacknu-text-muted/50 focus-visible:border-hacknu-green"
                />
              </Field>

              {/* Education level */}
              <Field>
                <FieldLabel
                  htmlFor="educationLevel"
                  className="tracking-wider text-hacknu-text-muted uppercase"
                >
                  Education Level
                </FieldLabel>
                <Select
                  value={educationLevel}
                  onValueChange={(val) => setEducationLevel(val ?? '')}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full border-hacknu-border bg-hacknu-dark text-hacknu-text focus-visible:border-hacknu-green">
                    <SelectValue placeholder="Select education level..." />
                  </SelectTrigger>
                  <SelectContent className="border-hacknu-border bg-hacknu-dark-card">
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem
                        key={level}
                        value={level}
                        className="text-hacknu-text focus:bg-hacknu-green/10 focus:text-hacknu-green"
                      >
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* CV upload */}
              <Field>
                <FieldLabel className="tracking-wider text-hacknu-text-muted uppercase">
                  CV / Resume
                </FieldLabel>
                <FieldDescription className="text-hacknu-text-muted/60">
                  Optional — upload your CV in PDF, DOC, or DOCX format
                </FieldDescription>
                <CvDropzone
                  onUpload={(url) => setCvUrl(url)}
                  onClear={() => setCvUrl(null)}
                  uploadFile={(data) => uploadCv({ data: { ...data, fullName, iin } })}
                  deleteFile={(fileId) => deleteCv({ data: { fileId } })}
                  onUploadingChange={setCvUploading}
                  disabled={loading}
                />
              </Field>

              {error && (
                <FieldError className="border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-400">
                  <span className="mr-2 font-mono text-red-500">[ERROR]</span>
                  {error}
                </FieldError>
              )}

              <Button
                type="submit"
                disabled={loading || cvUploading}
                className="mt-2 h-10 w-full bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80 hover:shadow-[0_0_20px_rgba(88,225,145,0.3)]"
              >
                {loading ? 'Saving...' : '> Complete Registration'}
              </Button>
            </form>

            <Separator className="my-4 bg-hacknu-border" />

            <p className="text-center text-xs text-hacknu-text-muted">
              You can update this information later from your profile settings.
            </p>

            <div className="mt-3 text-center">
              <Button
                variant="link"
                size="xs"
                className="text-hacknu-text-muted/60 hover:text-red-400"
                onClick={async () => {
                  await signOut();
                  window.location.href = '/login';
                }}
              >
                Sign out / use a different account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
