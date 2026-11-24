import { useEffect, useState } from 'react';

const DESKTOP = '(min-width: 1024px)';

/** true em telas ≥ 1024 px. Renderizamos um único layout por vez (evita formulários duplicados). */
export function useIsDesktop() {
  const [match, setMatch] = useState(() => window.matchMedia?.(DESKTOP).matches ?? true);
  useEffect(() => {
    const mq = window.matchMedia?.(DESKTOP);
    if (!mq) return;
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return match;
}

const readHash = () => decodeURIComponent(location.hash.replace(/^#/, ''));

/** Rota pelo #hash: cada escore tem endereço próprio e o botão voltar funciona. */
export function useHashRoute(isValid: (id: string) => boolean) {
  const current = () => (isValid(readHash()) ? readHash() : '');
  const [route, setRoute] = useState(current);

  useEffect(() => {
    const sync = () => setRoute(current());
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (id: string) => {
    if (id === route) return;
    history.pushState(null, '', id ? `#${id}` : location.pathname + location.search);
    setRoute(id);
    window.scrollTo({ top: 0 });
  };

  return [route, navigate] as const;
}
