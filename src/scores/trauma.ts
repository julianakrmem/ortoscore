import { labelOf, pointsOf, yes } from './helpers';
import type { ChoiceField, Field, Score } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// MESS — Mangled Extremity Severity Score
// ─────────────────────────────────────────────────────────────────────────────
const messSkeletal: ChoiceField = {
  id: 'skeletal',
  kind: 'choice',
  section: 'A. Lesão esquelética e de partes moles',
  label: 'Energia do trauma',
  options: [
    { value: 'low', points: 1, label: 'Baixa energia', hint: 'Fratura simples, ferimento por arma branca, PAF civil de baixa velocidade.' },
    { value: 'medium', points: 2, label: 'Média energia', hint: 'Fraturas expostas ou múltiplas, luxação.' },
    { value: 'high', points: 3, label: 'Alta energia', hint: 'Esmagamento, PAF de alta velocidade ou à queima-roupa.' },
    { value: 'veryHigh', points: 4, label: 'Energia muito alta', hint: 'Alta energia + contaminação grosseira ou avulsão de partes moles.' },
  ],
};
const messIschemia: ChoiceField = {
  id: 'ischemia',
  kind: 'choice',
  section: 'B. Isquemia do membro',
  label: 'Perfusão',
  options: [
    { value: 'none', points: 0, label: 'Sem isquemia', hint: 'Pulsos e perfusão normais.' },
    { value: 'reduced', points: 1, label: 'Pulso reduzido ou ausente, perfusão normal' },
    { value: 'pulseless', points: 2, label: 'Sem pulso, parestesias, enchimento capilar lentificado' },
    { value: 'cold', points: 3, label: 'Membro frio, paralisado, insensível' },
  ],
};
const messShock: ChoiceField = {
  id: 'shock',
  kind: 'choice',
  section: 'C. Choque',
  label: 'Pressão arterial sistólica',
  options: [
    { value: 'none', points: 0, label: 'Sempre > 90 mmHg' },
    { value: 'transient', points: 1, label: 'Hipotensão transitória' },
    { value: 'persistent', points: 2, label: 'Hipotensão persistente' },
  ],
};
const messAge: ChoiceField = {
  id: 'age',
  kind: 'choice',
  section: 'D. Idade',
  label: 'Faixa etária',
  options: [
    { value: 'lt30', points: 0, label: '< 30 anos' },
    { value: '30to50', points: 1, label: '30 a 50 anos' },
    { value: 'gt50', points: 2, label: '> 50 anos' },
  ],
};

export const MESS_THRESHOLD = 7;

