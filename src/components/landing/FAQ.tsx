import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DecryptedText from '@/components/landing/DecryptedText';
import ModelViewer from '@/components/landing/ModelViewer';
import { NERVOverlay } from '@/components/landing/NERVOverlay';
import { getPilotState, type PilotState } from '@/lib/pilot-state.functions';
import type { Session } from '@/lib/types';

function FloatingModel({ onModelClick }: { onModelClick: () => void }) {
  return (
    <div className="fixed right-6 bottom-6 z-40 hidden md:block">
      <ModelViewer
        url="/models/chibi+character+3d+model.glb"
        width={260}
        height={260}
        modelXOffset={0}
        modelYOffset={0}
        defaultRotationX={0}
        defaultRotationY={20}
        defaultZoom={2.5}
        minZoomDistance={1}
        maxZoomDistance={8}
        enableMouseParallax
        enableHoverRotation
        enableManualRotation
        enableManualZoom={false}
        environmentPreset="none"
        ambientIntensity={1.2}
        keyLightIntensity={1.5}
        fillLightIntensity={0.8}
        rimLightIntensity={1}
        autoRotate
        autoRotateSpeed={0.35}
        fadeIn={false}
        showScreenshotButton={false}
        onModelClick={onModelClick}
      />
    </div>
  );
}

const FAQ_KEYS = [
  { catKey: 'general', items: ['q1', 'q2', 'q3'] },
  { catKey: 'participation', items: ['q4', 'q5', 'q6'] },
  { catKey: 'venueLogistics', items: ['q7', 'q8', 'q9'] },
  { catKey: 'projectDevelopment', items: ['q10', 'q11', 'q12'] },
] as const;

function FAQItemComponent({ questionKey, answerKey }: { questionKey: string; answerKey: string }) {
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
          <DecryptedText
            text={t(questionKey)}
            animateOn="view"
            sequential
            encryptedClassName="text-hacknu-purple/60"
          />
        </span>
        <span className="mt-0.5 shrink-0 font-mono text-sm text-hacknu-green">
          [{isOpen ? '−' : '+'}]
        </span>
      </Button>
      {isOpen && (
        <div className="px-4 pb-5">
          <p className="border-l-2 border-hacknu-green/20 pl-4 text-sm leading-relaxed text-hacknu-text-muted">
            {t(answerKey)}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQ({ session }: { session: Session | null }) {
  const { t } = useTranslation();

  const [overlayState, setOverlayState] = useState<PilotState | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(() => setOverlayState(null), []);
  const handleModelClick = useCallback(async () => {
    if (loading) return;

    // Short-circuit: no session means state is known without hitting the server
    if (!session?.user) {
      setOverlayState('unknown');
      return;
    }

    setLoading(true);
    try {
      const state = await getPilotState();
      setOverlayState(state);
    } catch {
      setOverlayState('unknown');
    } finally {
      setLoading(false);
    }
  }, [session, loading]);

  return (
    <section id="faq" className="relative bg-hacknu-dark py-20 md:py-32">
      <FloatingModel onModelClick={handleModelClick} />
      {overlayState !== null && <NERVOverlay state={overlayState} onClose={handleClose} />}
      <div className="mx-auto max-w-4xl px-6">
        {/* Section Header */}
        <p className="terminal-header mb-4">{t('faq.header')}</p>
        <h2 className="mb-12 text-3xl font-bold text-hacknu-text md:mb-16 md:text-5xl">
          <DecryptedText
            text={t('faq.title')}
            animateOn="view"
            sequential
            encryptedClassName="text-hacknu-purple/60"
          />
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
