import { Badge } from '@/components/ui/badge';
import { ListChecksIcon } from '@phosphor-icons/react';

export type ColumnToggleDef<K extends string = string> = { key: K; label: string };

type ColumnToggleBarProps<K extends string> = {
  columns: ColumnToggleDef<K>[];
  visible: Record<string, boolean>;
  variant: 'green' | 'purple';
  onToggleColumn: (key: K) => void;
  onToggleAll: () => void;
};

export function ColumnToggleBar<K extends string>({
  columns,
  visible,
  variant,
  onToggleColumn,
  onToggleAll,
}: ColumnToggleBarProps<K>) {
  const allVisible = columns.every((c) => visible[c.key]);
  const activeClasses =
    variant === 'purple'
      ? 'border-hacknu-purple/40 bg-hacknu-purple/20 text-hacknu-purple hover:bg-hacknu-purple/30'
      : 'border-hacknu-green/40 bg-hacknu-green/20 text-hacknu-green hover:bg-hacknu-green/30';
  const inactiveClasses =
    'border-hacknu-border bg-transparent text-hacknu-text-muted/70 hover:border-hacknu-border hover:text-hacknu-text-muted';

  return (
    <>
      <button
        type="button"
        onClick={onToggleAll}
        title={allVisible ? 'Hide all columns' : 'Show all columns'}
        className="shrink-0 rounded p-0.5 text-hacknu-text-muted transition-colors hover:bg-hacknu-dark-card hover:text-hacknu-text"
        aria-label="Toggle all columns"
      >
        <ListChecksIcon className="size-4" />
      </button>
      {columns.map((col) => {
        const isVisible = visible[col.key] ?? true;
        return (
          <Badge
            key={col.key}
            variant={isVisible ? 'secondary' : 'outline'}
            role="button"
            tabIndex={0}
            className={`cursor-pointer transition-colors select-none ${
              isVisible ? activeClasses : inactiveClasses
            }`}
            onClick={() => onToggleColumn(col.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleColumn(col.key);
              }
            }}
          >
            {col.label}
          </Badge>
        );
      })}
    </>
  );
}
