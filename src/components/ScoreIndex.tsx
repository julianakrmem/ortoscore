import { useState } from 'react';
import { CATEGORIES, SCORES } from '../scores';
import { ChevronRight, SearchIcon } from './Icons';

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Lista de escores por categoria. `compact` é a versão da barra lateral do desktop. */
export function ScoreIndex({ selectedId, onSelect, compact }: { selectedId: string; onSelect: (id: string) => void; compact?: boolean }) {
  const [q, setQ] = useState('');
  const filtered = SCORES.filter((s) => norm(`${s.name} ${s.purpose} ${s.category}`).includes(norm(q.trim())));

  return (
    <nav aria-label="Escores">
      <label className="relative block">
        <span className="sr-only">Buscar escore</span>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={compact ? 'Buscar escore' : 'Buscar: tornozelo, exposta, quadril…'}
          className="h-11 w-full rounded-xl border border-line bg-surface pr-3 pl-9 text-[16px] outline-none placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20 lg:text-sm"
        />
      </label>

      {CATEGORIES.map((cat) => {
        const items = filtered.filter((s) => s.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className={compact ? 'mt-6' : 'mt-7'}>
            <h2 className="mb-1.5 px-1 font-display text-[15px] font-semibold text-titanium">{cat}</h2>
            <ul className={compact ? '' : 'overflow-hidden rounded-2xl border border-line bg-surface'}>
              {items.map((s) => {
                const active = s.id === selectedId;
                if (compact) {
                  return (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelect(s.id);
                        }}
                        aria-current={active ? 'page' : undefined}
                        className={`relative block rounded-lg px-3 py-2 text-[15px] leading-tight transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none ${
                          active ? 'bg-accent-soft font-semibold text-accent' : 'hover:bg-surface'
                        }`}
                      >
                        {active && <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-accent" aria-hidden />}
                        {s.shortName}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={s.id} className="border-b border-line last:border-b-0">
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelect(s.id);
                      }}
                      className="flex min-h-[64px] items-center gap-3 px-4 py-3 active:bg-paper focus-visible:bg-accent-soft focus-visible:outline-none"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-semibold">{s.shortName}</span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-muted">{s.purpose}</span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-titanium" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {!filtered.length && (
        <p className="mt-6 px-1 text-sm text-muted">Nenhum escore com “{q}”. Tente “joelho”, “cervical” ou “fratura”.</p>
      )}
    </nav>
  );
}
