import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type AttendanceFilter = 'all' | 'attended' | 'not-attended';

const itemClass =
  'hover:bg-hacknu-dark-card/60 hover:text-hacknu-text aria-pressed:bg-hacknu-dark-card aria-pressed:text-hacknu-text';

type AttendanceToggleProps = {
  value: AttendanceFilter;
  onChange: (value: AttendanceFilter) => void;
};

function nextFilterFromToggleValue(next: string[]): AttendanceFilter | null {
  const value = next[0];
  if (value === 'all' || value === 'attended' || value === 'not-attended') return value;
  return null;
}

export function AttendanceToggle({ value, onChange }: AttendanceToggleProps) {
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
      <ToggleGroupItem value="attended" className={itemClass}>
        Attended
      </ToggleGroupItem>
      <ToggleGroupItem value="not-attended" className={itemClass}>
        Not attended
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
