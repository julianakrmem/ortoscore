import type { ThemeChoice } from '../theme';

const stroke = { fill: 'none', stroke: 'currentColor', 'aria-hidden': true } as const;

export function Logo() {
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

export function ThemeIcon({ choice }: { choice: ThemeChoice }) {
  const p = { ...stroke, viewBox: '0 0 20 20', className: 'size-4', strokeWidth: 1.7 };
  if (choice === 'light')
    return (
      <svg {...p}>
        <circle cx="10" cy="10" r="3.5" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" strokeLinecap="round" />
      </svg>
    );
  if (choice === 'dark')
    return (
      <svg {...p}>
        <path d="M16 12.5A6.5 6.5 0 0 1 7.5 4a6.5 6.5 0 1 0 8.5 8.5Z" strokeLinejoin="round" />
      </svg>
    );
  if (choice === 'contrast')
    return (
      <svg {...p}>
        <circle cx="10" cy="10" r="7" />
        <path d="M10 3a7 7 0 0 1 0 14Z" fill="currentColor" />
      </svg>
    );
  return (
    <svg {...p}>
      <rect x="2.5" y="4" width="15" height="10" rx="1.5" />
      <path d="M7 17h6" strokeLinecap="round" />
    </svg>
  );
}

export const SearchIcon = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 20 20" className={className} strokeWidth="1.8" {...stroke}>
    <circle cx="9" cy="9" r="5.5" />
    <path d="m13.5 13.5 3 3" strokeLinecap="round" />
  </svg>
);

export const ChevronRight = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 20 20" className={className} strokeWidth="2" {...stroke}>
    <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronLeft = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 20 20" className={className} strokeWidth="2" {...stroke}>
    <path d="m12 5-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckIcon = ({ className = 'size-3.5' }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} strokeWidth="2.6" {...stroke}>
    <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CopyIcon = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 20 20" className={className} strokeWidth="1.8" {...stroke}>
    <rect x="6.5" y="6.5" width="10" height="10" rx="2" />
    <path d="M13.5 6.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v7A1.5 1.5 0 0 0 5 13.5h1.5" />
  </svg>
);

export const CaseIcon = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 20 20" className={className} strokeWidth="1.7" {...stroke}>
    <rect x="4" y="3" width="12" height="15" rx="2" />
    <path d="M7.5 3V2h5v1M7 8h6M7 11h6M7 14h3.5" strokeLinecap="round" />
  </svg>
);
