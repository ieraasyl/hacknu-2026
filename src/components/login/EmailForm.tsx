import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

export default function EmailForm({
  email,
  setEmail,
  loading,
  error,
  onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <CardTitle className="mb-1 text-xl text-hacknu-text">{t('login.signIn')}</CardTitle>
      <CardDescription className="mb-6 text-hacknu-text-muted">
        {t('login.signInDesc')}
      </CardDescription>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="email" className="tracking-wider text-hacknu-text-muted uppercase">
            {t('login.email')}
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={t('login.emailPlaceholder')}
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
            <span className="mr-2 font-mono text-red-500">{t('login.errorPrefix')}</span>
            {error}
          </FieldError>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-10 w-full bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80 hover:shadow-[0_0_20px_rgba(88,225,145,0.3)]"
        >
          {loading ? t('login.sendingCode') : t('login.continue')}
        </Button>
      </form>
    </>
  );
}
