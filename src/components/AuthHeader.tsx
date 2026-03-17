import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-hacknu-border bg-hacknu-dark/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-hacknu-green">HackNU</span>
          <span className="text-2xl font-bold tracking-tighter text-hacknu-purple">/26</span>
        </a>
        <LanguageSwitcher size="sm" />
      </div>
    </header>
  );
}
