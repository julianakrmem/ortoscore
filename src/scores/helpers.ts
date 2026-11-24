import { NONE_KEY, type Answers, type ChoiceField, type Field, type Score } from './types';

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

/**
 * Checklists (só caixas de seleção) começam "pendentes": sem nenhuma marcação,
 * o resultado só aparece quando o usuário confirma que nenhum item está presente.
 * Evita mostrar "regra negativa" antes de o exame ter sido feito.
 */
export function isPending(score: Score, a: Answers): boolean {
  const booleans = score.fields.filter((f) => f.kind === 'boolean' && isVisible(f, a));
  if (!booleans.length) return false;
  const anyChoice = score.fields.some((f) => f.kind === 'choice' && isVisible(f, a) && a[f.id] !== undefined);
  const anyChecked = booleans.some((f) => a[f.id] === true);
  return !anyChoice && !anyChecked && a[NONE_KEY] !== true;
}
