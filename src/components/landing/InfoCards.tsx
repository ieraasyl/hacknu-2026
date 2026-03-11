import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DecryptedText from '@/components/landing/DecryptedText';

export default function InfoCards() {
  const { t } = useTranslation();
  const cards = [
    {
      label: t('infoCards.when'),
      answer: t('infoCards.whenAnswer'),
      detail: t('infoCards.whenDetail'),
    },
    {
      label: t('infoCards.where'),
      answer: t('infoCards.whereAnswer'),
      detail: t('infoCards.whereDetail'),
      action: {
        text: t('infoCards.whereAction'),
        href: 'https://maps.google.com/?q=Nazarbayev+University',
      },
    },
    {
      label: t('infoCards.how'),
      answer: t('infoCards.howAnswer'),
      detail: t('infoCards.howDetail'),
    },
  ];

  return (
    <section id="info" className="relative bg-hacknu-dark">
      {cards.map((card, index) => (
        <div key={index}>
          <Separator className="bg-hacknu-border" />
          <div className="px-6 py-12 md:py-20">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-baseline md:gap-16">
              {/* Label */}
              <div className="md:w-1/4">
                <span className="text-sm tracking-[0.2em] text-hacknu-text-muted uppercase md:text-base">
                  # {card.label}
                </span>
              </div>

              {/* Answer */}
              <div className="md:w-3/4">
                <h2 className="text-3xl leading-tight font-extralight text-hacknu-green sm:text-5xl md:text-7xl lg:text-8xl">
                  <DecryptedText
                    text={card.answer}
                    animateOn="view"
                    sequential
                    encryptedClassName="text-hacknu-purple/60"
                  />
                </h2>
                {card.detail && (
                  <p className="mt-2 text-sm text-hacknu-text-muted md:text-base">{card.detail}</p>
                )}
                {card.action && (
                  <Button
                    variant="link"
                    className="mt-4 h-auto p-0 tracking-wider text-hacknu-purple uppercase hover:text-hacknu-green"
                    render={<a href={card.action.href} target="_blank" rel="noopener noreferrer" />}
                  >
                    {card.action.text}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      <Separator className="bg-hacknu-border" />
    </section>
  );
}
