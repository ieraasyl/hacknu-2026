import { useTranslation } from 'react-i18next';
import { useWebHaptics } from 'web-haptics/react';
import { supportedLngs } from '@/i18n';
import { webHapticsOptions } from '@/lib/web-haptics';

type LanguageSwitcherProps = {
  /** Called when language changes (e.g. to close mobile menu) */
  onLanguageChange?: () => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional class for the container */
  className?: string;
};

export function LanguageSwitcher({
  onLanguageChange,
  size = 'sm',
  className = '',
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const { trigger } = useWebHaptics(webHapticsOptions);

  const changeLanguage = (lng: string) => {
    trigger?.('light');
    i18n.changeLanguage(lng);
    onLanguageChange?.();
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const activeClass = 'text-hacknu-green font-medium';
  const inactiveClass = 'text-hacknu-text-muted transition-colors hover:text-hacknu-green';

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="group"
      aria-label={t('common.switchLanguage')}
    >
      {supportedLngs.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => changeLanguage(lng)}
          className={`${sizeClasses} font-medium uppercase ${i18n.language === lng ? activeClass : inactiveClass}`}
          aria-pressed={i18n.language === lng}
          aria-label={`${t('common.switchLanguage')} — ${lng.toUpperCase()}`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
