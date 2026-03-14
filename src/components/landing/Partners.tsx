import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import DecryptedText from '@/components/landing/DecryptedText';

import higgsfieldLogo from '../../assets/partners/higgsfield.svg?url';
import railwayLogo from '../../assets/partners/railway.svg?url';

const partnerCategories = [
  {
    key: 'generalSponsor',
    partners: [{ nameKey: 'higgsfield', logo: higgsfieldLogo }],
  },
  {
    key: 'officialSponsor',
    partners: [{ nameKey: 'railway', logo: railwayLogo }],
  },
] as const;

export default function Partners() {
  const { t } = useTranslation();

  return (
    <section id="partners" className="border-t border-hacknu-border bg-hacknu-dark py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <p className="terminal-header mb-4">{t('partners.header')}</p>
        <h2 className="mb-12 text-3xl font-bold text-hacknu-text md:mb-16 md:text-5xl">
          <DecryptedText
            text={t('partners.title')}
            animateOn="view"
            sequential
            encryptedClassName="text-hacknu-purple/60"
          />
        </h2>

        {/* Partner Categories - side by side when few sponsors */}
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {partnerCategories.map((category) => (
            <div key={category.key} className="flex flex-col">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-hacknu-text-muted">
                {t(`partners.categories.${category.key}`)}
              </h3>
              <div className="grid flex-1 gap-6 sm:grid-cols-2 md:grid-cols-1">
                {category.partners.map((partner, index) => (
                  <Card
                    key={index}
                    className="group aspect-3/2 border-hacknu-border bg-transparent transition-all duration-500 hover:border-hacknu-green/30"
                  >
                    <CardContent className="flex h-full items-center justify-center p-6 md:p-8">
                      <img
                        src={partner.logo}
                        alt={t(`partners.${partner.nameKey}`)}
                        className="h-full w-full max-w-[280px] object-contain transition-opacity duration-500"
                        loading="lazy"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
