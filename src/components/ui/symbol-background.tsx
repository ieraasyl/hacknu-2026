import { useMemo } from 'react';

const SYMBOLS = '01&$#@%*+=<>[]{}|~`^_\\/?'.split('');
const COLS = 40;
const ROWS = 30;
const GREEN = '#58E191';
const PURPLE = '#E256FF';

export function SymbolBackground() {
  const symbols = useMemo(() => {
    return Array.from({ length: COLS * ROWS }, () => ({
      char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      initialColor: (Math.random() > 0.5 ? 'green' : 'purple') as 'green' | 'purple',
    }));
  }, []);

  return (
    <div className="symbol-bg absolute inset-0 size-full overflow-hidden" aria-hidden>
      <style>{`
        .symbol-bg .sym {
          transition: color 0.3s ease, opacity 0.3s ease;
        }
        .symbol-bg .sym[data-color="green"] { color: ${GREEN}; }
        .symbol-bg .sym[data-color="purple"] { color: ${PURPLE}; }
        .symbol-bg .sym[data-color="green"]:hover { color: ${PURPLE}; }
        .symbol-bg .sym[data-color="purple"]:hover { color: ${GREEN}; }
      `}</style>
      <div
        className="pointer-events-auto grid h-full w-full gap-0 overflow-hidden p-0 font-mono leading-none opacity-30"
        style={{
          fontFamily: 'JetBrains Mono Variable',
          fontSize: 'min(3vh, 3vw)',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {symbols.map(({ char, initialColor }, i) => (
          <span
            key={i}
            className="sym flex items-center justify-center hover:opacity-90"
            data-color={initialColor}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
