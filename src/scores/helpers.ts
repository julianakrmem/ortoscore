import type { Answers, ChoiceField, Field, Score } from './types';

/** Pontos da opção escolhida num campo de múltipla escolha. */
export function pointsOf(field: ChoiceField, a: Answers): number {
  const opt = field.options.find((o) => o.value === a[field.id]);
  if (!opt) throw new Error(`Campo sem resposta: ${field.id}`);
  return opt.points ?? 0;
}

export function labelOf(field: ChoiceField, a: Answers): string {
  return field.options.find((o) => o.value === a[field.id])?.label ?? '—';
}

export const isVisible = (f: Field, a: Answers) => (f.showIf ? f.showIf(a) : true);

/** Perguntas de múltipla escolha visíveis ainda sem resposta. Booleanos contam como "não" quando vazios. */
export function missingFields(score: Score, a: Answers): Field[] {
  return score.fields.filter((f) => f.kind === 'choice' && isVisible(f, a) && a[f.id] === undefined);
}

export const yes = (a: Answers, id: string) => a[id] === true;

/** Rótulos dos campos booleanos marcados, na ordem do formulário. */
export function checkedLabels(fields: Field[], a: Answers, ids?: string[]): string[] {
  return fields
    .filter((f) => f.kind === 'boolean' && (!ids || ids.includes(f.id)) && a[f.id] === true)
    .map((f) => f.label);
}
