import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import LetterGlitch from '@/components/ui/letter-glitch';
import type { Session } from '@/lib/types';

export default function Hero({ session }: { session: Session | null }) {
  const { t } = useTranslation();
  const isLoggedIn = !!session?.user;

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-hacknu-dark">
      {/* LetterGlitch matrix-style background (matches Figma design) */}
      <div className="absolute inset-0">
        <LetterGlitch
          glitchColors={['#58e191', '#e256ff']}
          glitchSpeed={30}
          centerVignette
          outerVignette={false}
          smooth
        />
      </div>

      {/* Dark overlay for text contrast - stronger in center */}
      <div className="pointer-events-none absolute inset-0 bg-hacknu-dark/50" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(10,10,10,0.6),transparent)]"
        aria-hidden
      />

      <div className="relative z-10 px-6 text-center" style={{ animation: 'fadeInUp 1s ease-out' }}>
        {/* Terminal prefix */}
        <p
          className="mb-4 text-sm tracking-widest text-white uppercase md:text-base"
          style={{ textShadow: '0 0 20px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,1)' }}
        >
          {t('hero.terminalPrefix')}
        </p>

        {/* Main Title */}
        <h1
          className="text-7xl leading-none font-black tracking-tighter select-none sm:text-8xl md:text-[10rem] lg:text-[14rem]"
          style={{
            textShadow:
              '0 0 40px rgba(0,0,0,1), 0 0 80px rgba(0,0,0,1), 0 0 140px rgba(0,0,0,0.9), 0 4px 8px rgba(0,0,0,1)',
          }}
        >
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
        <p
          className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white md:mt-8 md:text-lg"
          style={{
            textShadow: '0 0 30px rgba(0,0,0,1), 0 0 60px rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,1)',
          }}
        >
          {t('hero.subtitle')}
          <br />
          {t('hero.subtitleOrg')}{' '}
          <span className="text-hacknu-green">{t('hero.subtitleOrgName')}</span>
        </p>

        {/* Register / Dashboard CTA */}
        <div
          className="mt-10 md:mt-14"
          style={{ textShadow: '0 0 20px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)' }}
        >
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
