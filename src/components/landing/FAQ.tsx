import { useState } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  name: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    name: 'General',
    items: [
      {
        question: 'What is HackNU?',
        answer:
          'HackNU is a 24-hour hackathon organized by ACM Student Chapter at Nazarbayev University. It is one of the biggest student hackathons in Central Asia.',
      },
      {
        question: 'When and where will HackNU/26 take place?',
        answer:
          'HackNU/26 will take place on October 18-19, 2026 at Nazarbayev University in Astana, Kazakhstan.',
      },
      {
        question: 'Is HackNU free to attend?',
        answer:
          'Yes! HackNU is completely free for all participants. We provide meals, snacks, swag, and prizes.',
      },
    ],
  },
  {
    name: 'Participation',
    items: [
      {
        question: 'Who can participate?',
        answer:
          'Any student currently enrolled at a university or college can participate. We welcome participants of all skill levels.',
      },
      {
        question: 'Can I participate alone?',
        answer:
          "Teams should consist of 2-4 members. If you don't have a team, you can find teammates during our team-forming session at the beginning of the event.",
      },
      {
        question: 'Do I need programming experience?',
        answer:
          'While some programming knowledge is helpful, we welcome participants of all skill levels. HackNU is a great place to learn and grow!',
      },
    ],
  },
  {
    name: 'Venue and Logistics',
    items: [
      {
        question: 'Will food be provided?',
        answer: 'Yes! We will provide meals, snacks, and beverages throughout the 24-hour event.',
      },
      {
        question: 'Can I sleep at the venue?',
        answer:
          'The venue will be open 24 hours. We recommend bringing a sleeping bag or blanket if you plan to rest during the event.',
      },
      {
        question: 'What should I bring?',
        answer:
          "Bring your laptop, charger, any hardware you want to hack with, and your student ID. We'll provide everything else!",
      },
    ],
  },
  {
    name: 'Project Development',
    items: [
      {
        question: 'Are there specific tracks or themes?',
        answer:
          'Yes, we will announce the competition tracks and themes closer to the event. Stay tuned on our social media channels.',
      },
      {
        question: 'Can I start working on my project before the event?',
        answer:
          'No, all work must be done during the 24-hour hackathon period. You can brainstorm ideas beforehand, but no code should be written in advance.',
      },
      {
        question: 'What tools and technologies can I use?',
        answer:
          'You can use any programming language, framework, or tool you want. There are no restrictions on technology choices.',
      },
    ],
  },
];

function FAQItemComponent({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-dashed border-hacknu-border">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex h-auto w-full items-start justify-between px-4 py-5 text-left hover:bg-white/2"
      >
        <span className="pr-4 text-sm text-wrap text-hacknu-text transition-colors group-hover:text-hacknu-green md:text-base">
          {item.question}
        </span>
        <span className="mt-0.5 shrink-0 font-mono text-sm text-hacknu-green">
          [{isOpen ? '−' : '+'}]
        </span>
      </Button>
      {isOpen && (
        <div className="px-4 pb-5">
          <p className="border-l-2 border-hacknu-green/20 pl-0 text-sm leading-relaxed text-hacknu-text-muted md:ml-0 md:pl-4">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="bg-hacknu-dark py-20 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        {/* Section Header */}
        <p className="terminal-header mb-4"># --- Frequently Asked Questions ---</p>
        <h2 className="mb-12 text-3xl font-bold text-hacknu-text md:mb-16 md:text-5xl">FAQ</h2>

        {/* FAQ Categories */}
        <div className="space-y-10">
          {faqData.map((category, catIndex) => (
            <div key={catIndex}>
              {/* Category Header */}
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-xs tracking-wider text-hacknu-purple uppercase md:text-sm">
                  # {category.name}
                </span>
                <Separator className="flex-1 bg-hacknu-border" />
              </div>

              {/* FAQ Items */}
              <div className="border-t border-dashed border-hacknu-border">
                {category.items.map((item, itemIndex) => (
                  <FAQItemComponent key={itemIndex} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
