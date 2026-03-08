'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CONFIRM_RESET_MS = 3000;

export type ConfirmButtonProps = {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  variant?: 'outline' | 'destructive' | 'default' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'xs' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
  className?: string;
};

/**
 * Two-step confirmation button: first click shows "Are you sure?", second click executes.
 * Auto-resets to initial state after 3 seconds if not confirmed.
 * Inline state only — no modal or popover.
 */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  disabled = false,
  loading = false,
  loadingLabel,
  variant = 'outline',
  size = 'sm',
  className,
}: ConfirmButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return clearTimer;
  }, []);

  const handleClick = () => {
    if (disabled || loading) return;

    if (!isConfirming) {
      setIsConfirming(true);
      clearTimer();
      timeoutRef.current = window.setTimeout(() => {
        setIsConfirming(false);
        timeoutRef.current = null;
      }, CONFIRM_RESET_MS);
      return;
    }

    clearTimer();
    setIsConfirming(false);
    onConfirm();
  };

  const isDisabled = disabled || loading;
  const showConfirm = isConfirming && !loading;

  return (
    <Button
      size={size}
      variant={showConfirm ? 'destructive' : variant}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        showConfirm && 'border-red-500/60 text-red-400 hover:border-red-500 hover:bg-red-500/10',
        className,
      )}
    >
      {loading ? loadingLabel ?? '...' : showConfirm ? confirmLabel : label}
    </Button>
  );
}
