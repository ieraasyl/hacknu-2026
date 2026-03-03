import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useState, useEffect, useCallback } from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { authClient, signIn, useSession } from '../lib/auth-client';
import { getSession } from '../lib/auth.server';
import { getParticipant } from '../lib/onboarding.server';
import { emailSchema, otpSchema } from '../lib/validation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Field, FieldLabel, FieldError } from '../components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '../components/ui/input-otp';
import { Separator } from '../components/ui/separator';
import { TerminalDots } from '../components/ui/terminal-dots';
import { BackgroundGrid, GradientOrbs } from '../components/ui/background';

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

const RESEND_COOLDOWN = 60; // seconds

function LoginPage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  // Two-phase state: 'email' or 'otp'
  const [phase, setPhase] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  /* ─── Phase 1: Send OTP ─── */
  const handleSendOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const parsed = emailSchema.safeParse({ email });
      if (!parsed.success) {
        setError(parsed.error.issues[0].message);
        return;
      }

      setLoading(true);
      try {
        const result = await authClient.emailOtp.sendVerificationOtp({
          email,
          type: 'sign-in',
        });
        if (result.error) {
          setError(result.error.message ?? 'Failed to send verification code');
        } else {
          setPhase('otp');
          setCooldown(RESEND_COOLDOWN);
        }
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    },
    [email],
  );

  /* ─── Phase 2: Verify OTP & Sign In ─── */
  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const parsed = otpSchema.safeParse({ otp });
      if (!parsed.success) {
        setError(parsed.error.issues[0].message);
        return;
      }

      setLoading(true);
      try {
        const result = await signIn.emailOtp({ email, otp });
        if (result.error) {
          setError(result.error.message ?? 'Invalid verification code');
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
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    },
    [email, otp, navigate, redirect],
  );

  /* ─── Resend OTP ─── */
  const handleResend = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });
      if (result.error) {
        setError(result.error.message ?? 'Failed to resend code');
      } else {
        setCooldown(RESEND_COOLDOWN);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [email]);

  // Already logged in state
  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hacknu-dark p-6">
        <BackgroundGrid />
        <div className="relative z-10 w-full max-w-sm">
          <Card className="border-hacknu-border bg-hacknu-dark-card">
            <CardHeader className="border-b border-hacknu-border">
              <TerminalDots label="session_active" />
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-2 text-sm text-hacknu-green">$ whoami</p>
              <CardTitle className="mb-1 text-xl text-hacknu-text">{session.user.name}</CardTitle>
              <CardDescription className="mb-6 text-hacknu-text-muted">
                {session.user.email}
              </CardDescription>
              <Button
                className="h-10 w-full bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80 hover:shadow-[0_0_20px_rgba(88,225,145,0.3)]"
                render={<a href="/dashboard" />}
              >
                Go to Dashboard →
              </Button>
              <div className="mt-3 text-center">
                <Button
                  variant="link"
                  size="xs"
                  className="text-hacknu-text-muted hover:text-hacknu-green"
                  render={<a href="/" />}
                >
                  ← Back to home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hacknu-dark p-6">
      <BackgroundGrid />
      <GradientOrbs />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <a href="/" className="inline-block">
            <span className="text-3xl font-bold tracking-tighter text-hacknu-green">HackNU</span>
            <span className="text-3xl font-bold tracking-tighter text-hacknu-purple">/26</span>
          </a>
        </div>

        {/* Card */}
        <Card className="border-hacknu-border bg-hacknu-dark-card">
          {/* Terminal-style header bar */}
          <CardHeader className="border-b border-hacknu-border">
            <TerminalDots label={phase === 'email' ? 'login.sh' : 'verify_otp.sh'} />
          </CardHeader>

          <CardContent className="pt-4">
            {phase === 'email' ? (
              <>
                <CardTitle className="mb-1 text-xl text-hacknu-text">Sign In</CardTitle>
                <CardDescription className="mb-6 text-hacknu-text-muted">
                  Enter your email to receive a verification code
                </CardDescription>

                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <Field>
                    <FieldLabel
                      htmlFor="email"
                      className="tracking-wider text-hacknu-text-muted uppercase"
                    >
                      Email
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoFocus
                      className="border-hacknu-border bg-hacknu-dark text-hacknu-text placeholder:text-hacknu-text-muted/50 focus-visible:border-hacknu-green"
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
                    disabled={loading}
                    className="mt-2 h-10 w-full bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80 hover:shadow-[0_0_20px_rgba(88,225,145,0.3)]"
                  >
                    {loading ? 'Sending code...' : '> Continue'}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <CardTitle className="mb-1 text-xl text-hacknu-text">Verification Code</CardTitle>
                <CardDescription className="mb-6 text-hacknu-text-muted">
                  We sent a 6-digit code to <span className="text-hacknu-green">{email}</span>
                </CardDescription>

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <Field>
                    <FieldLabel
                      htmlFor="otp"
                      className="tracking-wider text-hacknu-text-muted uppercase"
                    >
                      Code
                    </FieldLabel>
                    <InputOTP
                      id="otp"
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={otp}
                      onChange={(val) => setOtp(val)}
                      disabled={loading}
                      autoFocus
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className="border-hacknu-border bg-hacknu-dark text-hacknu-text data-[active=true]:border-hacknu-green data-[active=true]:ring-hacknu-green/50"
                        />
                        <InputOTPSlot
                          index={1}
                          className="border-hacknu-border bg-hacknu-dark text-hacknu-text data-[active=true]:border-hacknu-green data-[active=true]:ring-hacknu-green/50"
                        />
                        <InputOTPSlot
                          index={2}
                          className="border-hacknu-border bg-hacknu-dark text-hacknu-text data-[active=true]:border-hacknu-green data-[active=true]:ring-hacknu-green/50"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator className="text-hacknu-text-muted" />
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={3}
                          className="border-hacknu-border bg-hacknu-dark text-hacknu-text data-[active=true]:border-hacknu-green data-[active=true]:ring-hacknu-green/50"
                        />
                        <InputOTPSlot
                          index={4}
                          className="border-hacknu-border bg-hacknu-dark text-hacknu-text data-[active=true]:border-hacknu-green data-[active=true]:ring-hacknu-green/50"
                        />
                        <InputOTPSlot
                          index={5}
                          className="border-hacknu-border bg-hacknu-dark text-hacknu-text data-[active=true]:border-hacknu-green data-[active=true]:ring-hacknu-green/50"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </Field>

                  {error && (
                    <FieldError className="border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-400">
                      <span className="mr-2 font-mono text-red-500">[ERROR]</span>
                      {error}
                    </FieldError>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-10 w-full bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80 hover:shadow-[0_0_20px_rgba(88,225,145,0.3)]"
                  >
                    {loading ? 'Verifying...' : '> Verify & Sign In'}
                  </Button>
                </form>

                <Separator className="my-4 bg-hacknu-border" />

                <div className="flex items-center justify-between text-sm">
                  <Button
                    variant="link"
                    size="xs"
                    className="text-hacknu-text-muted hover:text-hacknu-green"
                    onClick={() => {
                      setPhase('email');
                      setOtp('');
                      setError(null);
                    }}
                  >
                    ← Different email
                  </Button>
                  <Button
                    variant="link"
                    size="xs"
                    disabled={cooldown > 0 || loading}
                    className="text-hacknu-purple hover:text-hacknu-green disabled:text-hacknu-text-muted/40"
                    onClick={handleResend}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Button
            variant="link"
            size="xs"
            className="text-hacknu-text-muted hover:text-hacknu-green"
            render={<a href="/" />}
          >
            ← Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
