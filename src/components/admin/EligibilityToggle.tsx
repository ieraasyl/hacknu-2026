import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type EligibilityFilter = 'all' | 'eligible' | 'not-eligible';

const itemClass =
  'hover:bg-hacknu-dark-card/60 hover:text-hacknu-text aria-pressed:bg-hacknu-dark-card aria-pressed:text-hacknu-text';

type EligibilityToggleProps = {
  value: EligibilityFilter;
  onChange: (value: EligibilityFilter) => void;
};

function nextFilterFromToggleValue(next: string[]): EligibilityFilter | null {
  const v = next[0];
  if (v === 'all' || v === 'eligible' || v === 'not-eligible') return v;
  return null;
}

export function EligibilityToggle({ value, onChange }: EligibilityToggleProps) {
  return (
    <ToggleGroup
      spacing={0}
      variant="outline"
      size="sm"
      value={[value]}
      onValueChange={(v) => {
        const parsed = nextFilterFromToggleValue(v);
        if (parsed !== null) onChange(parsed);
      }}
      className="ml-auto shrink-0 border-hacknu-border text-hacknu-text-muted"
    >
      <ToggleGroupItem value="all" className={itemClass}>
        All
      </ToggleGroupItem>
      <ToggleGroupItem value="eligible" className={itemClass}>
        Eligible
      </ToggleGroupItem>
      <ToggleGroupItem value="not-eligible" className={itemClass}>
        Not eligible
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
