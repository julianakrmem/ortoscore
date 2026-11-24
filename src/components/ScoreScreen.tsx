import { useEffect, useMemo } from 'react';
import { isPending, isVisible, missingFields, NONE_KEY, type Answers, type Score } from '../scores';
import { BooleanRow, ChoiceGroup } from './Fields';
import { CaseIcon, ChevronLeft } from './Icons';
import { MobileResultBar, ResultPanel, type ResultState } from './Result';

interface Props {
  score: Score;
  answers: Answers;
  onChange: (a: Answers) => void;
  onBack?: () => void;
  desktop?: boolean;
}

export function ScoreScreen({ score, answers, onChange, onBack, desktop }: Props) {
  useEffect(() => {
    document.title = `${score.shortName} · OrtoScore`;
    return () => {
      document.title = 'OrtoScore — Escores ortopédicos e de trauma';
    };
  }, [score]);

  const state = useMemo<ResultState>(() => {
    const missing = missingFields(score, answers);
    if (missing.length) return { kind: 'missing', count: missing.length };
    if (isPending(score, answers)) return { kind: 'pending' };
    return { kind: 'ready', result: score.evaluate(answers) };
  }, [score, answers]);

  // Editar qualquer resposta tira o rótulo de "caso de exemplo".
  const set = (id: string, v: string | boolean) => onChange({ ...answers, [id]: v, __example: undefined });
  const confirmNone = () => onChange({ ...answers, [NONE_KEY]: true });
  const hasAnswers = Object.values(answers).some((v) => v !== undefined && v !== false);
  const exampleLoaded = answers.__example === true;

  const questions = (
    <section className={desktop ? 'min-w-0 pt-6' : 'px-4 pt-4 pb-44'}>
      {onBack && (
        <button type="button" onClick={onBack} className="-ml-1 mb-3 flex h-10 items-center gap-1 rounded-lg pr-2 text-sm font-medium text-accent">
          <ChevronLeft />
          Todos os escores
        </button>
      )}
      <p className="text-sm font-medium text-titanium">{score.category}</p>
      <h1 className="mt-1 font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-balance lg:text-[44px]">{score.name}</h1>
      <p className="mt-2 max-w-[62ch] text-[16px] leading-relaxed text-muted">{score.purpose}</p>

      {exampleLoaded ? (
        <div className="mt-5 rounded-xl border border-accent/40 bg-accent-soft px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-accent">
            <CaseIcon /> Caso de exemplo
          </p>
          <p className="mt-1 text-[15px] leading-relaxed">{score.example.caption}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onChange({ ...score.example.answers, __example: true })}
          className="mt-4 flex h-10 items-center gap-2 rounded-lg px-1 text-sm font-medium text-accent hover:underline underline-offset-4"
        >
          <CaseIcon /> Preencher com um caso de exemplo
        </button>
      )}

      <div className="mt-5 space-y-2.5">
        {score.fields.map((f) =>
          isVisible(f, answers) ? (
            <div key={f.id} className="settle">
              {f.section && <h2 className="mt-6 mb-2 font-display text-lg font-semibold">{f.section}</h2>}
              {f.kind === 'boolean' ? (
                <BooleanRow field={f} value={answers[f.id] === true} onChange={(v) => set(f.id, v)} />
              ) : (
                <ChoiceGroup field={f} value={answers[f.id] as string | undefined} onChange={(v) => set(f.id, v)} />
              )}
            </div>
          ) : null,
        )}
      </div>

      {hasAnswers && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="mt-6 h-10 rounded-lg px-1 text-sm font-medium text-muted underline underline-offset-4 hover:text-ink"
        >
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
        <aside className="sticky top-[72px] max-h-[calc(100dvh-72px)] self-start overflow-y-auto pt-6 pb-6" aria-label="Resultado">
          <ResultPanel score={score} state={state} onConfirmNone={confirmNone} />
        </aside>
      </>
    );
  }

  return (
    <>
      {questions}
      <MobileResultBar score={score} state={state} onConfirmNone={confirmNone} />
    </>
  );
}

function About({ score }: { score: Score }) {
  return (
    <section className="mt-10 border-t border-line pt-6">
      <h2 className="font-display text-xl font-semibold">Sobre este escore</h2>
      <dl className="mt-3 grid gap-5 text-[15px] leading-relaxed sm:grid-cols-2">
        <div>
          <dt className="font-semibold">Quando usar</dt>
          <dd className="mt-1 text-muted">
            <ul className="list-disc space-y-1 pl-5">
              {score.applicability.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Limitações</dt>
          <dd className="mt-1 text-muted">
            <ul className="list-disc space-y-1 pl-5">
              {score.limitations.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold">Referências</dt>
          <dd className="mt-1 text-[14px] text-muted">
            <ol className="list-decimal space-y-1 pl-5">
              {score.references.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </dd>
        </div>
      </dl>
      <p className="mt-6 text-[13px] leading-relaxed text-muted">
        Ferramenta educacional: apoia, mas não substitui, o exame clínico e o julgamento da equipe. Confira a referência original e o protocolo
        da sua instituição.
      </p>
    </section>
  );
}
