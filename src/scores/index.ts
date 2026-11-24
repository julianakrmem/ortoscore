import { garden, kocher, mirels, salterHarris } from './classifications';
import { canadianCSpine, nexus, ottawaAnkle, ottawaKnee } from './ps-rules';
import { gustilo, mess } from './trauma';
import type { Category, Score, ScoreResult } from './types';

export * from './types';
export { isPending, isVisible, missingFields } from './helpers';

export const SCORES: Score[] = [
  ottawaAnkle,
  ottawaKnee,
  canadianCSpine,
  nexus,
  mess,
  gustilo,
  salterHarris,
  garden,
  kocher,
  mirels,
];

export const CATEGORIES: Category[] = ['Decisão no PS', 'Trauma grave', 'Classificações', 'Pediatria e oncologia'];

export const getScore = (id: string) => SCORES.find((s) => s.id === id);

/** Texto curto para colar na evolução do prontuário. */
export function chartNote(score: Score, r: ScoreResult): string {
  const lines = [`${score.name}: ${r.headline}.`, r.interpretation];
  if (r.breakdown.length) lines.push(r.breakdown.map((b) => `• ${b}`).join('\n'));
  lines.push(`Ref.: ${score.cite}.`);
  return lines.join('\n');
}
