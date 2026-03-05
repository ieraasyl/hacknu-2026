import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const FAQ_KEYS = [
  { catKey: 'general', items: ['q1', 'q2', 'q3'] },
  { catKey: 'participation', items: ['q4', 'q5', 'q6'] },
  { catKey: 'venueLogistics', items: ['q7', 'q8', 'q9'] },
  { catKey: 'projectDevelopment', items: ['q10', 'q11', 'q12'] },
] as const;

function FAQItemComponent({
  questionKey,
  answerKey,
}: {
  questionKey: string;
  answerKey: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="border-b border-dashed border-hacknu-border">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex h-auto w-full items-start justify-between px-4 py-5 text-left hover:bg-white/2"
      >
        <span className="pr-4 text-sm text-wrap text-hacknu-text transition-colors group-hover:text-hacknu-green md:text-base">
          {t(questionKey)}
        </span>
        <span className="mt-0.5 shrink-0 font-mono text-sm text-hacknu-green">
          [{isOpen ? '−' : '+'}]
        </span>
      </Button>
      {isOpen && (
        <div className="px-4 pb-5">
          <p className="border-l-2 border-hacknu-green/20 pl-0 text-sm leading-relaxed text-hacknu-text-muted md:ml-0 md:pl-4">
            {t(answerKey)}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const { t } = useTranslation();

  return (
    <section id="faq" className="bg-hacknu-dark py-20 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        {/* Section Header */}
        <p className="terminal-header mb-4">{t('faq.header')}</p>
        <h2 className="mb-12 text-3xl font-bold text-hacknu-text md:mb-16 md:text-5xl">
          {t('faq.title')}
        </h2>

        {/* FAQ Categories */}
        <div className="space-y-10">
          {FAQ_KEYS.map((category, catIndex) => (
            <div key={catIndex}>
              {/* Category Header */}
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-xs tracking-wider text-hacknu-purple uppercase md:text-sm">
                  # {t(`faq.${category.catKey}`)}
                </span>
                <Separator className="flex-1 bg-hacknu-border" />
              </div>

              {/* FAQ Items */}
              <div className="border-t border-dashed border-hacknu-border">
                {category.items.map((qKey) => (
                  <FAQItemComponent
                    key={qKey}
                    questionKey={`faq.${qKey}`}
                    answerKey={`faq.${qKey.replace('q', 'a')}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
