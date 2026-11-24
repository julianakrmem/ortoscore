import { useEffect, useState } from 'react';
import { chartNote, type ResultLevel, type Score, type ScoreResult } from '../scores';
import { copyText } from '../lib/clipboard';
import { CopyIcon } from './Icons';

export type ResultState =
  | { kind: 'missing'; count: number }
  | { kind: 'pending' }
  | { kind: 'ready'; result: ScoreResult };

const LEVEL: Record<ResultLevel, { text: string; bg: string; bar: string; label: string }> = {
  negative: { text: 'text-ok', bg: 'bg-ok-bg', bar: 'bg-ok', label: 'Baixo risco ou exame dispensável' },
  caution: { text: 'text-warn', bg: 'bg-warn-bg', bar: 'bg-warn', label: 'Atenção' },
  positive: { text: 'text-bad', bg: 'bg-bad-bg', bar: 'bg-bad', label: 'Alto risco ou exame indicado' },
  info: { text: 'text-accent', bg: 'bg-accent-soft', bar: 'bg-accent', label: 'Classificação' },
  'not-applicable': { text: 'text-na', bg: 'bg-na-bg', bar: 'bg-na', label: 'Não se aplica' },
};

const missingText = (n: number) => (n === 1 ? 'Falta 1 pergunta.' : `Faltam ${n} perguntas.`);

// ─── Desktop ─────────────────────────────────────────────────────────────────

export function ResultPanel({ score, state, onConfirmNone }: { score: Score; state: ResultState; onConfirmNone: () => void }) {
  if (state.kind !== 'ready') {
    return (
      <div className="rounded-2xl border border-dashed border-titanium/50 p-6" aria-live="polite">
        <p className="font-display text-2xl font-semibold">Resultado</p>
        {state.kind === 'missing' ? (
          <p className="mt-1 text-[15px] text-muted">{missingText(state.count)} O resultado aparece aqui assim que tudo estiver respondido.</p>
        ) : (
          <PendingPrompt onConfirmNone={onConfirmNone} />
        )}
      </div>
    );
  }
  const { result } = state;
  const lv = LEVEL[result.level];
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_var(--color-line),0_18px_40px_-28px_rgba(0,0,0,.5)]">
      <div className={`${lv.bg} px-6 pt-5 pb-5`} aria-live="polite">
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

function PendingPrompt({ onConfirmNone }: { onConfirmNone: () => void }) {
  return (
    <>
      <p className="mt-1 text-[15px] text-muted">Marque os achados presentes. Se nenhum estiver presente, confirme abaixo.</p>
      <button
        type="button"
        onClick={onConfirmNone}
        className="mt-4 h-11 w-full rounded-xl border border-accent px-4 text-[15px] font-semibold text-accent hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
      >
        Nenhum item está presente
      </button>
    </>
  );
}

