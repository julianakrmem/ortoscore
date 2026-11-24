import type { BooleanField, ChoiceField } from '../scores';
import { CheckIcon } from './Icons';

export function BooleanRow({ field, value, onChange }: { field: BooleanField; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      className={`flex min-h-[56px] cursor-pointer items-start gap-3.5 rounded-xl border px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/50 ${
        value ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-titanium'
      }`}
    >
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span
        aria-hidden
        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors ${
          value ? 'border-accent bg-accent text-on-accent' : 'border-titanium/60'
        }`}
      >
        {value && <CheckIcon />}
      </span>
      <span className="min-w-0">
        <span className="block text-[16px] leading-snug font-medium">{field.label}</span>
        {field.hint && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{field.hint}</span>}
      </span>
    </label>
  );
}

export function ChoiceGroup({ field, value, onChange }: { field: ChoiceField; value: string | undefined; onChange: (v: string) => void }) {
  const showPoints = field.options.some((o) => o.points !== undefined);
  const compact = field.options.length <= 3 && field.options.every((o) => !o.hint && o.label.length < 18);
  return (
    <fieldset className="rounded-xl border border-line bg-surface p-3">
      <legend className="float-left w-full px-1 pb-2 text-[16px] leading-snug font-medium">{field.label}</legend>
      {field.hint && <p className="clear-left -mt-1 px-1 pb-2 text-[13px] text-muted">{field.hint}</p>}
      <div className={`clear-left ${compact ? 'grid grid-cols-2 gap-2 sm:grid-cols-3' : 'space-y-1.5'}`}>
        {field.options.map((o) => {
          const active = value === o.value;
          return (
            <label
              key={o.value}
              className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/60 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface ${
                active ? 'border-accent bg-accent text-on-accent' : 'border-transparent bg-paper hover:border-line'
              }`}
            >
              <input type="radio" name={field.id} value={o.value} checked={active} onChange={() => onChange(o.value)} className="sr-only" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-snug font-medium">{o.label}</span>
                {o.hint && <span className={`mt-0.5 block text-[13px] leading-snug ${active ? 'text-on-accent/80' : 'text-muted'}`}>{o.hint}</span>}
              </span>
              {showPoints && (
                <span className={`font-display text-lg font-semibold tabular-nums ${active ? '' : 'text-titanium'}`}>
                  {o.points}
                  <span className="sr-only"> {o.points === 1 ? 'ponto' : 'pontos'}</span>
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
