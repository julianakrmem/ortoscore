/**
 * Contrato comum a todos os escores. Cada escore é um módulo puro: descreve
 * as perguntas (dados) e calcula o resultado (função), sem saber nada da tela.
 * A interface monta o formulário a partir de `fields` automaticamente.
 */

export type Answers = Record<string, string | boolean | undefined>;

interface BaseField {
  id: string;
  label: string;
  hint?: string;
  /** Mostra a pergunta só quando a condição é verdadeira (árvores de decisão). */
  showIf?: (a: Answers) => boolean;
  /** Título de seção exibido antes desta pergunta. */
  section?: string;
}

export interface BooleanField extends BaseField {
  kind: 'boolean';
}

export interface ChoiceOption {
  value: string;
  label: string;
  hint?: string;
  points?: number;
}

export interface ChoiceField extends BaseField {
  kind: 'choice';
  options: ChoiceOption[];
}

export type Field = BooleanField | ChoiceField;

export type ResultLevel =
  | 'negative' // dispensa exame / baixo risco
  | 'caution' // risco intermediário / julgamento clínico
  | 'positive' // exame indicado / alto risco
  | 'info' // classificação, sem juízo de risco
  | 'not-applicable'; // paciente fora dos critérios de aplicação

export interface ScoreResult {
  level: ResultLevel;
  /** Resultado principal, curto (ex.: "MESS 8", "Tipo IIIB"). */
  headline: string;
  /** Interpretação em uma frase. */
  interpretation: string;
  /** Linhas explicando como o resultado foi obtido. */
  breakdown: string[];
  /** Conduta sugerida pela literatura (educacional). */
  recommendation?: string[];
  /** Valor numérico, quando o escore é somatório. */
  points?: number;
}

export type Category = 'Decisão no PS' | 'Trauma grave' | 'Classificações' | 'Pediatria e oncologia';

export interface Score {
  id: string;
  name: string;
  shortName: string;
  category: Category;
  /** Para que serve, em uma linha. */
  purpose: string;
  /** Em quem a regra foi validada / quando não usar. */
  applicability: string[];
  limitations: string[];
  references: string[];
  /** Régua de pontuação exibida na interface (escores somatórios). */
  scale?: { min: number; max: number; marks: { at: number; label: string }[] };
  fields: Field[];
  evaluate: (a: Answers) => ScoreResult;
}
