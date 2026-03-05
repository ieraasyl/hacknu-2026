import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { authClient, signIn, useSession } from '@/lib/auth-client';
import { getSession } from '@/lib/auth.server';
import { getParticipant } from '@/lib/onboarding.server';
import { emailSchema, otpSchema } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BackgroundGrid, GradientOrbs } from '@/components/ui/background';
import { TerminalDots } from '@/components/ui/terminal-dots';
import SessionActiveCard from '@/components/login/SessionActiveCard';
import EmailForm from '@/components/login/EmailForm';
import OtpForm from '@/components/login/OtpForm';

const getPostLoginDestination = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest();
  const session = await getSession(request);
  if (!session) return '/login';
  const profile = await getParticipant(session.user.id);
  return profile ? '/dashboard' : '/onboarding';
});

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: LoginPage,
});

const RESEND_COOLDOWN = 60;

function LoginPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const [phase, setPhase] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const parsed = emailSchema.safeParse({ email });
      if (!parsed.success) {
        setError(t(parsed.error.issues[0].message));
        return;
      }
      setLoading(true);
      try {
        const result = await authClient.emailOtp.sendVerificationOtp({
          email,
          type: 'sign-in',
        });
        if (result.error) {
          setError(result.error.message ?? t('login.sendCodeFailed'));
        } else {
          setPhase('otp');
          setCooldown(RESEND_COOLDOWN);
        }
      } catch (err) {
        setError(
          `${t('login.errorLabel')}: ${err instanceof Error ? err.message : t('login.unknownError')}`,
        );
      } finally {
        setLoading(false);
      }
    },
    [email, t],
  );

  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const parsed = otpSchema.safeParse({ otp });
      if (!parsed.success) {
        setError(t(parsed.error.issues[0].message));
        return;
      }
      setLoading(true);
      try {
        const result = await signIn.emailOtp({ email, otp });
        if (result.error) {
          setError(result.error.message ?? t('login.invalidCode'));
        } else {
          const destination = await getPostLoginDestination();
          const safeRedirect = redirect && redirect.startsWith('/invite/') ? redirect : undefined;
          if (destination === '/onboarding') {
            await navigate({ to: '/onboarding', search: { redirect: safeRedirect } });
          } else {
            await navigate({ to: safeRedirect ?? '/dashboard' });
          }
        }
      } catch (err) {
        setError(
          `${t('login.errorLabel')}: ${err instanceof Error ? err.message : t('login.unknownError')}`,
        );
      } finally {
        setLoading(false);
      }
    },
    [email, otp, navigate, redirect, t],
  );

  const handleResend = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });
      if (result.error) {
        setError(result.error.message ?? t('login.resendFailed'));
      } else {
        setCooldown(RESEND_COOLDOWN);
      }
    } catch (err) {
      setError(
        `${t('login.errorLabel')}: ${err instanceof Error ? err.message : t('login.unknownError')}`,
      );
    } finally {
      setLoading(false);
    }
  }, [email, t]);

  const handleBack = useCallback(() => {
    setPhase('email');
    setOtp('');
    setError(null);
  }, []);

  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hacknu-dark p-6">
        <BackgroundGrid />
        <div className="relative z-10 w-full max-w-sm">
          <SessionActiveCard session={session} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hacknu-dark p-6">
      <BackgroundGrid />
      <GradientOrbs />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <a href="/" className="inline-block">
            <span className="text-3xl font-bold tracking-tighter text-hacknu-green">HackNU</span>
            <span className="text-3xl font-bold tracking-tighter text-hacknu-purple">/26</span>
          </a>
        </div>

        <Card className="border-hacknu-border bg-hacknu-dark-card">
          <CardHeader className="border-b border-hacknu-border">
            <TerminalDots label={phase === 'email' ? 'login.sh' : 'verify_otp.sh'} />
          </CardHeader>
          <CardContent className="pt-4">
            {phase === 'email' ? (
              <EmailForm
                email={email}
                setEmail={setEmail}
                loading={loading}
                error={error}
                onSubmit={handleSendOtp}
              />
            ) : (
              <OtpForm
                otp={otp}
                setOtp={setOtp}
                email={email}
                loading={loading}
                error={error}
                cooldown={cooldown}
                onSubmit={handleVerifyOtp}
                onResend={handleResend}
                onBack={handleBack}
              />
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            size="xs"
            className="text-hacknu-text-muted hover:text-hacknu-green"
            render={<a href="/" />}
          >
            {t('login.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
