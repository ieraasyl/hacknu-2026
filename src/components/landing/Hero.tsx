import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SymbolBackground } from '@/components/ui/symbol-background';
import type { Session } from '@/lib/types';

export default function Hero({ session }: { session: Session | null }) {
  const { t } = useTranslation();
  const isLoggedIn = !!session?.user;

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-hacknu-dark">
      {/* Symbol background with hover color transition */}
      <SymbolBackground />

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(88,225,145,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(88,225,145,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-hacknu-green/5 blur-[120px]" />
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-hacknu-purple/5 blur-[120px]" />

      <div className="relative z-10 px-6 text-center" style={{ animation: 'fadeInUp 1s ease-out' }}>
        {/* Terminal prefix */}
        <p className="mb-4 text-sm tracking-widest text-hacknu-text-muted uppercase md:text-base">
          {t('hero.terminalPrefix')}
        </p>

        {/* Main Title */}
        <h1 className="text-7xl leading-none font-black tracking-tighter select-none sm:text-8xl md:text-[10rem] lg:text-[14rem]">
          <span
            className="text-hacknu-green"
            style={{ animation: 'glowPulse 3s ease-in-out infinite' }}
          >
            {t('hero.titleHack')}
          </span>
          <span
            className="text-hacknu-green"
            style={{ animation: 'glowPulse 3s ease-in-out infinite' }}
          >
            {t('hero.titleNU')}
          </span>
          <span className="text-hacknu-purple">{t('hero.titleYear')}</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-hacknu-text-muted md:mt-8 md:text-lg">
          {t('hero.subtitle')}
          <br />
          {t('hero.subtitleOrg')}{' '}
          <span className="text-hacknu-green">{t('hero.subtitleOrgName')}</span>
        </p>

        {/* Register / Dashboard CTA */}
        <div className="mt-10 md:mt-14">
          <Button
            variant="link"
            haptic="light"
            className="h-auto p-0 font-mono text-lg tracking-wider text-hacknu-green hover:text-white md:text-2xl"
            render={<a href={isLoggedIn ? '/dashboard' : '/login'} />}
          >
            {'>'} {isLoggedIn ? t('hero.ctaDashboard') : t('hero.ctaRegister')}
            <span
              className="ml-1 inline-block h-5 w-3 bg-hacknu-green align-middle"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
          </Button>
        </div>
      </div>
    </section>
  );
}
