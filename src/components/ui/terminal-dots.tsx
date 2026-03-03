export function TerminalDots({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 rounded-full bg-hacknu-green/60" />
      <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
      <div className="h-3 w-3 rounded-full bg-red-500/60" />
      <span className="ml-2 text-xs text-hacknu-text-muted">{label}</span>
    </div>
  );
}
