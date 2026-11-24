import { THEME_LABEL, type ThemeChoice } from '../theme';
import { Logo, ThemeIcon } from './Icons';

export function Header({ theme, onTheme, onHome }: { theme: ThemeChoice; onTheme: () => void; onHome: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/92 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-3 px-4 lg:h-[72px] lg:px-6">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onHome();
          }}
          className="flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
          aria-label="OrtoScore, início"
        >
          <Logo />
          <span className="font-display text-2xl font-semibold leading-none tracking-tight">OrtoScore</span>
        </a>
        <span className="ml-1 hidden text-sm text-muted md:inline">Escores ortopédicos e de trauma</span>
        <button
          type="button"
          onClick={onTheme}
          className="ml-auto flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm font-medium hover:border-titanium focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
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
