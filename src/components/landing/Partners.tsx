import { useTranslation } from 'react-i18next';
import { useWebHaptics } from 'web-haptics/react';
import { Card, CardContent } from '@/components/ui/card';
import { webHapticsOptions } from '@/lib/web-haptics';
import DecryptedText from '@/components/landing/DecryptedText';

import logo1 from '../../assets/images/logo1.svg?url';
import logo2 from '../../assets/images/logo2.svg?url';
import logo3 from '../../assets/images/logo3.svg?url';
import logo4 from '../../assets/images/logo4.svg?url';
import logo5 from '../../assets/images/logo5.svg?url';
import logo6 from '../../assets/images/logo6.svg?url';
import logo7 from '../../assets/images/logo7.svg?url';

export default function Partners() {
  const { t } = useTranslation();
  const { trigger } = useWebHaptics(webHapticsOptions);
  const partners = [
    { name: t('partners.partnerName', { index: 1 }), logo: logo1 },
    { name: t('partners.partnerName', { index: 2 }), logo: logo2 },
    { name: t('partners.partnerName', { index: 3 }), logo: logo3 },
    { name: t('partners.partnerName', { index: 4 }), logo: logo4 },
    { name: t('partners.partnerName', { index: 5 }), logo: logo5 },
    { name: t('partners.partnerName', { index: 6 }), logo: logo6 },
    { name: t('partners.partnerName', { index: 7 }), logo: logo7 },
  ];

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

        {/* Partner Logos Grid */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-8">
          {partners.map((partner, index) => (
            <Card
              key={index}
              className="group aspect-3/2 border-hacknu-border bg-transparent transition-all duration-500 hover:border-hacknu-green/30"
            >
              <CardContent className="flex h-full items-center justify-center p-4 md:p-6">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-full w-full scale-110 object-contain opacity-50 grayscale transition-opacity duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                  loading="lazy"
                />
              </CardContent>
            </Card>
          ))}

          {/* Become a Partner CTA */}
          <Card className="aspect-3/2 border-dashed border-hacknu-border bg-transparent transition-all duration-500 hover:border-hacknu-purple/50">
            <CardContent className="h-full p-6 md:p-8">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=acmsc@nu.edu.kz&su=&body="
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col items-center justify-center"
                onClick={() => trigger?.('light')}
              >
                <span className="mb-2 text-3xl text-hacknu-text-muted transition-colors group-hover:text-hacknu-purple">
                  +
                </span>
                <span className="text-center text-xs tracking-wider text-hacknu-text-muted uppercase transition-colors group-hover:text-hacknu-purple">
                  <DecryptedText
                    text={t('partners.becomePartner')}
                    animateOn="view"
                    sequential
                    encryptedClassName="text-hacknu-purple/60"
                  />
                </span>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
