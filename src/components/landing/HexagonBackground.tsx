'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface HexagonBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  /** Base hexagon width in pixels */
  hexagonSize?: number;
  /** Gap between hexagons in pixels */
  hexagonMargin?: number;
  /** Base border color */
  borderColor?: string;
  /** Animation interval in milliseconds */
  animationInterval?: number;
  /** Number of hexagons to activate at once */
  hexagonsPerWave?: number;
}

const HEX_CLIP =
  'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

const HEX_BASE_CLASS =
  'relative shrink-0 transition-all duration-1000 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] before:absolute before:inset-0 before:transition-all before:duration-500 after:absolute after:bg-hacknu-dark after:[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] after:transition-all after:duration-500';

const GLOW_COLORS = ['#58E191', '#E256FF'] as const;

interface HexCellProps {
  rowIndex: number;
  colIndex: number;
  isActive: boolean;
  scaledHexWidth: number;
  scaledHexHeight: number;
  scaledMargin: number;
  borderColor: string;
}

const HexCell = memo(function HexCell({
  rowIndex,
  colIndex,
  isActive,
  scaledHexWidth,
  scaledHexHeight,
  scaledMargin,
  borderColor,
}: HexCellProps) {
  const glowColor = GLOW_COLORS[(rowIndex + colIndex) % GLOW_COLORS.length];

  return (
    <div
      className={HEX_BASE_CLASS}
      style={{
        width: scaledHexWidth,
        height: scaledHexHeight,
        marginLeft: scaledMargin,
        contain: 'layout style paint',
        ...(isActive
          ? {
              '--border-color': glowColor,
              '--glow-opacity': '0.6',
            }
          : {
              '--border-color': borderColor,
              '--glow-opacity': '0',
            }),
      } as React.CSSProperties}
    >
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: 'var(--border-color)',
          filter: isActive
            ? `drop-shadow(0 0 20px ${glowColor})`
            : 'none',
        }}
      />
      <div
        className="absolute transition-all duration-500"
        style={{
          inset: scaledMargin,
          background: isActive
            ? 'rgba(24, 24, 27, 0.9)'
            : 'var(--hacknu-dark)',
          clipPath: HEX_CLIP,
        }}
      />
    </div>
  );
});

export function HexagonBackground({
  className,
  children,
  hexagonSize = 60,
  hexagonMargin = 2,
  borderColor = 'rgba(63, 63, 70, 0.5)',
  animationInterval = 350,
  hexagonsPerWave = 5,
}: HexagonBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState({ rows: 0, cols: 0, scale: 1 });
  const [activeHexagons, setActiveHexagons] = useState<Set<string>>(new Set());
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hexWidth = hexagonSize;
  const hexHeight = hexagonSize * 1.15;
  const rowSpacing = hexagonSize * 0.86;

  const updateGrid = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    const scale = Math.max(1, Math.min(width, height) / 800);
    const scaledSize = hexagonSize * scale;

    const cols = Math.ceil(width / scaledSize) + 2;
    const rows = Math.ceil(height / (scaledSize * 0.86)) + 2;

    setGrid({ rows, cols, scale });
  }, [hexagonSize]);

  useEffect(() => {
    updateGrid();
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(updateGrid);
    ro.observe(container);
    return () => ro.disconnect();
  }, [updateGrid]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const animate = () => {
      if (grid.rows === 0 || grid.cols === 0) return;

      const numToActivate =
        Math.floor(Math.random() * hexagonsPerWave) + hexagonsPerWave;
      const newActive = new Set<string>();

      for (let i = 0; i < numToActivate; i++) {
        const randomRow = Math.floor(Math.random() * grid.rows);
        const randomCol = Math.floor(Math.random() * grid.cols);
        newActive.add(`${randomRow}-${randomCol}`);
      }

      setActiveHexagons((prev) => new Set([...prev, ...newActive]));

      setTimeout(() => {
        setActiveHexagons((prev) => {
          const next = new Set(prev);
          newActive.forEach((id) => next.delete(id));
          return next;
        });
      }, 1200);
    };

    animate();
    animationRef.current = setInterval(animate, animationInterval);

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [grid.rows, grid.cols, animationInterval, hexagonsPerWave]);

  const scaledHexWidth = hexWidth * grid.scale;
  const scaledHexHeight = hexHeight * grid.scale;
  const scaledRowSpacing = rowSpacing * grid.scale;
  const scaledMargin = hexagonMargin * grid.scale;

  return (
    <div
      ref={containerRef}
      className={cn('fixed inset-0 overflow-hidden bg-hacknu-dark', className)}
    >
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: grid.rows }).map((_, rowIndex) => {
          const isOddRow = rowIndex % 2 === 1;
          const marginLeft = isOddRow
            ? -(scaledHexWidth / 2) + scaledMargin
            : scaledMargin;

          return (
            <div
              key={rowIndex}
              className="flex"
              style={{
                marginTop:
                  rowIndex === 0
                    ? -scaledHexHeight * 0.25
                    : -scaledRowSpacing * 0.16,
                marginLeft: marginLeft - scaledHexWidth * 0.1,
              }}
            >
              {Array.from({ length: grid.cols }).map((_, colIndex) => (
                <HexCell
                  key={`${rowIndex}-${colIndex}`}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  isActive={activeHexagons.has(`${rowIndex}-${colIndex}`)}
                  scaledHexWidth={scaledHexWidth}
                  scaledHexHeight={scaledHexHeight}
                  scaledMargin={scaledMargin}
                  borderColor={borderColor}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Ambient glow overlay - HackNU green/purple */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(88, 225, 145, 0.15) 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 80%, rgba(226, 86, 255, 0.1) 0%, transparent 50%)`,
        }}
      />

      {children && (
        <div className="relative z-10 h-full w-full">{children}</div>
      )}
    </div>
  );
}
