import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type TeamStatusFilter = 'all' | 'full' | 'incomplete' | 'no-show';

const itemClass =
  'hover:bg-hacknu-dark-card/60 hover:text-hacknu-text aria-pressed:bg-hacknu-dark-card aria-pressed:text-hacknu-text';

type TeamStatusToggleProps = {
  value: TeamStatusFilter;
  onChange: (value: TeamStatusFilter) => void;
};

function nextFilterFromToggleValue(next: string[]): TeamStatusFilter | null {
  const value = next[0];
  if (value === 'all' || value === 'full' || value === 'incomplete' || value === 'no-show') {
    return value;
  }
  return null;
}

export function TeamStatusToggle({ value, onChange }: TeamStatusToggleProps) {
  return (
    <ToggleGroup
      spacing={0}
      variant="outline"
      size="sm"
      value={[value]}
      onValueChange={(next) => {
        const parsed = nextFilterFromToggleValue(next);
        if (parsed !== null) onChange(parsed);
      }}
      className="ml-auto shrink-0 border-hacknu-border text-hacknu-text-muted"
    >
      <ToggleGroupItem value="all" className={itemClass}>
        All
      </ToggleGroupItem>
      <ToggleGroupItem value="full" className={itemClass}>
        Full
      </ToggleGroupItem>
      <ToggleGroupItem value="incomplete" className={itemClass}>
        Incomplete
      </ToggleGroupItem>
      <ToggleGroupItem value="no-show" className={itemClass}>
        No-show
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