export function Gauge({ scale, value, barClass }: { scale: NonNullable<Score['scale']>; value: number; barClass: string }) {
  const span = scale.max - scale.min;
  const pct = (v: number) => ((v - scale.min) / span) * 100;
  const ticks = Array.from({ length: span + 1 }, (_, i) => scale.min + i);
  const showTick = (t: number) => span <= 10 || t === scale.min || t === scale.max || t === value || scale.marks.some((m) => m.at === t);
  return (
    <div className="mt-5">
      <div
        className="relative h-2.5 rounded-full bg-ink/10"
        role="meter"
        aria-valuemin={scale.min}
        aria-valuemax={scale.max}
        aria-valuenow={value}
        aria-label="Pontuação"
      >
        <div className={`absolute inset-y-0 left-0 rounded-full ${barClass} transition-[width] duration-300`} style={{ width: `${Math.max(3, pct(value))}%` }} />
        {scale.marks.map((m) => (
          <span key={m.at} className="absolute -top-1.5 -bottom-1.5 w-[2px] rounded bg-ink/70" style={{ left: `calc(${pct(m.at)}% - 1px)` }} aria-hidden />
        ))}
      </div>
      <div className="relative mt-1.5 h-4 text-[11px] text-muted tabular-nums" aria-hidden>
        {ticks.filter(showTick).map((t) => (
          <span key={t} className={`absolute -translate-x-1/2 ${t === value ? 'font-bold text-ink' : ''}`} style={{ left: `${pct(t)}%` }}>
            {t}
          </span>
        ))}
      </div>
      <ul className="mt-1.5 space-y-0.5 text-[12px] text-muted">
        {scale.marks.map((m) => (
          <li key={m.at}>
            A partir de {m.at}: {m.label.toLowerCase()}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultBody({ score, result }: { score: Score; result: ScoreResult }) {
  return (
    <div className="space-y-5 px-6 py-5">
      {result.breakdown.length > 0 && (
        <section>
          <h3 className="font-display text-[17px] font-semibold">Como chegamos aqui</h3>
          <ul className="mt-1.5 space-y-1 text-[14px] leading-snug text-muted">
            {result.breakdown.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-titanium" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </section>
      )}
      {result.recommendation && result.recommendation.length > 0 && (
        <section>
          <h3 className="font-display text-[17px] font-semibold">Conduta sugerida pela literatura</h3>
          <ul className="mt-1.5 space-y-1.5 text-[14px] leading-snug">
            {result.recommendation.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
        </section>
      )}
      <CopyNote text={chartNote(score, result)} />
    </div>
  );
}

function CopyNote({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => setState('idle'), [text]);
  useEffect(() => {
    if (state === 'idle') return;
    const t = setTimeout(() => setState('idle'), 2200);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <button
      type="button"
      onClick={async () => setState((await copyText(text)) ? 'copied' : 'failed')}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-[15px] font-semibold text-on-accent transition-transform active:scale-[.99] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
    >
      <CopyIcon />
      <span aria-live="polite">
        {state === 'copied' ? 'Copiado para a evolução' : state === 'failed' ? 'Não foi possível copiar' : 'Copiar para a evolução'}
      </span>
    </button>
  );
}

// ─── Celular ─────────────────────────────────────────────────────────────────

export function MobileResultBar({ score, state, onConfirmNone }: { score: Score; state: ResultState; onConfirmNone: () => void }) {
  const [open, setOpen] = useState(false);
  const result = state.kind === 'ready' ? state.result : null;
  const lv = result ? LEVEL[result.level] : null;
  useEffect(() => {
    if (!result) setOpen(false);
  }, [result]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {open && result && lv && (
        <div id="result-details" className="max-h-[65dvh] overflow-y-auto border-t border-line bg-surface shadow-[0_-18px_40px_-20px_rgba(0,0,0,.45)]">
          {score.scale && result.points !== undefined && (
            <div className={`${lv.bg} px-6 pb-4`}>
              <Gauge scale={score.scale} value={result.points} barClass={lv.bar} />
            </div>
          )}
          <ResultBody score={score} result={result} />
        </div>
      )}

      {state.kind === 'pending' ? (
        <div className="flex min-h-[76px] items-center gap-3 border-t border-line bg-surface px-5 py-3">
          <p className="flex-1 text-[14px] leading-snug text-muted">Marque os achados presentes.</p>
          <button
            type="button"
            onClick={onConfirmNone}
            className="h-11 shrink-0 rounded-xl border border-accent px-3.5 text-[14px] font-semibold text-accent"
          >
            Nenhum presente
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!result}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="result-details"
          className={`flex min-h-[76px] w-full items-center gap-3 border-t border-line px-5 py-3 text-left ${lv ? lv.bg : 'bg-surface'}`}
        >
          {result && lv ? (
            <>
              <span className="min-w-0 flex-1" aria-live="polite">
                <span key={result.headline} className={`settle block font-display text-[28px] font-bold leading-none ${lv.text}`}>
                  {result.headline}
                </span>
                <span className="mt-1 block truncate text-[13px]">{result.interpretation}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-accent">{open ? 'Fechar' : 'Detalhes'}</span>
            </>
          ) : (
            <span className="text-[15px] text-muted">{state.kind === 'missing' && `${missingText(state.count)} O resultado aparece aqui.`}</span>
          )}
        </button>
      )}
    </div>
  );
}
