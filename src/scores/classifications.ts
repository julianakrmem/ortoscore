import { labelOf, pointsOf } from './helpers';
import type { ChoiceField, Score } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Salter-Harris — fraturas da fise
// ─────────────────────────────────────────────────────────────────────────────
export const salterHarris: Score = {
  id: 'salter-harris',
  name: 'Classificação de Salter-Harris',
  shortName: 'Salter-Harris',
  category: 'Classificações',
  purpose: 'Classifica fraturas que envolvem a placa de crescimento (fise) e estima o risco de distúrbio de crescimento.',
  applicability: ['Crianças e adolescentes com fise aberta.'],
  limitations: ['O tipo V costuma ser diagnosticado apenas retrospectivamente, quando surge o distúrbio de crescimento.'],
  references: [
    'Salter RB, Harris WR. Injuries involving the epiphyseal plate. J Bone Joint Surg Am. 1963;45(3):587-622.',
  ],
  cite: 'Salter e Harris, 1963',
  example: {
    caption: 'Menino de 11 anos, queda sobre a mão. Traço que percorre a fise do rádio distal e sai pela metáfise.',
    answers: { crush: 'no', metaphysis: 'yes', epiphysis: 'no' },
    expected: 'Tipo II',
  },
  fields: [
    {
      id: 'crush',
      kind: 'choice',
      label: 'Há compressão (esmagamento) da fise, sem traço de fratura definido?',
      options: [
        { value: 'no', label: 'Não' },
        { value: 'yes', label: 'Sim' },
      ],
    },
    {
      id: 'metaphysis',
      kind: 'choice',
      label: 'O traço sai da fise e atravessa a metáfise?',
      showIf: (a) => a.crush === 'no',
      options: [
        { value: 'no', label: 'Não' },
        { value: 'yes', label: 'Sim' },
      ],
    },
    {
      id: 'epiphysis',
      kind: 'choice',
      label: 'O traço atravessa a epífise (até a superfície articular)?',
      showIf: (a) => a.crush === 'no',
      options: [
        { value: 'no', label: 'Não' },
        { value: 'yes', label: 'Sim' },
      ],
    },
  ],
  evaluate(a) {
    const types = {
      I: { line: 'Traço apenas pela fise (S — straight across).', rx: ['Bom prognóstico; geralmente redução fechada e imobilização.'] },
      II: { line: 'Fise + metáfise, fragmento de Thurston-Holland (A — above). É o tipo mais comum.', rx: ['Bom prognóstico; geralmente redução fechada e imobilização.'] },
      III: { line: 'Fise + epífise: intra-articular (L — lower).', rx: ['Exige redução anatômica da superfície articular, frequentemente cirúrgica.', 'Risco de distúrbio de crescimento.'] },
      IV: { line: 'Metáfise, fise e epífise: intra-articular (T — through).', rx: ['Redução anatômica, geralmente aberta com fixação.', 'Alto risco de barra fisária.'] },
      V: { line: 'Compressão da fise (R — rammed).', rx: ['Pior prognóstico; seguimento do crescimento para detectar barra fisária.'] },
    } as const;

    let t: keyof typeof types;
    if (a.crush === 'yes') t = 'V';
    else if (a.metaphysis === 'yes' && a.epiphysis === 'yes') t = 'IV';
    else if (a.epiphysis === 'yes') t = 'III';
    else if (a.metaphysis === 'yes') t = 'II';
    else t = 'I';

    return {
      level: t === 'I' || t === 'II' ? 'info' : 'caution',
      headline: `Tipo ${t}`,
      interpretation: types[t].line,
      breakdown: ['Mnemônico SALTR: I Straight · II Above · III Lower · IV Through · V Rammed.'],
      recommendation: [...types[t].rx],
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Garden — fratura do colo do fêmur
// ─────────────────────────────────────────────────────────────────────────────
export const garden: Score = {
  id: 'garden',
  name: 'Classificação de Garden',
  shortName: 'Garden',
  category: 'Classificações',
  purpose: 'Classifica a fratura do colo do fêmur pelo desvio e orienta fixação × artroplastia.',
  applicability: ['Fraturas intracapsulares do colo do fêmur.'],
  limitations: [
    'Concordância interobservador baixa entre os quatro tipos; na prática, muitos serviços usam só "sem desvio (I–II)" × "com desvio (III–IV)".',
  ],
  references: [
    'Garden RS. Low-angle fixation in fractures of the femoral neck. J Bone Joint Surg Br. 1961;43(4):647-63.',
  ],
  cite: 'Garden, 1961',
  example: {
    caption: 'Mulher de 82 anos, queda da própria altura. Fratura completa do colo do fêmur com a cabeça totalmente desviada.',
    answers: { complete: 'yes', displacement: 'full' },
    expected: 'Garden IV',
  },
  fields: [
    {
      id: 'complete',
      kind: 'choice',
      label: 'A fratura é completa?',
      options: [
        { value: 'no', label: 'Não — incompleta ou impactada em valgo' },
        { value: 'yes', label: 'Sim' },
      ],
    },
    {
      id: 'displacement',
      kind: 'choice',
      label: 'Desvio na radiografia',
      showIf: (a) => a.complete === 'yes',
      options: [
        { value: 'none', label: 'Sem desvio' },
        { value: 'partial', label: 'Desvio parcial', hint: 'Trabéculas da cabeça desalinhadas com as do acetábulo.' },
        { value: 'full', label: 'Desvio completo', hint: 'Trabéculas da cabeça paralelas às do acetábulo (cabeça "solta").' },
      ],
    },
  ],
  evaluate(a) {
    const type = a.complete === 'no' ? 'I' : a.displacement === 'none' ? 'II' : a.displacement === 'partial' ? 'III' : 'IV';
    const displaced = type === 'III' || type === 'IV';
    const lines: Record<string, string> = {
      I: 'Incompleta ou impactada em valgo.',
      II: 'Completa, sem desvio.',
      III: 'Completa, com desvio parcial.',
      IV: 'Completa, com desvio total.',
    };
    return {
      level: displaced ? 'caution' : 'info',
      headline: `Garden ${type}`,
      interpretation: `${lines[type]} ${displaced ? 'Grupo com desvio.' : 'Grupo sem desvio.'}`,
      breakdown: [displaced ? 'Tipos III–IV: risco elevado de necrose avascular e pseudartrose.' : 'Tipos I–II: suprimento sanguíneo da cabeça geralmente preservado.'],
      recommendation: displaced
        ? ['Idoso: artroplastia (parcial ou total, conforme demanda funcional).', 'Jovem: redução anatômica urgente e fixação interna.']
        : ['Fixação interna in situ (parafusos canulados ou DHS), na maioria dos casos.'],
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Critérios de Kocher — artrite séptica do quadril na criança
// ─────────────────────────────────────────────────────────────────────────────
const KOCHER_1999 = [0.2, 3.0, 40.0, 93.1, 99.6];
const KOCHER_2004 = [2.0, 9.5, 35.0, 72.8, 93.0];

export const kocher: Score = {
  id: 'kocher',
  name: 'Critérios de Kocher',
  shortName: 'Kocher',
  scale: { min: 0, max: 4, marks: [{ at: 2, label: 'Suspeita intermediária' }, { at: 3, label: 'Alta suspeita' }] },
  category: 'Pediatria e oncologia',
  purpose: 'Diferencia artrite séptica do quadril de sinovite transitória na criança.',
  applicability: ['Criança com quadril doloroso e irritável, sem trauma.'],
  limitations: [
    'O estudo de validação (2004) encontrou probabilidades menores que o original.',
    'PCR > 2 mg/dL é um preditor adicional útil (Caird, 2006).',
  ],
  references: [
    'Kocher MS et al. Differentiating between septic arthritis and transient synovitis of the hip in children. J Bone Joint Surg Am. 1999;81(12):1662-70.',
    'Kocher MS et al. Validation of a clinical prediction rule for the differentiation between septic arthritis and transient synovitis of the hip in children. J Bone Joint Surg Am. 2004;86(8):1629-35.',
  ],
  cite: 'Kocher et al., 1999',
  example: {
    caption: 'Criança de 6 anos com quadril doloroso há 2 dias. Recusa apoiar, 39 °C, VHS 55 mm/h, leucócitos 10.500/mm³.',
    answers: { nwb: true, fever: true, esr: true },
    expected: '3 de 4 critérios',
  },
  fields: [
    { id: 'nwb', kind: 'boolean', label: 'Não apoia o membro (recusa a carga)' },
    { id: 'fever', kind: 'boolean', label: 'Temperatura > 38,5 °C' },
    { id: 'esr', kind: 'boolean', label: 'VHS > 40 mm/h' },
    { id: 'wbc', kind: 'boolean', label: 'Leucócitos > 12.000/mm³' },
  ],
  evaluate(a) {
    const n = ['nwb', 'fever', 'esr', 'wbc'].filter((k) => a[k] === true).length;
    const level = n <= 1 ? 'negative' : n === 2 ? 'caution' : 'positive';
    const fmt = (x: number) => x.toLocaleString('pt-BR');
    return {
      level,
      points: n,
      headline: `${n} de 4 critérios`,
      interpretation: `Probabilidade de artrite séptica: ${fmt(KOCHER_1999[n])}% (estudo original) · ${fmt(KOCHER_2004[n])}% (validação).`,
      breakdown: [
        `Não apoia: ${a.nwb ? 'sim' : 'não'}`,
        `Febre > 38,5 °C: ${a.fever ? 'sim' : 'não'}`,
        `VHS > 40 mm/h: ${a.esr ? 'sim' : 'não'}`,
        `Leucócitos > 12.000: ${a.wbc ? 'sim' : 'não'}`,
      ],
      recommendation:
        n >= 3
          ? ['Alta suspeita: ultrassonografia e artrocentese; discutir drenagem cirúrgica de urgência.']
          : n === 2
            ? ['Suspeita intermediária: ultrassonografia, PCR e considerar artrocentese.']
            : ['Baixa suspeita: provável sinovite transitória; reavaliar se piorar.'],
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Escore de Mirels — risco de fratura patológica
// ─────────────────────────────────────────────────────────────────────────────
const mSite: ChoiceField = {
  id: 'site',
  kind: 'choice',
  label: 'Localização',
  options: [
    { value: 'upper', points: 1, label: 'Membro superior' },
    { value: 'lower', points: 2, label: 'Membro inferior' },
    { value: 'peritrochanteric', points: 3, label: 'Peritrocantérica' },
  ],
};
const mPain: ChoiceField = {
  id: 'pain',
  kind: 'choice',
  label: 'Dor',
  options: [
    { value: 'mild', points: 1, label: 'Leve' },
    { value: 'moderate', points: 2, label: 'Moderada' },
    { value: 'functional', points: 3, label: 'Funcional', hint: 'Piora com a carga / atividade.' },
  ],
};
const mLesion: ChoiceField = {
  id: 'lesion',
  kind: 'choice',
  label: 'Tipo de lesão',
  options: [
    { value: 'blastic', points: 1, label: 'Blástica' },
    { value: 'mixed', points: 2, label: 'Mista' },
    { value: 'lytic', points: 3, label: 'Lítica' },
  ],
};
const mSize: ChoiceField = {
  id: 'size',
  kind: 'choice',
  label: 'Tamanho (fração do diâmetro cortical)',
  options: [
    { value: 'lt13', points: 1, label: '< 1/3' },
    { value: '13to23', points: 2, label: '1/3 a 2/3' },
    { value: 'gt23', points: 3, label: '> 2/3' },
  ],
};

export const mirels: Score = {
  id: 'mirels',
  name: 'Escore de Mirels',
  shortName: 'Mirels',
  scale: { min: 4, max: 12, marks: [{ at: 8, label: 'Limítrofe' }, { at: 9, label: 'Fixação profilática' }] },
  category: 'Pediatria e oncologia',
  purpose: 'Estima o risco de fratura patológica em lesões metastáticas de ossos longos e orienta a fixação profilática.',
  applicability: ['Metástases em ossos longos.'],
  limitations: ['Sensível, mas pouco específico: tende a indicar fixação em excesso.', 'Não se aplica à coluna nem a tumores ósseos primários.'],
  references: [
    'Mirels H. Metastatic disease in long bones: a proposed scoring system for diagnosing impending pathologic fractures. Clin Orthop Relat Res. 1989;(249):256-64.',
  ],
  cite: 'Mirels, 1989',
  example: {
    caption: 'Metástase lítica de câncer de mama na região peritrocantérica, ocupando metade da cortical, com dor ao apoiar.',
    answers: { site: 'peritrochanteric', pain: 'functional', lesion: 'lytic', size: '13to23' },
    expected: 'Mirels 11',
  },
  fields: [mSite, mPain, mLesion, mSize],
  evaluate(a) {
    const parts = [mSite, mPain, mLesion, mSize].map((f) => ({ f, p: pointsOf(f, a) }));
    const total = parts.reduce((s, x) => s + x.p, 0);
    const level = total >= 9 ? 'positive' : total === 8 ? 'caution' : 'negative';
    return {
      level,
      points: total,
      headline: `Mirels ${total}`,
      interpretation:
        total >= 9
          ? 'Alto risco de fratura (≥ 33% no estudo original).'
          : total === 8
            ? 'Risco limítrofe (~15%).'
            : 'Baixo risco (≤ 4%).',
      breakdown: parts.map(({ f, p }) => `${f.label}: ${p} (${labelOf(f, a)})`),
      recommendation:
        total >= 9
          ? ['Fixação profilática antes da radioterapia.']
          : total === 8
            ? ['Julgamento clínico: considerar fixação profilática.']
            : ['Observação e radioterapia.'],
    };
  },
};
