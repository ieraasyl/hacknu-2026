import { useRef, useLayoutEffect } from 'react';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Letter {
  char: string;
  color: string;
  targetColor: string;
  colorProgress: number;
  drawnAt?: number;
}

interface LetterGlitchProps {
  glitchColors?: string[];
  className?: string;
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
}

const LetterGlitch = ({
  glitchColors = ['#2b4539', '#61dca3', '#61b3dc'],
  className = '',
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789',
}: LetterGlitchProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<Letter[]>([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(0);
  const streamRef = useRef<{ nextIndex: number; total: number } | null>(null);
  const lastStreamDrawTime = useRef(0);
  const fadingIndices = useRef<Set<number>>(new Set());

  const lettersAndSymbols = Array.from(characters);

  const fontSize = 24;
  const charWidth = 14;
  const charHeight = 28;
  const BATCH_SIZE = 50;
  const STREAM_INTERVAL_MS = 40;
  const FADE_DURATION_MS = 120;

  const getRandomChar = () => {
    return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  };

  const getRandomColor = () => {
    return glitchColors[Math.floor(Math.random() * glitchColors.length)];
  };

  const hexToRgb = (hex: string): Rgb | null => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const expanded = hex.replace(shorthandRegex, (_m, r: string, g: string, b: string) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(expanded);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const interpolateColor = (start: Rgb, end: Rgb, factor: number) => {
    const result = {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor),
    };
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
  };

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1,
    }));
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);

    streamRef.current = { nextIndex: 0, total: letters.current.length };
  };

  const drawLetterAtIndex = (index: number, alpha = 1) => {
    const ctx = context.current;
    const letter = letters.current[index];
    if (!ctx || !letter) return;
    const x = (index % grid.current.columns) * charWidth;
    const y = Math.floor(index / grid.current.columns) * charHeight;
    ctx.clearRect(x, y, charWidth, charHeight);
    ctx.globalAlpha = alpha;
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = letter.color;
    ctx.fillText(letter.char, x, y);
    ctx.globalAlpha = 1;
  };

  const drawLettersRange = (startIndex: number, endIndex: number, now: number) => {
    if (!context.current || letters.current.length === 0) return;
    for (let i = startIndex; i < endIndex && i < letters.current.length; i++) {
      const letter = letters.current[i];
      if (!letter.drawnAt) letter.drawnAt = now;
      fadingIndices.current.add(i);
    }
  };

  const drawLetters = (indices?: number[] | null) => {
    const ctx = context.current;
    if (!ctx || letters.current.length === 0) return;
    if (indices && indices.length > 0) {
      indices.forEach((i) => drawLetterAtIndex(i, 1));
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = 'top';
      letters.current.forEach((letter, index) => {
        const x = (index % grid.current.columns) * charWidth;
        const y = Math.floor(index / grid.current.columns) * charHeight;
        ctx.fillStyle = letter.color;
        ctx.fillText(letter.char, x, y);
      });
    }
  };

  const updateLetters = (maxIndex?: number | null) => {
    if (!letters.current || letters.current.length === 0) return [];

    const poolSize = maxIndex ?? letters.current.length;
    if (poolSize <= 0) return [];

    const updateCount = Math.max(1, Math.floor(poolSize * 0.05));
    const changedIndices: number[] = [];

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * poolSize);
      const letter = letters.current[index];
      if (!letter) continue;

      letter.char = getRandomChar();
      letter.targetColor = getRandomColor();

      if (!smooth) {
        letter.color = letter.targetColor;
        letter.colorProgress = 1;
      } else {
        letter.colorProgress = 0;
      }
      changedIndices.push(index);
    }
    return changedIndices;
  };

  const handleSmoothTransitions = (maxIndex?: number | null) => {
    const indicesToRedraw: number[] = [];
    const end = maxIndex ?? letters.current.length;
    for (let index = 0; index < end; index++) {
      const letter = letters.current[index];
      if (!letter || letter.colorProgress >= 1) continue;

      letter.colorProgress += 0.05;
      if (letter.colorProgress > 1) letter.colorProgress = 1;

      const startRgb = hexToRgb(letter.color);
      const endRgb = hexToRgb(letter.targetColor);
      if (startRgb && endRgb) {
        letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
        indicesToRedraw.push(index);
      }
    }

    if (indicesToRedraw.length > 0) {
      drawLetters(indicesToRedraw);
    }
  };

  const animate = (timestamp: number) => {
    const stream = streamRef.current;
    const now = timestamp;

    if (stream && stream.nextIndex < stream.total) {
      if (now - lastStreamDrawTime.current >= STREAM_INTERVAL_MS) {
        if (stream.nextIndex === 0) {
          const canvas = canvasRef.current;
          const ctx = context.current;
          if (canvas && ctx) {
            const { width, height } = canvas.getBoundingClientRect();
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
          }
        }
        const endIndex = Math.min(stream.nextIndex + BATCH_SIZE, stream.total);
        drawLettersRange(stream.nextIndex, endIndex, now);
        stream.nextIndex = endIndex;
        lastStreamDrawTime.current = now;
        if (stream.nextIndex >= stream.total) {
          streamRef.current = null;
        }
      }
    }

    const drawnCount = stream ? stream.nextIndex : letters.current.length;

    for (const index of [...fadingIndices.current]) {
      const letter = letters.current[index];
      if (!letter?.drawnAt) continue;
      const elapsed = now - letter.drawnAt;
      const alpha = Math.min(1, elapsed / FADE_DURATION_MS);
      drawLetterAtIndex(index, alpha);
      if (alpha >= 1) fadingIndices.current.delete(index);
    }

    if (drawnCount > 0) {
      if (now - lastGlitchTime.current >= glitchSpeed) {
        const changedIndices = updateLetters(drawnCount);
        if (changedIndices.length > 0) {
          changedIndices.forEach((i) => fadingIndices.current.delete(i));
          drawLetters(changedIndices);
        }
        lastGlitchTime.current = now;
      }

      if (smooth) {
        handleSmoothTransitions(drawnCount);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext('2d');
    lastGlitchTime.current = performance.now();
    resizeCanvas();
    animationRef.current = requestAnimationFrame(animate);

    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
        resizeCanvas();
        animationRef.current = requestAnimationFrame(animate);
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
    // animate and resizeCanvas are stable - they only use refs and props from closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glitchSpeed, smooth]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden',
  };

  const canvasStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
  };

  const vignetteStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  };

  const outerVignetteStyle: React.CSSProperties = {
    ...vignetteStyle,
    background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)',
  };

  const centerVignetteStyle: React.CSSProperties = {
    ...vignetteStyle,
    background: 'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)',
  };

  return (
    <div style={containerStyle} className={className}>
      <canvas ref={canvasRef} style={canvasStyle} />
      {outerVignette && <div style={outerVignetteStyle} />}
      {centerVignette && <div style={centerVignetteStyle} />}
    </div>
  );
};

export default LetterGlitch;
