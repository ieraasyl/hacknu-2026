import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebHaptics } from 'web-haptics/react';
import { authClient, signIn, useSession } from '@/lib/auth-client';
import { Separator } from '@/components/ui/separator';
import { getSession } from '@/lib/auth.server';
import { getParticipant } from '@/lib/onboarding.server';
import { emailSchema, otpSchema } from '@/lib/validation';
import { webHapticsOptions } from '@/lib/web-haptics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BackgroundGrid, GradientOrbs } from '@/components/ui/background';
import { TerminalDots } from '@/components/ui/terminal-dots';
import { AuthHeader } from '@/components/AuthHeader';
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
  const { trigger } = useWebHaptics(webHapticsOptions);

  const [phase, setPhase] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
        trigger?.('error');
        setError(t(parsed.error.issues[0].message));
        return;
      }
      setOtpLoading(true);
      try {
        const result = await authClient.emailOtp.sendVerificationOtp({
          email,
          type: 'sign-in',
        });
        if (result.error) {
          trigger?.('error');
          setError(result.error.message ?? t('login.sendCodeFailed'));
        } else {
          trigger?.('success');
          setPhase('otp');
          setCooldown(RESEND_COOLDOWN);
        }
      } catch (err) {
        trigger?.('error');
        setError(
          `${t('login.errorLabel')}: ${err instanceof Error ? err.message : t('login.unknownError')}`,
        );
      } finally {
        setOtpLoading(false);
      }
    },
    [email, t, trigger],
  );

  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const parsed = otpSchema.safeParse({ otp });
      if (!parsed.success) {
        trigger?.('error');
        setError(t(parsed.error.issues[0].message));
        return;
      }
      setOtpLoading(true);
      try {
        const result = await signIn.emailOtp({ email, otp });
        if (result.error) {
          trigger?.('error');
          setError(result.error.message ?? t('login.invalidCode'));
        } else {
          trigger?.('success');
          const destination = await getPostLoginDestination();
          const safeRedirect = redirect && redirect.startsWith('/invite/') ? redirect : undefined;
          if (destination === '/onboarding') {
            await navigate({ to: '/onboarding', search: { redirect: safeRedirect } });
          } else {
            await navigate({ to: safeRedirect ?? '/dashboard' });
          }
        }
      } catch (err) {
        trigger?.('error');
        setError(
          `${t('login.errorLabel')}: ${err instanceof Error ? err.message : t('login.unknownError')}`,
        );
      } finally {
        setOtpLoading(false);
      }
    },
    [email, otp, navigate, redirect, t, trigger],
  );

  const handleResend = useCallback(async () => {
    setError(null);
    setOtpLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });
      if (result.error) {
        trigger?.('error');
        setError(result.error.message ?? t('login.resendFailed'));
      } else {
        trigger?.('success');
        setCooldown(RESEND_COOLDOWN);
      }
    } catch (err) {
      trigger?.('error');
      setError(
        `${t('login.errorLabel')}: ${err instanceof Error ? err.message : t('login.unknownError')}`,
      );
    } finally {
      setOtpLoading(false);
    }
  }, [email, t, trigger]);

  const handleBack = useCallback(() => {
    setPhase('email');
    setOtp('');
    setError(null);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const callbackURL = redirect && redirect.startsWith('/invite/') ? redirect : '/dashboard';
      await authClient.signIn.social({
        provider: 'google',
        callbackURL,
      });
    } catch (err) {
      trigger?.('error');
      setError(
        `${t('login.errorLabel')}: ${err instanceof Error ? err.message : t('login.unknownError')}`,
      );
      setGoogleLoading(false);
    }
  }, [redirect, t, trigger]);

  if (session) {
    return (
      <div className="flex min-h-screen flex-col bg-hacknu-dark">
        <AuthHeader />
        <div className="relative flex flex-1 items-center justify-center p-6">
          <BackgroundGrid />
          <div className="relative z-10 w-full max-w-sm">
            <SessionActiveCard session={session} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-hacknu-dark">
      <AuthHeader />
      <div className="relative flex flex-1 items-center justify-center p-6">
        <BackgroundGrid />
        <GradientOrbs />

        <div className="relative z-10 w-full max-w-sm">
          <Card className="border-hacknu-border bg-hacknu-dark-card">
          <CardHeader className="border-b border-hacknu-border">
            <TerminalDots label={phase === 'email' ? 'login.sh' : 'verify_otp.sh'} />
          </CardHeader>
          <CardContent className="pt-4">
            {phase === 'email' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={googleLoading}
                  onClick={handleGoogleSignIn}
                  className="mb-4 h-10 w-full border-hacknu-border bg-hacknu-dark text-hacknu-text hover:border-hacknu-green/50 hover:bg-hacknu-dark-card"
                >
                  <img
                    src="/images/google.svg"
                    alt=""
                    className="mr-2 h-5 w-5 shrink-0"
                    aria-hidden
                  />
                  {googleLoading ? t('login.redirecting') : t('login.signInWithGoogle')}
                </Button>
                <div className="relative my-4 flex items-center gap-2">
                  <Separator className="flex-1 bg-hacknu-border" />
                  <span className="text-xs tracking-wider text-hacknu-text-muted uppercase">
                    {t('login.or')}
                  </span>
                  <Separator className="flex-1 bg-hacknu-border" />
                </div>
                <EmailForm
                  email={email}
                  setEmail={setEmail}
                  loading={otpLoading}
                  error={error}
                  onSubmit={handleSendOtp}
                />
              </>
            ) : (
              <OtpForm
                otp={otp}
                setOtp={setOtp}
                email={email}
                loading={otpLoading}
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
    </div>
  );
}
