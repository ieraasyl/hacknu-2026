import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../ui/card';

export default function About() {
  const { t } = useTranslation();
  const highlights = [
    { number: '24', unit: t('about.hour'), text: t('about.hackathon') },
    { number: '500+', unit: '', text: t('about.participants') },
    { number: '9th', unit: '', text: t('about.annualEdition') },
  ];

  const photos = [
    '/images/image1.jpg',
    '/images/image2.jpg',
    '/images/image3.jpg',
    '/images/image4.jpg',
    '/images/image5.jpg',
    '/images/image6.jpg',
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
                <div className="gradient-text mb-2 text-5xl leading-none font-black md:text-7xl">
                  {item.number}
                </div>
                {item.unit && <div className="text-lg text-hacknu-text-muted">{item.unit}</div>}
                <div className="mt-2 text-xl font-light text-hacknu-text transition-colors group-hover:text-hacknu-green md:text-2xl">
                  {item.text}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* About Text */}
        <div className="mb-20 grid grid-cols-1 items-start gap-12 md:gap-20 lg:grid-cols-2">
          <div>
            <h3 className="mb-6 text-3xl leading-tight font-bold text-hacknu-text md:text-5xl">
              {t('about.title')}
              <br />
              <span className="gradient-text-green">{t('about.titleHighlight')}</span>
            </h3>
          </div>
          <div className="space-y-6">
            <p className="leading-relaxed text-hacknu-text-muted">{t('about.para1')}</p>
            <p className="leading-relaxed text-hacknu-text-muted">{t('about.para2')}</p>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {photos.map((photo, index) => (
            <div key={index} className="group relative aspect-4/3 overflow-hidden">
              <img
                src={photo}
                alt={t('about.photoAlt', { index: index + 1 })}
                className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
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
