import { useEffect, useMemo, useState } from 'react';
import {
  CATEGORIES,
  chartNote,
  getScore,
  isVisible,
  missingFields,
  SCORES,
  type Answers,
  type BooleanField,
  type ChoiceField,
  type ResultLevel,
  type Score,
  type ScoreResult,
} from './scores';
import { THEME_LABEL, useTheme, type ThemeChoice } from './theme';

function useIsDesktop() {
  const query = '(min-width: 1024px)';
  const [match, setMatch] = useState(() => window.matchMedia?.(query).matches ?? true);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return match;
}

const readHash = () => decodeURIComponent(location.hash.replace('#', ''));

export default function App() {
  const { choice: theme, cycle: cycleTheme } = useTheme();
  const isDesktop = useIsDesktop();
  const [selectedId, setSelectedId] = useState<string>(() => (getScore(readHash()) ? readHash() : ''));
  const [answers, setAnswers] = useState<Record<string, Answers>>({});

  useEffect(() => {
    const onHash = () => setSelectedId(getScore(readHash()) ? readHash() : '');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const open = (id: string) => {
    if (id) history.pushState(null, '', `#${id}`);
    else history.pushState(null, '', location.pathname + location.search);
    setSelectedId(id);
    window.scrollTo({ top: 0 });
  };

  const score = getScore(selectedId);
  const desktopScore = score ?? SCORES[0];

  return (
    <div className="min-h-dvh bg-paper font-sans text-ink">
      <Header theme={theme} onTheme={cycleTheme} onHome={() => open('')} />

      {/* Celular: índice ou escore, um de cada vez */}
      {!isDesktop && (
      <div>
        {score ? (
          <ScoreScreen
            key={score.id}
            score={score}
            answers={answers[score.id] ?? {}}
            onChange={(a) => setAnswers((s) => ({ ...s, [score.id]: a }))}
            onBack={() => open('')}
          />
        ) : (
          <main className="px-4 pb-16">
            <Intro />
            <ScoreIndex selectedId="" onSelect={open} />
          </main>
        )}
      </div>
      )}

      {/* Desktop: índice | perguntas | resultado */}
      {isDesktop && (
      <div className="mx-auto grid max-w-[1320px] grid-cols-[260px_minmax(0,1fr)_380px] gap-8 px-6 pb-16 xl:gap-10">
        <aside className="sticky top-[72px] self-start pt-6">
          <ScoreIndex selectedId={desktopScore.id} onSelect={open} compact />
        </aside>
        <ScoreScreen
          key={desktopScore.id}
          score={desktopScore}
          answers={answers[desktopScore.id] ?? {}}
          onChange={(a) => setAnswers((s) => ({ ...s, [desktopScore.id]: a }))}
          desktop
        />
      </div>
      )}

      <footer className="mx-auto max-w-[1320px] px-4 pb-24 text-[13px] leading-relaxed text-muted lg:px-6 lg:pb-10">
        Ferramenta educacional. Os escores apoiam, mas não substituem, o exame clínico e o julgamento da equipe.
        Confira sempre a referência original e o protocolo da sua instituição.
      </footer>
    </div>
  );
}

// ─── Cabeçalho ───────────────────────────────────────────────────────────────

function Header({ theme, onTheme, onHome }: { theme: ThemeChoice; onTheme: () => void; onHome: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/92 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-3 px-4 lg:h-[72px] lg:px-6">
        <button type="button" onClick={onHome} className="flex items-center gap-2.5 rounded-lg" aria-label="OrtoScore, início">
          <Logo />
          <span className="font-display text-2xl font-semibold leading-none tracking-tight">OrtoScore</span>
        </button>
        <span className="ml-1 hidden text-sm text-muted md:inline">Escores ortopédicos e de trauma</span>
        <button
          type="button"
          onClick={onTheme}
          className="ml-auto flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm font-medium hover:border-titanium"
          aria-label={`Tema: ${THEME_LABEL[theme]}. Toque para trocar.`}
          title="Trocar tema"
        >
          <ThemeIcon choice={theme} />
          <span className="hidden sm:inline">{THEME_LABEL[theme]}</span>
        </button>
      </div>
    </header>
  );
}

function Intro() {
  return (
    <section className="pt-7 pb-6">
      <h1 className="font-display text-[40px] font-semibold leading-[1.02] tracking-tight text-balance">
        Escores de ortopedia e trauma, respondidos como no exame.
      </h1>
      <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-muted">
        Perguntas guiadas, o cálculo explicado passo a passo e a referência de cada regra. Para estudo e apoio no pronto-socorro.
      </p>
    </section>
  );
}

// ─── Índice de escores ───────────────────────────────────────────────────────

function ScoreIndex({ selectedId, onSelect, compact }: { selectedId: string; onSelect: (id: string) => void; compact?: boolean }) {
  const [q, setQ] = useState('');
  const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const filtered = SCORES.filter((s) => norm(`${s.name} ${s.purpose}`).includes(norm(q)));

  return (
    <nav aria-label="Escores">
      <label className="relative block">
        <span className="sr-only">Buscar escore</span>
        <svg viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="9" cy="9" r="5.5" />
          <path d="m13.5 13.5 3 3" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar: tornozelo, exposta, quadril…"
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
                return (
                  <li key={s.id} className={compact ? '' : 'border-b border-line last:border-b-0'}>
                    <button
                      type="button"
                      onClick={() => onSelect(s.id)}
                      aria-current={active ? 'page' : undefined}
                      className={
                        compact
                          ? `relative w-full rounded-lg px-3 py-2 text-left text-[15px] leading-tight transition-colors ${
                              active ? 'bg-accent-soft font-semibold text-accent' : 'hover:bg-surface'
                            }`
                          : 'flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left active:bg-paper'
                      }
                    >
                      {compact ? (
                        <>
                          {active && <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-accent" aria-hidden />}
                          {s.shortName}
                        </>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[16px] font-semibold">{s.shortName}</span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-muted">{s.purpose}</span>
                          </span>
                          <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-titanium" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {!filtered.length && <p className="mt-6 px-1 text-sm text-muted">Nenhum escore com esse termo. Tente "joelho" ou "fratura".</p>}
    </nav>
  );
}

// ─── Tela do escore ──────────────────────────────────────────────────────────

function ScoreScreen({
  score,
  answers,
  onChange,
  onBack,
  desktop,
}: {
  score: Score;
  answers: Answers;
  onChange: (a: Answers) => void;
  onBack?: () => void;
  desktop?: boolean;
}) {
  const missing = missingFields(score, answers);
  const result = useMemo<ScoreResult | null>(() => (missing.length ? null : score.evaluate(answers)), [score, answers, missing.length]);
  const set = (id: string, v: string | boolean) => onChange({ ...answers, [id]: v });
  const answeredCount = Object.values(answers).filter((v) => v !== undefined && v !== false).length;

  const questions = (
    <section className={desktop ? 'pt-6' : 'px-4 pt-4 pb-40'}>
      {onBack && (
        <button type="button" onClick={onBack} className="-ml-1 mb-3 flex h-10 items-center gap-1 rounded-lg pr-2 text-sm font-medium text-accent">
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m12 5-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Todos os escores
        </button>
      )}
      <p className="text-sm font-medium text-titanium">{score.category}</p>
      <h1 className="mt-1 font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-balance lg:text-[44px]">{score.name}</h1>
      <p className="mt-2 max-w-[62ch] text-[16px] leading-relaxed text-muted">{score.purpose}</p>

      <div className="mt-6 space-y-2.5">
        {score.fields.map((f) =>
          isVisible(f, answers) ? (
            <div key={f.id} className="settle">
              {f.section && <h2 className="mt-6 mb-2 font-display text-lg font-semibold first:mt-0">{f.section}</h2>}
              {f.kind === 'boolean' ? (
                <BooleanRow field={f} value={answers[f.id] === true} onChange={(v) => set(f.id, v)} />
              ) : (
                <ChoiceGroup field={f} value={answers[f.id] as string | undefined} onChange={(v) => set(f.id, v)} />
              )}
            </div>
          ) : null,
        )}
      </div>

      {answeredCount > 0 && (
        <button type="button" onClick={() => onChange({})} className="mt-6 h-10 rounded-lg px-1 text-sm font-medium text-muted underline underline-offset-4 hover:text-ink">
          Limpar respostas
        </button>
      )}

      <About score={score} />
    </section>
  );

  if (desktop) {
    return (
      <>
        {questions}
        <aside className="sticky top-[72px] self-start pt-6">
          <ResultPanel score={score} result={result} missing={missing.length} />
        </aside>
      </>
    );
  }

  return (
    <>
      {questions}
      <MobileResultBar score={score} result={result} missing={missing.length} />
    </>
  );
}

function BooleanRow({ field, value, onChange }: { field: BooleanField; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      className={`flex min-h-[56px] cursor-pointer items-start gap-3.5 rounded-xl border px-4 py-3 transition-colors ${
        value ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-titanium'
      }`}
    >
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 ${
          value ? 'border-accent bg-accent text-on-accent' : 'border-titanium/60'
        }`}
      >
        {value && (
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.6">
            <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-[16px] leading-snug font-medium">{field.label}</span>
        {field.hint && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{field.hint}</span>}
      </span>
    </label>
  );
}

function ChoiceGroup({ field, value, onChange }: { field: ChoiceField; value: string | undefined; onChange: (v: string) => void }) {
  const showPoints = field.options.some((o) => o.points !== undefined);
  const compact = field.options.length <= 3 && field.options.every((o) => !o.hint && o.label.length < 18);
  return (
    <fieldset className="rounded-xl border border-line bg-surface p-3">
      <legend className="sr-only">{field.label}</legend>
      <p className="px-1 pb-2 text-[16px] leading-snug font-medium" aria-hidden>
        {field.label}
      </p>
      {field.hint && <p className="-mt-1 px-1 pb-2 text-[13px] text-muted">{field.hint}</p>}
      <div className={compact ? 'grid grid-cols-2 gap-2 sm:grid-cols-3' : 'space-y-1.5'}>
        {field.options.map((o) => {
          const active = value === o.value;
          return (
            <label
              key={o.value}
              className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                active ? 'border-accent bg-accent text-on-accent' : 'border-transparent bg-paper hover:border-line'
              }`}
            >
              <input type="radio" name={field.id} checked={active} onChange={() => onChange(o.value)} className="sr-only" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-snug font-medium">{o.label}</span>
                {o.hint && <span className={`mt-0.5 block text-[13px] leading-snug ${active ? 'text-on-accent/80' : 'text-muted'}`}>{o.hint}</span>}
              </span>
              {showPoints && (
                <span className={`font-display text-lg font-semibold tabular-nums ${active ? '' : 'text-titanium'}`}>
                  {o.points}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function About({ score }: { score: Score }) {
  return (
    <div className="mt-10 border-t border-line pt-6">
      <h2 className="font-display text-xl font-semibold">Sobre este escore</h2>
      <dl className="mt-3 grid gap-5 text-[15px] leading-relaxed sm:grid-cols-2">
        <div>
          <dt className="font-semibold">Quando usar</dt>
          <dd className="mt-1 text-muted">
            <ul className="list-disc space-y-1 pl-5">{score.applicability.map((x) => <li key={x}>{x}</li>)}</ul>
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Limitações</dt>
          <dd className="mt-1 text-muted">
            <ul className="list-disc space-y-1 pl-5">{score.limitations.map((x) => <li key={x}>{x}</li>)}</ul>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold">Referências</dt>
          <dd className="mt-1 text-[14px] text-muted">
            <ol className="list-decimal space-y-1 pl-5">{score.references.map((x) => <li key={x}>{x}</li>)}</ol>
          </dd>
        </div>
      </dl>
    </div>
  );
}

// ─── Resultado ───────────────────────────────────────────────────────────────

const LEVEL: Record<ResultLevel, { text: string; bg: string; bar: string; label: string }> = {
  negative: { text: 'text-ok', bg: 'bg-ok-bg', bar: 'bg-ok', label: 'Baixo risco / dispensa exame' },
  caution: { text: 'text-warn', bg: 'bg-warn-bg', bar: 'bg-warn', label: 'Atenção' },
  positive: { text: 'text-bad', bg: 'bg-bad-bg', bar: 'bg-bad', label: 'Alto risco / exame indicado' },
  info: { text: 'text-accent', bg: 'bg-accent-soft', bar: 'bg-accent', label: 'Classificação' },
  'not-applicable': { text: 'text-na', bg: 'bg-na-bg', bar: 'bg-na', label: 'Não se aplica' },
};

function ResultPanel({ score, result, missing }: { score: Score; result: ScoreResult | null; missing: number }) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-titanium/50 p-6">
        <p className="font-display text-2xl font-semibold">Resultado</p>
        <p className="mt-1 text-[15px] text-muted">
          {missing === 1 ? 'Falta 1 pergunta.' : `Faltam ${missing} perguntas.`} O resultado aparece aqui assim que tudo estiver respondido.
        </p>
      </div>
    );
  }
  const lv = LEVEL[result.level];
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_var(--color-line),0_18px_40px_-28px_rgba(0,0,0,.5)]">
      <div className={`${lv.bg} px-6 pt-5 pb-5`}>
        <p className={`text-sm font-semibold ${lv.text}`}>{lv.label}</p>
        <p key={result.headline} className={`settle mt-1 font-display text-[48px] font-bold leading-[0.98] tracking-tight text-balance ${lv.text}`}>
          {result.headline}
        </p>
        <p className="mt-2 text-[15px] leading-snug">{result.interpretation}</p>
        {score.scale && result.points !== undefined && <Gauge scale={score.scale} value={result.points} barClass={lv.bar} />}
      </div>
      <ResultBody score={score} result={result} />
    </div>
  );
}

function Gauge({ scale, value, barClass }: { scale: NonNullable<Score['scale']>; value: number; barClass: string }) {
  const pct = (v: number) => ((v - scale.min) / (scale.max - scale.min)) * 100;
  const ticks = Array.from({ length: scale.max - scale.min + 1 }, (_, i) => scale.min + i);
  return (
    <div className="mt-5" role="img" aria-label={`Pontuação ${value} numa escala de ${scale.min} a ${scale.max}`}>
      <div className="relative h-2.5 rounded-full bg-ink/10">
        <div className={`absolute inset-y-0 left-0 rounded-full ${barClass} transition-[width] duration-300`} style={{ width: `${Math.max(3, pct(value))}%` }} />
        {scale.marks.map((m) => (
          <span key={m.at} className="absolute -top-1.5 -bottom-1.5 w-[2px] bg-ink/70" style={{ left: `calc(${pct(m.at)}% - 1px)` }} />
        ))}
      </div>
      <div className="relative mt-1.5 h-4 text-[11px] text-muted tabular-nums">
        {ticks.map((t) => (
          <span key={t} className={`absolute -translate-x-1/2 ${t === value ? 'font-bold text-ink' : ''}`} style={{ left: `${pct(t)}%` }}>
            {scale.max - scale.min > 10 && t !== scale.min && t !== scale.max && t !== value && !scale.marks.some((m) => m.at === t) ? '' : t}
          </span>
        ))}
      </div>
      <p className="mt-1 text-[12px] text-muted">
        Marcas: {scale.marks.map((m) => `${m.at} (${m.label.toLowerCase()})`).join('; ')}
      </p>
    </div>
  );
}

function ResultBody({ score, result }: { score: Score; result: ScoreResult }) {
  return (
    <div className="space-y-5 px-6 py-5">
      {result.breakdown.length > 0 && (
        <div>
          <h3 className="font-display text-[17px] font-semibold">Como chegamos aqui</h3>
          <ul className="mt-1.5 space-y-1 text-[14px] leading-snug text-muted">
            {result.breakdown.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-titanium" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.recommendation && result.recommendation.length > 0 && (
        <div>
          <h3 className="font-display text-[17px] font-semibold">Conduta sugerida pela literatura</h3>
          <ul className="mt-1.5 space-y-1.5 text-[14px] leading-snug">
            {result.recommendation.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
      <CopyNote text={chartNote(score, result)} />
    </div>
  );
}

function MobileResultBar({ score, result, missing }: { score: Score; result: ScoreResult | null; missing: number }) {
  const [open, setOpen] = useState(false);
  const lv = result ? LEVEL[result.level] : null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {open && result && (
        <div className="max-h-[70dvh] overflow-y-auto border-t border-line bg-surface shadow-[0_-18px_40px_-20px_rgba(0,0,0,.45)]">
          {score.scale && result.points !== undefined && lv && (
            <div className={`${lv.bg} px-6 pb-4`}>
              <Gauge scale={score.scale} value={result.points} barClass={lv.bar} />
            </div>
          )}
          <ResultBody score={score} result={result} />
        </div>
      )}
      <button
        type="button"
        disabled={!result}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex min-h-[76px] w-full items-center gap-3 border-t border-line px-5 py-3 text-left ${lv ? lv.bg : 'bg-surface'}`}
      >
        {result && lv ? (
          <>
            <span className="min-w-0 flex-1">
              <span key={result.headline} className={`settle block font-display text-[28px] font-bold leading-none ${lv.text}`}>{result.headline}</span>
              <span className="mt-1 block truncate text-[13px]">{result.interpretation}</span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-accent">{open ? 'Fechar' : 'Detalhes'}</span>
          </>
        ) : (
          <span className="text-[15px] text-muted">
            {missing === 1 ? 'Falta 1 pergunta para o resultado.' : `Faltam ${missing} perguntas para o resultado.`}
          </span>
        )}
      </button>
    </div>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function CopyNote({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  async function onCopy() {
    setState((await copyText(text)) ? 'copied' : 'failed');
    setTimeout(() => setState('idle'), 2000);
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-[15px] font-semibold text-on-accent active:scale-[.99]"
    >
      <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="6.5" y="6.5" width="10" height="10" rx="2" />
        <path d="M13.5 6.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v7A1.5 1.5 0 0 0 5 13.5h1.5" />
      </svg>
      {state === 'copied' ? 'Copiado para a evolução' : state === 'failed' ? 'Não foi possível copiar' : 'Copiar para a evolução'}
    </button>
  );
}

// ─── Ícones ──────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-accent" />
      <g className="fill-on-accent" transform="rotate(-45 16 16)">
        <rect x="9.5" y="14" width="13" height="4" rx="1" />
        <circle cx="9" cy="13.6" r="2.6" />
        <circle cx="9" cy="18.4" r="2.6" />
        <circle cx="23" cy="13.6" r="2.6" />
        <circle cx="23" cy="18.4" r="2.6" />
      </g>
    </svg>
  );
}

function ThemeIcon({ choice }: { choice: ThemeChoice }) {
  const common = { viewBox: '0 0 20 20', className: 'size-4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true } as const;
  if (choice === 'light')
    return (
      <svg {...common}>
        <circle cx="10" cy="10" r="3.5" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" strokeLinecap="round" />
      </svg>
    );
  if (choice === 'dark')
    return (
      <svg {...common}>
        <path d="M16 12.5A6.5 6.5 0 0 1 7.5 4a6.5 6.5 0 1 0 8.5 8.5Z" strokeLinejoin="round" />
      </svg>
    );
  if (choice === 'contrast')
    return (
      <svg {...common}>
        <circle cx="10" cy="10" r="7" />
        <path d="M10 3a7 7 0 0 1 0 14Z" fill="currentColor" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="2.5" y="4" width="15" height="10" rx="1.5" />
      <path d="M7 17h6" strokeLinecap="round" />
    </svg>
  );
}
