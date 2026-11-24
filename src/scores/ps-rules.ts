import { checkedLabels, yes } from './helpers';
import type { Field, Score } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Regras de Ottawa — tornozelo e pé
// ─────────────────────────────────────────────────────────────────────────────
const ankleFields: Field[] = [
  { id: 'malleolarPain', kind: 'boolean', section: 'Localização da dor', label: 'Dor na região maleolar' },
  { id: 'midfootPain', kind: 'boolean', label: 'Dor no mediopé' },
  {
    id: 'lateralMalleolus',
    kind: 'boolean',
    section: 'Exame físico',
    label: 'Dor à palpação da borda posterior ou da ponta do maléolo lateral',
    hint: 'Nos 6 cm distais.',
  },
  {
    id: 'medialMalleolus',
    kind: 'boolean',
    label: 'Dor à palpação da borda posterior ou da ponta do maléolo medial',
    hint: 'Nos 6 cm distais.',
  },
  { id: 'fifthMetatarsal', kind: 'boolean', label: 'Dor à palpação da base do 5º metatarso' },
  { id: 'navicular', kind: 'boolean', label: 'Dor à palpação do navicular' },
  {
    id: 'cannotBearWeight',
    kind: 'boolean',
    label: 'Incapaz de dar 4 passos, logo após o trauma e na emergência',
    hint: 'Mancar conta como apoio; o que vale é conseguir dar os 4 passos.',
  },
];