export const mess: Score = {
  id: 'mess',
  name: 'MESS — Mangled Extremity Severity Score',
  shortName: 'MESS',
  scale: { min: 1, max: 14, marks: [{ at: 7, label: 'Limiar de amputação' }] },
  category: 'Trauma grave',
  purpose: 'Estima a gravidade do membro catastrófico e ajuda a discutir amputação primária × salvamento.',
  applicability: ['Trauma grave de membro com lesão combinada de osso, partes moles, vasos e/ou nervos.'],
  limitations: [
    'Desenvolvido em amostra pequena e retrospectiva; estudos prospectivos (LEAP) mostraram baixa sensibilidade.',
    'Nunca deve decidir amputação isoladamente: é um apoio à discussão da equipe e com o paciente.',
  ],
  references: [
    'Johansen K et al. Objective criteria accurately predict amputation following lower extremity trauma. J Trauma. 1990;30(5):568-72.',
    'Bosse MJ et al. A prospective evaluation of the clinical utility of the lower-extremity injury-severity scores (LEAP). J Bone Joint Surg Am. 2001;83(1):3-14.',
  ],
  fields: [
    messSkeletal,
    messIschemia,
    {
      id: 'ischemiaOver6h',
      kind: 'boolean',
      label: 'Isquemia há mais de 6 horas',
      hint: 'Dobra a pontuação de isquemia.',
      showIf: (a) => a.ischemia !== undefined && a.ischemia !== 'none',
    },
    messShock,
    messAge,
  ],
  evaluate(a) {
    const s = pointsOf(messSkeletal, a);
    const isqBase = pointsOf(messIschemia, a);
    const doubled = isqBase > 0 && yes(a, 'ischemiaOver6h');
    const isq = doubled ? isqBase * 2 : isqBase;
    const sh = pointsOf(messShock, a);
    const ag = pointsOf(messAge, a);
    const total = s + isq + sh + ag;
    const high = total >= MESS_THRESHOLD;

    return {
      level: high ? 'positive' : 'negative',
      points: total,
      headline: `MESS ${total}`,
      interpretation: high
        ? `≥ ${MESS_THRESHOLD}: no estudo original, associado a amputação.`
        : `< ${MESS_THRESHOLD}: no estudo original, associado a salvamento do membro.`,
      breakdown: [
        `Lesão esquelética/partes moles: ${s} (${labelOf(messSkeletal, a)})`,
        `Isquemia: ${isq}${doubled ? ` (${isqBase} × 2, > 6 h)` : ''} (${labelOf(messIschemia, a)})`,
        `Choque: ${sh} (${labelOf(messShock, a)})`,
        `Idade: ${ag} (${labelOf(messAge, a)})`,
      ],
      recommendation: [
        'Decisão compartilhada entre ortopedia, cirurgia vascular e plástica.',
        'Considerar lesão nervosa, lesões associadas e desejo do paciente além do escore.',
      ],
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Gustilo-Anderson — fraturas expostas
// ─────────────────────────────────────────────────────────────────────────────
const gaFields: Field[] = [
  {
    id: 'arterial',
    kind: 'choice',
    section: 'Vascular',
    label: 'Há lesão arterial que exige reparo?',
    options: [
      { value: 'no', label: 'Não' },
      { value: 'yes', label: 'Sim' },
    ],
  },
  {
    id: 'wound',
    kind: 'choice',
    section: 'Ferida',
    label: 'Tamanho da ferida',
    showIf: (a) => a.arterial === 'no',
    options: [
      { value: 'lt1', label: '< 1 cm' },
      { value: '1to10', label: '1 a 10 cm' },
      { value: 'gt10', label: '> 10 cm' },
    ],
  },
  {
    id: 'contamination',
    kind: 'choice',
    label: 'Contaminação',
    showIf: (a) => a.arterial === 'no',
    options: [
      { value: 'clean', label: 'Limpa / mínima' },
      { value: 'moderate', label: 'Moderada' },
      { value: 'gross', label: 'Grosseira', hint: 'Ambiente rural, terra, fezes, água parada.' },
    ],
  },
  {
    id: 'softTissue',
    kind: 'choice',
    section: 'Partes moles e energia',
    label: 'Lesão de partes moles',
    showIf: (a) => a.arterial === 'no',
    options: [
      { value: 'minimal', label: 'Mínima' },
      { value: 'moderate', label: 'Moderada', hint: 'Sem retalhos ou avulsão extensos.' },
      { value: 'extensive', label: 'Extensa', hint: 'Retalhos, avulsão, esmagamento.' },
    ],
  },
  {
    id: 'highEnergy',
    kind: 'boolean',
    label: 'Padrão de alta energia',
    hint: 'Fratura segmentar ou muito cominutiva, PAF de alta velocidade, esmagamento.',
    showIf: (a) => a.arterial === 'no',
  },
  {
    id: 'flap',
    kind: 'choice',
    section: 'Cobertura',
    label: 'Após o desbridamento, o osso fica exposto com descolamento periosteal e exige retalho?',
    showIf: (a) => a.arterial === 'no' && isTypeIII(a),
    options: [
      { value: 'no', label: 'Não — cobertura possível com partes moles locais' },
      { value: 'yes', label: 'Sim — precisa de retalho' },
    ],
  },
];

function isTypeIII(a: Record<string, unknown>) {
  return a.wound === 'gt10' || a.contamination === 'gross' || a.softTissue === 'extensive' || a.highEnergy === true;
}

const ANTIBIOTIC: Record<string, string[]> = {
  I: ['Cobertura para gram-positivos: cefalosporina de 1ª geração (ex.: cefazolina).', 'Suspender 24 h após o fechamento da ferida.'],
  II: ['Cobertura para gram-positivos: cefalosporina de 1ª geração (ex.: cefazolina).', 'Suspender 24 h após o fechamento da ferida.'],
  III: [
    'Gram-positivos + gram-negativos: cefazolina + aminoglicosídeo (ex.: gentamicina), ou ceftriaxona conforme protocolo.',
    'Contaminação fecal ou de solo: acrescentar penicilina em altas doses (anaeróbios/Clostridium).',
    'Manter por até 72 h após o trauma ou até 24 h após a cobertura de partes moles.',
  ],
};

export const gustilo: Score = {
  id: 'gustilo-anderson',
  name: 'Classificação de Gustilo-Anderson',
  shortName: 'Gustilo-Anderson',
  category: 'Trauma grave',
  purpose: 'Classifica fraturas expostas e orienta antibioticoprofilaxia e prognóstico de infecção.',
  applicability: ['Fraturas expostas de ossos longos.'],
  limitations: [
    'A classificação definitiva é feita no centro cirúrgico, após o desbridamento.',
    'Concordância interobservador apenas moderada.',
  ],
  references: [
    'Gustilo RB, Anderson JT. Prevention of infection in the treatment of 1025 open fractures of long bones. J Bone Joint Surg Am. 1976;58(4):453-8.',
    'Gustilo RB, Mendoza RM, Williams DN. Problems in the management of type III open fractures. J Trauma. 1984;24(8):742-6.',
    'Hoff WS et al. EAST practice management guidelines: prophylactic antibiotic use in open fractures. J Trauma. 2011;70(3):751-4.',
  ],
  fields: gaFields,
  evaluate(a) {
    const common = ['Profilaxia antitetânica conforme o estado vacinal.', 'Antibiótico o mais cedo possível, idealmente na primeira hora.'];

    if (a.arterial === 'yes') {
      return {
        level: 'positive',
        headline: 'Tipo IIIC',
        interpretation: 'Fratura exposta com lesão arterial que exige reparo.',
        breakdown: ['Lesão arterial com necessidade de reparo → IIIC, independentemente da ferida.'],
        recommendation: [...ANTIBIOTIC.III, 'Acionar cirurgia vascular; considerar shunt temporário.', ...common],
      };
    }

    const reasons: string[] = [];
    if (isTypeIII(a)) {
      if (a.wound === 'gt10') reasons.push('Ferida > 10 cm');
      if (a.contamination === 'gross') reasons.push('Contaminação grosseira');
      if (a.softTissue === 'extensive') reasons.push('Lesão extensa de partes moles');
      if (a.highEnergy === true) reasons.push('Padrão de alta energia');
      const b = a.flap === 'yes';
      return {
        level: 'positive',
        headline: b ? 'Tipo IIIB' : 'Tipo IIIA',
        interpretation: b
          ? 'Perda extensa de partes moles com exposição óssea: exige retalho.'
          : 'Lesão extensa, mas com cobertura óssea adequada por partes moles locais.',
        breakdown: [...reasons.map((r) => `Critério de tipo III: ${r}`), b ? 'Necessita retalho → IIIB' : 'Cobertura local possível → IIIA'],
        recommendation: [...ANTIBIOTIC.III, ...(b ? ['Planejar cobertura com cirurgia plástica.'] : []), ...common],
      };
    }

    const typeII = a.wound === '1to10' || a.contamination === 'moderate' || a.softTissue === 'moderate';
    if (typeII) {
      if (a.wound === '1to10') reasons.push('Ferida de 1 a 10 cm');
      if (a.contamination === 'moderate') reasons.push('Contaminação moderada');
      if (a.softTissue === 'moderate') reasons.push('Lesão moderada de partes moles');
      return {
        level: 'caution',
        headline: 'Tipo II',
        interpretation: 'Ferida de 1 a 10 cm, lesão moderada de partes moles.',
        breakdown: reasons,
        recommendation: [...ANTIBIOTIC.II, ...common],
      };
    }

    return {
      level: 'caution',
      headline: 'Tipo I',
      interpretation: 'Ferida < 1 cm, limpa, lesão mínima de partes moles.',
      breakdown: ['Ferida < 1 cm', 'Contaminação mínima', 'Lesão mínima de partes moles'],
      recommendation: [...ANTIBIOTIC.I, ...common],
    };
  },
};
