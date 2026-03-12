import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { PilotState } from '@/lib/pilot-state.functions';

interface NERVOverlayProps {
  state: PilotState;
  onClose: () => void;
}

interface Line {
  text: string;
  color: 'green' | 'amber' | 'red' | 'muted';
  delay: number;
}

const colorClass: Record<Line['color'], string> = {
  green: 'text-hacknu-green',
  amber: 'text-yellow-400',
  red: 'text-red-400',
  muted: 'text-hacknu-text-muted',
};

// Line templates: color + delay. Text comes from i18n.
const LINE_TEMPLATES: Record<PilotState, { color: Line['color']; delay: number }[]> = {
  unknown: [
    { color: 'muted', delay: 0 },
    { color: 'muted', delay: 400 },
    { color: 'amber', delay: 800 },
    { color: 'red', delay: 1600 },
    { color: 'red', delay: 2000 },
    { color: 'red', delay: 2400 },
    { color: 'muted', delay: 2900 },
    { color: 'red', delay: 3100 },
    { color: 'red', delay: 3400 },
    { color: 'red', delay: 3700 },
    { color: 'muted', delay: 4100 },
    { color: 'amber', delay: 4400 },
  ],
  unregistered: [
    { color: 'muted', delay: 0 },
    { color: 'muted', delay: 400 },
    { color: 'amber', delay: 800 },
    { color: 'green', delay: 1600 },
    { color: 'red', delay: 2000 },
    { color: 'red', delay: 2400 },
    { color: 'muted', delay: 2900 },
    { color: 'green', delay: 3100 },
    { color: 'red', delay: 3400 },
    { color: 'red', delay: 3700 },
    { color: 'muted', delay: 4100 },
    { color: 'amber', delay: 4400 },
  ],
  noteam: [
    { color: 'muted', delay: 0 },
    { color: 'muted', delay: 400 },
    { color: 'amber', delay: 800 },
    { color: 'green', delay: 1600 },
    { color: 'green', delay: 2000 },
    { color: 'amber', delay: 2400 },
    { color: 'muted', delay: 2900 },
    { color: 'green', delay: 3100 },
    { color: 'amber', delay: 3400 },
    { color: 'amber', delay: 3700 },
    { color: 'muted', delay: 4100 },
    { color: 'amber', delay: 4400 },
  ],
  ready: [
    { color: 'muted', delay: 0 },
    { color: 'muted', delay: 400 },
    { color: 'amber', delay: 800 },
    { color: 'green', delay: 1600 },
    { color: 'green', delay: 2000 },
    { color: 'green', delay: 2400 },
    { color: 'muted', delay: 2900 },
    { color: 'green', delay: 3100 },
    { color: 'green', delay: 3400 },
    { color: 'green', delay: 3700 },
    { color: 'muted', delay: 4100 },
    { color: 'green', delay: 4400 },
  ],
};

const CTA_HREFS: Record<PilotState, string | null> = {
  unknown: '/login',
  unregistered: '/onboarding',
  noteam: '/dashboard',
  ready: null,
};

const noop = () => {};

const TypewriterLine: FC<{
  text: string;
  color: Line['color'];
  onDone: () => void;
}> = ({ text, color, onDone }) => {
  const [displayed, setDisplayed] = useState('');
  const i = useRef(0);

  useEffect(() => {
    i.current = 0;
    const id = setTimeout(() => setDisplayed(''), 0);
    const intervalId = setInterval(() => {
      i.current++;
      setDisplayed(text.slice(0, i.current));
      if (i.current >= text.length) {
        clearInterval(intervalId);
        onDone();
      }
    }, 18);
    return () => {
      clearTimeout(id);
      clearInterval(intervalId);
    };
  }, [text, onDone]);

  return (
    <span className={`font-mono text-xs leading-5 md:text-sm ${colorClass[color]}`}>
      {displayed}
      <span className="animate-pulse">█</span>
    </span>
  );
};

export const NERVOverlay: FC<NERVOverlayProps> = ({ state, onClose }) => {
  const { t, i18n } = useTranslation();
  const templates = LINE_TEMPLATES[state];
  const lines = useMemo<Line[]>(
    () =>
      templates.map((tmpl, idx) => ({
        ...tmpl,
        text: t(`nervOverlay.lines.${state}.${idx}`),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- i18n.language needed for language switch
    [state, i18n.language, templates, t],
  );
  const ctaLabel = state !== 'ready' ? t(`nervOverlay.cta.${state}`) : null;
  const ctaHref = CTA_HREFS[state];
  const cta = ctaHref ? { label: ctaLabel!, href: ctaHref } : null;

  const [visibleCount, setVisibleCount] = useState(0);
  const [printingIndex, setPrintingIndex] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Schedule line reveals and CTA whenever state changes
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    queueMicrotask(() => {
      setVisibleCount(0);
      setPrintingIndex(0);
      setShowCTA(false);
    });

    lines.forEach((line, idx) => {
      const id = setTimeout(() => {
        setVisibleCount((c) => Math.max(c, idx + 1));
        setPrintingIndex(idx);
      }, line.delay);
      timers.current.push(id);
    });

    const lastLine = lines[lines.length - 1];
    const ctaDelay = lastLine.delay + lastLine.text.length * 18 + 400;
    const ctaTimer = setTimeout(() => setShowCTA(true), ctaDelay);
    timers.current.push(ctaTimer);

    return () => timers.current.forEach(clearTimeout);
  }, [state, lines]);

  // Escape key closes the overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        }}
      />

      <div
        className="relative mx-4 w-full max-w-lg rounded border border-hacknu-green/30 bg-black p-6 shadow-[0_0_40px_rgba(88,225,145,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-hacknu-green" />
            <span className="font-mono text-xs tracking-widest text-hacknu-green uppercase">
              {t('nervOverlay.header')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-hacknu-text-muted transition-colors hover:text-hacknu-green"
          >
            {t('nervOverlay.esc')}
          </button>
        </div>

        {/* Terminal lines */}
        <div className="min-h-[220px] space-y-0.5">
          {lines.slice(0, visibleCount).map((line, idx) =>
            idx === printingIndex ? (
              <div key={idx}>
                <TypewriterLine text={line.text} color={line.color} onDone={noop} />
              </div>
            ) : (
              <div key={idx}>
                <span
                  className={`font-mono text-xs leading-5 md:text-sm ${colorClass[line.color]}`}
                >
                  {line.text}
                </span>
              </div>
            ),
          )}
        </div>

        {/* CTA */}
        {showCTA && (
          <div className="mt-6 border-t border-hacknu-green/20 pt-4">
            {cta ? (
              <a
                href={cta.href}
                className="block w-full border border-hacknu-green/50 py-2 text-center font-mono text-sm tracking-widest text-hacknu-green transition-all hover:border-hacknu-green hover:bg-hacknu-green/10 hover:shadow-[0_0_20px_rgba(88,225,145,0.2)]"
              >
                {cta.label}
              </a>
            ) : (
              <div className="animate-pulse text-center font-mono text-sm tracking-widest text-hacknu-green">
                {t('nervOverlay.readyMessage')}
              </div>
            )}
            <p className="mt-3 text-center font-mono text-xs text-hacknu-text-muted">
              {t('nervOverlay.closeHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
