import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Session } from '@/lib/types';

export default function Footer({ session }: { session: Session | null }) {
  const { t } = useTranslation();
  const isLoggedIn = !!session?.user;

  return (
    <footer className="border-t border-hacknu-border bg-hacknu-dark">
      {/* Register / Dashboard CTA Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 text-center md:py-24">
        <p className="mb-4 text-sm tracking-widest text-hacknu-text-muted uppercase">
          {t('footer.readyToHack')}
        </p>
        <Button
          variant="link"
          haptic="light"
          className="h-auto p-0 font-mono text-2xl font-bold tracking-wider text-hacknu-green hover:text-white md:text-4xl"
          render={<a href={isLoggedIn ? '/dashboard' : '/login'} />}
        >
          {'>'} {isLoggedIn ? t('footer.ctaDashboard') : t('footer.ctaRegister')}
          <span
            className="ml-1 inline-block h-7 w-4 bg-hacknu-green align-middle"
            style={{ animation: 'blink 1s step-end infinite' }}
          />
        </Button>
      </div>

      <Separator className="bg-hacknu-border" />

      {/* Bottom Bar */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
        {/* Left: Branding */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-hacknu-green">HackNU</span>
          <span className="text-sm font-bold text-hacknu-purple">/26</span>
          <span className="ml-2 text-xs text-hacknu-text-muted">{t('footer.copyright')}</span>
        </div>

        {/* Right: Social Links */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={
              <a
                href="https://www.instagram.com/nuacmsc/"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            {t('footer.instagram')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={
              <a
                href="https://www.linkedin.com/company/nuacmsc"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            {t('footer.linkedin')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={
              <a
                href="https://www.youtube.com/@nuacmsc"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            {t('footer.youtube')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=acmsc@nu.edu.kz&su=&body="
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            {t('footer.email')}
          </Button>
        </div>
      </div>

      <Separator className="bg-hacknu-border" />

      {/* Credits */}
      <div className="mx-auto max-w-7xl px-6 py-4 text-center">
        <p className="text-[10px] tracking-wider text-hacknu-text-muted/50">
          {t('footer.credits')}
        </p>
      </div>
    </footer>
  );
}
