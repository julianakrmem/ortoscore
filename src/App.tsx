import { useState } from 'react';
import { Header } from './components/Header';
import { ScoreIndex } from './components/ScoreIndex';
import { ScoreScreen } from './components/ScoreScreen';
import { useHashRoute, useIsDesktop } from './lib/hooks';
import { getScore, SCORES, type Answers } from './scores';
import { useTheme } from './theme';

export default function App() {
  const { choice: theme, cycle: cycleTheme } = useTheme();
  const isDesktop = useIsDesktop();
  const [route, navigate] = useHashRoute((id) => !!getScore(id));
  // Respostas ficam só na memória da aba, por escore: nada é salvo no navegador.
  const [answers, setAnswers] = useState<Record<string, Answers>>({});

  const score = getScore(route);
  const update = (id: string) => (a: Answers) => setAnswers((s) => ({ ...s, [id]: a }));

  return (
    <div className="min-h-dvh bg-paper font-sans text-ink">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent">
        Pular para o conteúdo
      </a>
      <Header theme={theme} onTheme={cycleTheme} onHome={() => navigate('')} />

      {isDesktop ? (
        <div id="conteudo" className="mx-auto grid max-w-[1320px] grid-cols-[240px_minmax(0,1fr)_380px] gap-8 px-6 pb-16 xl:grid-cols-[260px_minmax(0,1fr)_400px] xl:gap-10">
          <aside className="sticky top-[72px] max-h-[calc(100dvh-72px)] self-start overflow-y-auto pt-6 pb-6">
            <ScoreIndex selectedId={(score ?? SCORES[0]).id} onSelect={navigate} compact />
          </aside>
          {(() => {
            const s = score ?? SCORES[0];
            return <ScoreScreen key={s.id} score={s} answers={answers[s.id] ?? {}} onChange={update(s.id)} desktop />;
          })()}
        </div>
      ) : score ? (
        <main id="conteudo">
          <ScoreScreen key={score.id} score={score} answers={answers[score.id] ?? {}} onChange={update(score.id)} onBack={() => navigate('')} />
        </main>
      ) : (
        <main id="conteudo" className="px-4 pb-16">
          <section className="pt-7 pb-6">
            <h1 className="font-display text-[40px] font-semibold leading-[1.02] tracking-tight text-balance">
              Escores de ortopedia e trauma, respondidos como no exame.
            </h1>
            <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-muted">
              Perguntas guiadas, o cálculo explicado passo a passo e a referência de cada regra. Para estudo e apoio no pronto-socorro.
            </p>
          </section>
          <ScoreIndex selectedId="" onSelect={navigate} />
        </main>
      )}

      {!(score && !isDesktop) && (
        <footer className="mx-auto max-w-[1320px] px-4 pb-10 text-[13px] leading-relaxed text-muted lg:px-6">
          Ferramenta educacional. Os escores apoiam, mas não substituem, o exame clínico e o julgamento da equipe. Confira sempre a referência
          original e o protocolo da sua instituição. Código aberto em{' '}
          <a className="underline underline-offset-2" href="https://github.com/julianakrmem/ortoscore">
            github.com/julianakrmem/ortoscore
          </a>
          .
        </footer>
      )}
    </div>
  );
}
