import { LanguageSwitcher } from '@/components/LanguageSwitcher';

type AuthHeaderProps = {
  /** Logo size: sm for compact pages, md for login/onboarding */
  logoSize?: 'sm' | 'md';
};

export function AuthHeader({ logoSize = 'md' }: AuthHeaderProps) {
  const logoClass = logoSize === 'sm' ? 'text-2xl' : 'text-3xl';

  return (
    <header className="flex items-center justify-between border-b border-hacknu-border/50 bg-hacknu-dark/80 px-6 py-4 backdrop-blur-md">
      <a href="/" className="flex items-center gap-2">
        <span className={`font-bold tracking-tighter text-hacknu-green ${logoClass}`}>HackNU</span>
        <span className={`font-bold tracking-tighter text-hacknu-purple ${logoClass}`}>/26</span>
      </a>
      <LanguageSwitcher size="sm" />
    </header>
  );
}
