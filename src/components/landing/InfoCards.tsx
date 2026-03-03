import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export default function InfoCards() {
  const cards = [
    {
      label: 'When?',
      answer: '18-19 October',
      detail: '2026',
    },
    {
      label: 'Where?',
      answer: 'Nazarbayev University',
      detail: 'Astana, Kazakhstan',
      action: {
        text: 'Show on map →',
        href: 'https://maps.google.com/?q=Nazarbayev+University',
      },
    },
    {
      label: 'How?',
      answer: 'In teams of 2-4',
      detail: 'Register together or find teammates at the event',
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
                  {card.answer}
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
