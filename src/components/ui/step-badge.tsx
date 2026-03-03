export function StepBadge({
  step,
  label,
  done,
  active,
}: {
  step: number;
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
          done
            ? 'border-hacknu-green/60 bg-hacknu-green/10 text-hacknu-green'
            : active
              ? 'border-hacknu-purple bg-hacknu-purple/10 text-hacknu-purple'
              : 'border-hacknu-border bg-transparent text-hacknu-text-muted'
        }`}
      >
        {done ? '✓' : step}
      </div>
      <span
        className={`text-[10px] tracking-wider uppercase ${
          done ? 'text-hacknu-green' : active ? 'text-hacknu-purple' : 'text-hacknu-text-muted'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
