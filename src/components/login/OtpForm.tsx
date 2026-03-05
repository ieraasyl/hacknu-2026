import { useTranslation } from 'react-i18next';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { Separator } from '@/components/ui/separator';

export default function OtpForm({
  otp,
  setOtp,
  email,
  loading,
  error,
  cooldown,
  onSubmit,
  onResend,
  onBack,
}: {
  otp: string;
  setOtp: (v: string) => void;
  email: string;
  loading: boolean;
  error: string | null;
  cooldown: number;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <CardTitle className="mb-1 text-xl text-hacknu-text">{t('login.verificationCode')}</CardTitle>
      <CardDescription className="mb-6 text-hacknu-text-muted">
        {t('login.verificationDesc')} <span className="text-hacknu-green">{email}</span>
      </CardDescription>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="otp" className="tracking-wider text-hacknu-text-muted uppercase">
            {t('login.code')}
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
            <span className="mr-2 font-mono text-red-500">{t('login.errorPrefix')}</span>
            {error}
          </FieldError>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-10 w-full bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80 hover:shadow-[0_0_20px_rgba(88,225,145,0.3)]"
        >
          {loading ? t('login.verifying') : t('login.verifySignIn')}
        </Button>
      </form>

      <Separator className="my-4 bg-hacknu-border" />

      <div className="flex items-center justify-between text-sm">
        <Button
          variant="link"
          size="xs"
          className="text-hacknu-text-muted hover:text-hacknu-green"
          onClick={onBack}
        >
          {t('login.differentEmail')}
        </Button>
        <Button
          variant="link"
          size="xs"
          disabled={cooldown > 0 || loading}
          className="text-hacknu-purple hover:text-hacknu-green disabled:text-hacknu-text-muted/40"
          onClick={onResend}
        >
          {cooldown > 0 ? t('login.resendIn', { seconds: cooldown }) : t('login.resendCode')}
        </Button>
      </div>
    </>
  );
}
