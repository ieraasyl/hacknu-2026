export function BackgroundGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(rgba(88,225,145,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(88,225,145,0.5) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />
  );
}

export function GradientOrbs() {
  return (
    <>
      <div className="pointer-events-none fixed top-1/3 left-1/4 h-96 w-96 rounded-full bg-hacknu-green/5 blur-[120px]" />
      <div className="pointer-events-none fixed right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-hacknu-purple/5 blur-[120px]" />
    </>
  );
}
