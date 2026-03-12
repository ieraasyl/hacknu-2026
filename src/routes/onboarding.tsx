import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebHaptics } from 'web-haptics/react';
import { getSession } from '@/lib/auth.server';
import { webHapticsOptions } from '@/lib/web-haptics';
import {
  getParticipant,
  upsertParticipant,
  uploadCvToGas,
  deleteCvFromGas,
} from '@/lib/onboarding.server';
import { onboardingSchema } from '@/lib/validation';
import { useSession, signOut } from '@/lib/auth-client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TerminalDots } from '@/components/ui/terminal-dots';
import { BackgroundGrid, GradientOrbs } from '@/components/ui/background';
import { StepBadge } from '@/components/ui/step-badge';
import { AuthHeader } from '@/components/AuthHeader';
import OnboardingForm from '@/components/onboarding/OnboardingForm';

/* ─── Server Functions ─── */

type OnboardingInput = {
  fullName: string;
  iin: string;
  phone: string;
  city: string;
  placeOfStudy: string;
  parentPhone?: string;
  educationLevel: string;
  cvUrl?: string;
};

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
  return { userId: session.user.id };
});

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
      city: data.city,
      placeOfStudy: data.placeOfStudy,
      parentPhone: data.parentPhone || null,
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
  const { t } = useTranslation();
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();
  const safeRedirect = redirectTo?.startsWith('/invite/') ? redirectTo : undefined;
  const { trigger } = useWebHaptics(webHapticsOptions);

  const [fullName, setFullName] = useState(session?.user?.name ?? '');
  const [iin, setIin] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [placeOfStudy, setPlaceOfStudy] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = onboardingSchema.safeParse({
      fullName,
      iin,
      phone,
      city,
      placeOfStudy,
      parentPhone: parentPhone || undefined,
      educationLevel,
      cvUrl: cvUrl ?? '',
    });
    if (!parsed.success) {
      trigger?.('error');
      setError(t(parsed.error.issues[0].message));
      return;
    }

    setLoading(true);
    try {
      await saveOnboarding({
        data: {
          fullName,
          iin,
          phone,
          city,
          placeOfStudy,
          parentPhone: parentPhone || undefined,
          educationLevel,
          cvUrl: cvUrl ?? undefined,
        },
      });
      await navigate({ to: safeRedirect ?? '/dashboard' });
    } catch (err) {
      if (err instanceof Response) {
        trigger?.('success');
        await navigate({ to: safeRedirect ?? '/dashboard' });
        return;
      }
      if (err != null && typeof err === 'object' && 'to' in err) {
        trigger?.('success');
        await navigate({ to: safeRedirect ?? (err as { to: string }).to });
        return;
      }
      trigger?.('error');
      setError(err instanceof Error ? t(err.message) : t('onboarding.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen flex-col bg-hacknu-dark">
      <AuthHeader />
      <div className="relative flex flex-1 items-center justify-center p-6">
        <BackgroundGrid />
        <GradientOrbs />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-6 flex items-center gap-3">
          <StepBadge step={1} label={t('onboarding.stepAccount')} done />
          <div className="h-px flex-1 bg-hacknu-border" />
          <StepBadge step={2} label={t('onboarding.stepProfile')} active />
        </div>

        <Card className="border-hacknu-border bg-hacknu-dark-card">
          <CardHeader className="border-b border-hacknu-border">
            <TerminalDots label="onboarding.sh" />
          </CardHeader>
          <CardContent className="pt-4">
            <OnboardingForm
              fullName={fullName}
              setFullName={setFullName}
              iin={iin}
              setIin={setIin}
              phone={phone}
              setPhone={setPhone}
              city={city}
              setCity={setCity}
              placeOfStudy={placeOfStudy}
              setPlaceOfStudy={setPlaceOfStudy}
              parentPhone={parentPhone}
              setParentPhone={setParentPhone}
              educationLevel={educationLevel}
              setEducationLevel={setEducationLevel}
              setCvUrl={setCvUrl}
              loading={loading}
              cvUploading={cvUploading}
              setCvUploading={setCvUploading}
              error={error}
              onSubmit={handleSubmit}
              onSignOut={handleSignOut}
              uploadFile={(data) => uploadCv({ data: { ...data, fullName, iin } })}
              deleteFile={(fileId) => deleteCv({ data: { fileId } })}
            />
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
