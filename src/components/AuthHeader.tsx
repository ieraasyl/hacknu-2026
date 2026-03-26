import { useNavigate } from '@tanstack/react-router';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function AuthHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-hacknu-border bg-hacknu-dark/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="flex cursor-pointer items-center gap-2"
        >
          <span className="text-2xl font-bold tracking-tighter text-hacknu-green">HackNU</span>
          <span className="text-2xl font-bold tracking-tighter text-hacknu-purple">/26</span>
        </button>
        <LanguageSwitcher size="sm" />
      </div>
    </header>
  );
}
