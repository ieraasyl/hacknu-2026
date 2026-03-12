import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import DecryptedText from '@/components/landing/DecryptedText';

const photoModules = import.meta.glob<{ default: { src: string; width: number; height: number } }>(
  '../../assets/images/image*.jpg',
  {
    eager: true,
    query: { format: 'webp', quality: '80', w: '900', as: 'metadata' },
  }
);

const photos = Object.entries(photoModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, m]) => m.default);

export default function About() {
  const { t } = useTranslation();
  const highlights = [
    { number: '24', unit: t('about.hour'), text: t('about.hackathon') },
    { number: '500+', unit: '', text: t('about.participants') },
    { number: '9th', unit: '', text: t('about.annualEdition') },
  ];

  return (
    <section id="about" className="bg-hacknu-dark py-20 md:py-32">
      {/* Section Header */}
      <div className="mx-auto max-w-7xl px-6">
        <p className="terminal-header mb-12 md:mb-16">{t('about.header')}</p>

        {/* Highlights Grid */}
        <div className="mb-20 grid grid-cols-1 gap-8 md:mb-32 md:grid-cols-3">
          {highlights.map((item, index) => (
            <Card
              key={index}
              className="group border-hacknu-border bg-transparent transition-all duration-500 hover:border-hacknu-green/30"
            >
              <CardContent className="p-8">
                <div className="gradient-text mb-2 flex flex-wrap items-baseline gap-x-2 text-5xl leading-none font-black md:text-7xl">
                  <DecryptedText
                    text={item.number}
                    animateOn="view"
                    sequential
                    encryptedClassName="text-hacknu-purple/60"
                  />
                  {item.unit && (
                    <span className="text-lg font-normal text-hacknu-text-muted">
                      <DecryptedText
                        text={item.unit}
                        animateOn="view"
                        sequential
                        encryptedClassName="text-hacknu-purple/60"
                      />
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xl font-light text-hacknu-text transition-colors group-hover:text-hacknu-green md:text-2xl">
                  <DecryptedText
                    text={item.text}
                    animateOn="view"
                    sequential
                    encryptedClassName="text-hacknu-purple/60"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative -mt-24 mb-20 min-h-[560px] overflow-hidden pt-24 md:min-h-[400px]">
          <img
            src="/images/aboutBG.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-contain object-top opacity-60 md:block"
          />
          <div className="relative z-10 grid grid-cols-1 items-start gap-12 md:gap-20 lg:grid-cols-2">
            <div>
              <h3 className="mb-6 text-3xl leading-tight font-bold text-hacknu-text md:text-5xl">
                <DecryptedText
                  text={t('about.title')}
                  animateOn="view"
                  sequential
                  encryptedClassName="text-hacknu-purple/60"
                />
                <br />
                <span className="gradient-text-green">
                  <DecryptedText
                    text={t('about.titleHighlight')}
                    animateOn="view"
                    sequential
                    encryptedClassName="text-hacknu-purple/60"
                  />
                </span>
              </h3>
            </div>
            <div className="space-y-6">
              <p className="leading-relaxed text-hacknu-text-muted">{t('about.para1')}</p>
              <p className="leading-relaxed text-hacknu-text-muted">{t('about.para2')}</p>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {photos.map((photo, index) => (
            <div key={index} className="group relative aspect-4/3 overflow-hidden">
              <img
                src={photo.src}
                width={photo.width}
                height={photo.height}
                alt={t('about.photoAlt', { index: index + 1 })}
                className="h-full w-full object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-hacknu-green/5 transition-all duration-500 group-hover:bg-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