export const ottawaAnkle: Score = {
  id: 'ottawa-tornozelo',
  name: 'Regras de Ottawa — tornozelo e pé',
  shortName: 'Ottawa tornozelo',
  category: 'Decisão no PS',
  purpose: 'Decide se a entorse de tornozelo precisa de radiografia de tornozelo e/ou de pé.',
  applicability: [
    'Trauma agudo de tornozelo (até 10 dias).',
    'Validada originalmente em adultos; meta-análises mostram boa sensibilidade em crianças acima de 5 anos.',
    'Não usar em intoxicação, politrauma, alteração de sensibilidade ou lesão que dificulte o exame.',
  ],
  limitations: ['Sensibilidade próxima de 98%, especificidade baixa (~30–40%): serve para descartar, não para confirmar fratura.'],
  references: [
    'Stiell IG et al. Implementation of the Ottawa ankle rules. JAMA. 1994;271(11):827-32.',
    'Bachmann LM et al. Accuracy of Ottawa ankle rules to exclude fractures: systematic review. BMJ. 2003;326:417.',
  ],
  cite: 'Stiell et al., 1994',
  example: {
    caption: 'Entorse em inversão no futebol. Dor à palpação da ponta do maléolo lateral; consegue andar mancando.',
    answers: { malleolarPain: true, lateralMalleolus: true },
    expected: 'Radiografia de tornozelo',
  },
  fields: ankleFields,
  evaluate(a) {
    const ankleXray =
      yes(a, 'malleolarPain') && (yes(a, 'lateralMalleolus') || yes(a, 'medialMalleolus') || yes(a, 'cannotBearWeight'));
    const footXray =
      yes(a, 'midfootPain') && (yes(a, 'fifthMetatarsal') || yes(a, 'navicular') || yes(a, 'cannotBearWeight'));

    const findings = checkedLabels(ankleFields, a);
    const exams = [ankleXray && 'tornozelo', footXray && 'pé'].filter(Boolean) as string[];

    if (!yes(a, 'malleolarPain') && !yes(a, 'midfootPain')) {
      return {
        level: 'not-applicable',
        headline: 'Marque a localização da dor',
        interpretation: 'A regra se aplica a dor na região maleolar e/ou no mediopé.',
        breakdown: [],
      };
    }

    if (exams.length === 0) {
      return {
        level: 'negative',
        headline: 'Regra negativa',
        interpretation: 'Radiografia dispensável pelos critérios de Ottawa.',
        breakdown: findings.length ? findings.map((f) => `Presente: ${f}`) : ['Nenhum critério de exame presente.'],
        recommendation: ['Tratamento conservador da entorse; reavaliar se não houver melhora em 5–7 dias.'],
      };
    }

    return {
      level: 'positive',
      headline: `Radiografia de ${exams.join(' e de ')}`,
      interpretation: 'Regra positiva: há critério para investigar fratura.',
      breakdown: findings.map((f) => `Presente: ${f}`),
      recommendation: exams.map((e) => (e === 'tornozelo' ? 'Radiografia de tornozelo (AP, perfil e mortise).' : 'Radiografia de pé (AP, perfil e oblíqua).')),
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Regra de Ottawa — joelho
// ─────────────────────────────────────────────────────────────────────────────
const kneeFields: Field[] = [
  { id: 'age55', kind: 'boolean', label: 'Idade ≥ 55 anos' },
  { id: 'patella', kind: 'boolean', label: 'Dor isolada à palpação da patela', hint: 'Sem outra dor óssea no joelho.' },
  { id: 'fibula', kind: 'boolean', label: 'Dor à palpação da cabeça da fíbula' },
  { id: 'flex90', kind: 'boolean', label: 'Incapaz de fletir o joelho a 90°' },
  { id: 'weight', kind: 'boolean', label: 'Incapaz de dar 4 passos, logo após o trauma e na emergência' },
];

export const ottawaKnee: Score = {
  id: 'ottawa-joelho',
  name: 'Regra de Ottawa — joelho',
  shortName: 'Ottawa joelho',
  category: 'Decisão no PS',
  purpose: 'Decide se o trauma agudo de joelho precisa de radiografia.',
  applicability: [
    'Trauma agudo de joelho (até 7 dias), adultos.',
    'Não usar em intoxicação, politrauma, alteração de sensibilidade, gestantes ou reavaliação de lesão já estudada.',
  ],
  limitations: ['Sensibilidade ~98–99%; especificidade ~45–50%.'],
  references: [
    'Stiell IG et al. Implementation of the Ottawa Knee Rule for the use of radiography in acute knee injuries. JAMA. 1997;278(23):2075-9.',
    'Bachmann LM et al. The accuracy of the Ottawa knee rule: systematic review. Ann Intern Med. 2004;140(2):121-4.',
  ],
  cite: 'Stiell et al., 1997',
  example: {
    caption: 'Queda de bicicleta, 34 anos. Dor difusa no joelho, sem dor óssea localizada; flete a 120° e anda.',
    answers: { __none: true },
    expected: 'Regra negativa',
  },
  fields: kneeFields,
  evaluate(a) {
    const findings = checkedLabels(kneeFields, a);
    if (findings.length === 0) {
      return {
        level: 'negative',
        headline: 'Regra negativa',
        interpretation: 'Radiografia dispensável pelos critérios de Ottawa.',
        breakdown: ['Nenhum dos 5 critérios presente.'],
      };
    }
    return {
      level: 'positive',
      headline: 'Radiografia de joelho',
      interpretation: 'Regra positiva: há critério para investigar fratura.',
      breakdown: findings.map((f) => `Presente: ${f}`),
      recommendation: ['Radiografia de joelho (AP e perfil; incidência axial de patela se dor patelar).'],
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Canadian C-Spine Rule
// ─────────────────────────────────────────────────────────────────────────────
const ccsrHigh = ['age65', 'dangerousMechanism', 'paresthesia'];
const ccsrLow = ['simpleRearEnd', 'sitting', 'ambulatory', 'delayedPain', 'noMidlineTenderness'];

const ccsrFields: Field[] = [
  {
    id: 'excluded',
    kind: 'boolean',
    section: 'Critérios de aplicação',
    label: 'Algum critério de exclusão',
    hint: 'Idade < 16 anos, Glasgow < 15, sinais vitais instáveis, trauma penetrante, paralisia aguda, doença vertebral conhecida, trauma > 48 h, gestante ou reavaliação.',
  },
  { id: 'age65', kind: 'boolean', section: '1. Fatores de alto risco', label: 'Idade ≥ 65 anos' },
  {
    id: 'dangerousMechanism',
    kind: 'boolean',
    label: 'Mecanismo perigoso',
    hint: 'Queda ≥ 1 m ou 5 degraus; carga axial na cabeça (mergulho); colisão em alta velocidade (> 100 km/h), capotamento ou ejeção; veículo recreativo motorizado; colisão de bicicleta.',
  },
  { id: 'paresthesia', kind: 'boolean', label: 'Parestesias nas extremidades' },
  {
    id: 'simpleRearEnd',
    kind: 'boolean',
    section: '2. Fatores de baixo risco',
    label: 'Colisão traseira simples',
    hint: 'Exclui: empurrado para o tráfego, atingido por ônibus/caminhão, capotamento, veículo em alta velocidade.',
  },
  { id: 'sitting', kind: 'boolean', label: 'Sentado na sala de emergência' },
  { id: 'ambulatory', kind: 'boolean', label: 'Deambulou em algum momento após o trauma' },
  { id: 'delayedPain', kind: 'boolean', label: 'Início tardio da dor cervical' },
  { id: 'noMidlineTenderness', kind: 'boolean', label: 'Ausência de dor à palpação da linha média cervical' },
  {
    id: 'rotation',
    kind: 'choice',
    section: '3. Rotação ativa',
    label: 'Consegue rodar ativamente o pescoço 45° para os dois lados?',
    showIf: (a) => !ccsrHigh.some((k) => a[k] === true) && ccsrLow.some((k) => a[k] === true) && a.excluded !== true,
    options: [
      { value: 'yes', label: 'Sim' },
      { value: 'no', label: 'Não' },
    ],
  },
];

export const canadianCSpine: Score = {
  id: 'canadian-c-spine',
  name: 'Canadian C-Spine Rule',
  shortName: 'Canadian C-Spine',
  category: 'Decisão no PS',
  purpose: 'Decide se o paciente alerta e estável com trauma cervical precisa de imagem da coluna cervical.',
  applicability: ['Pacientes ≥ 16 anos, Glasgow 15, estáveis, com trauma cervical nas últimas 48 h.'],
  limitations: [
    'Mais sensível e específica que o NEXUS no estudo comparativo de 2003, mas mais longa de aplicar.',
    'Se a imagem for indicada, a tomografia é hoje o exame de escolha na maioria dos protocolos.',
  ],
  references: [
    'Stiell IG et al. The Canadian C-spine rule for radiography in alert and stable trauma patients. JAMA. 2001;286(15):1841-8.',
    'Stiell IG et al. The Canadian C-spine rule versus the NEXUS low-risk criteria. N Engl J Med. 2003;349:2510-8.',
  ],
  cite: 'Stiell et al., 2001',
  example: {
    caption: 'Colisão traseira simples a 40 km/h, 42 anos. Deambulou na cena, sem dor na linha média, roda o pescoço 45° para os dois lados.',
    answers: { simpleRearEnd: true, ambulatory: true, noMidlineTenderness: true, rotation: 'yes' },
    expected: 'Imagem dispensável',
  },
  fields: ccsrFields,
  evaluate(a) {
    if (yes(a, 'excluded')) {
      return {
        level: 'not-applicable',
        headline: 'Regra não se aplica',
        interpretation: 'Paciente fora dos critérios de aplicação: decidir a imagem pelo protocolo de trauma.',
        breakdown: ['Critério de exclusão presente.'],
      };
    }
    const high = checkedLabels(ccsrFields, a, ccsrHigh);
    if (high.length) {
      return {
        level: 'positive',
        headline: 'Imagem indicada',
        interpretation: 'Há fator de alto risco.',
        breakdown: high.map((f) => `Alto risco: ${f}`),
        recommendation: ['Manter colar cervical e solicitar imagem da coluna cervical.'],
      };
    }
    const low = checkedLabels(ccsrFields, a, ccsrLow);
    if (!low.length) {
      return {
        level: 'positive',
        headline: 'Imagem indicada',
        interpretation: 'Nenhum fator de baixo risco que permita testar a mobilidade com segurança.',
        breakdown: ['Sem fatores de alto risco.', 'Sem fatores de baixo risco.'],
        recommendation: ['Manter colar cervical e solicitar imagem da coluna cervical.'],
      };
    }
    if (a.rotation === 'no') {
      return {
        level: 'positive',
        headline: 'Imagem indicada',
        interpretation: 'Não consegue rodar o pescoço 45° para os dois lados.',
        breakdown: ['Sem fatores de alto risco.', ...low.map((f) => `Baixo risco: ${f}`), 'Rotação ativa de 45° ausente.'],
        recommendation: ['Manter colar cervical e solicitar imagem da coluna cervical.'],
      };
    }
    return {
      level: 'negative',
      headline: 'Imagem dispensável',
      interpretation: 'Coluna cervical pode ser liberada clinicamente.',
      breakdown: ['Sem fatores de alto risco.', ...low.map((f) => `Baixo risco: ${f}`), 'Roda o pescoço 45° para os dois lados.'],
      recommendation: ['Retirar o colar cervical.'],
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// NEXUS
// ─────────────────────────────────────────────────────────────────────────────
const nexusFields: Field[] = [
  { id: 'midline', kind: 'boolean', label: 'Dor à palpação da linha média cervical posterior' },
  { id: 'intoxication', kind: 'boolean', label: 'Sinais de intoxicação' },
  { id: 'alertness', kind: 'boolean', label: 'Alteração do nível de consciência' },
  { id: 'neuro', kind: 'boolean', label: 'Déficit neurológico focal' },
  { id: 'distracting', kind: 'boolean', label: 'Lesão dolorosa que distrai', hint: 'Ex.: fratura de ossos longos, queimadura extensa, lesão visceral.' },
];

export const nexus: Score = {
  id: 'nexus',
  name: 'Critérios NEXUS',
  shortName: 'NEXUS',
  category: 'Decisão no PS',
  purpose: 'Identifica o paciente de baixo risco com trauma cervical que dispensa imagem.',
  applicability: ['Trauma contuso com suspeita de lesão cervical, qualquer idade adulta.'],
  limitations: [
    'Sensibilidade ~99% no estudo original, mas menor em idosos (≥ 65 anos): use com cautela nessa faixa.',
    'Poucas crianças pequenas no estudo de validação.',
  ],
  references: [
    'Hoffman JR et al. Validity of a set of clinical criteria to rule out injury to the cervical spine in patients with blunt trauma. N Engl J Med. 2000;343:94-9.',
  ],
  cite: 'Hoffman et al., 2000',
  example: {
    caption: 'Queda da própria altura, 58 anos, alerta e sem déficit. Dor à palpação da linha média em C5.',
    answers: { midline: true },
    expected: 'Imagem indicada',
  },
  fields: nexusFields,
  evaluate(a) {
    const present = checkedLabels(nexusFields, a);
    if (present.length === 0) {
      return {
        level: 'negative',
        headline: 'Baixo risco',
        interpretation: 'Os 5 critérios estão ausentes: imagem cervical dispensável.',
        breakdown: ['Nenhum critério NEXUS presente.'],
        recommendation: ['Retirar o colar cervical.'],
      };
    }
    return {
      level: 'positive',
      headline: 'Imagem indicada',
      interpretation: 'Ao menos um critério NEXUS presente.',
      breakdown: present.map((f) => `Presente: ${f}`),
      recommendation: ['Manter colar cervical e solicitar imagem da coluna cervical.'],
    };
  },
};
