import { describe, expect, it } from 'vitest';
import { chartNote, getScore, isPending, missingFields, SCORES } from './index';
import type { Answers } from './types';

const run = (id: string, a: Answers) => getScore(id)!.evaluate(a);

describe('Ottawa tornozelo', () => {
  it('sem localização da dor → não se aplica', () => {
    expect(run('ottawa-tornozelo', {}).level).toBe('not-applicable');
  });
  it('dor maleolar sem outros achados → negativa', () => {
    expect(run('ottawa-tornozelo', { malleolarPain: true }).level).toBe('negative');
  });
  it('dor maleolar + maléolo lateral → RX de tornozelo', () => {
    const r = run('ottawa-tornozelo', { malleolarPain: true, lateralMalleolus: true });
    expect(r.level).toBe('positive');
    expect(r.headline).toBe('Radiografia de tornozelo');
  });
  it('dor no mediopé + base do 5º metatarso → RX de pé', () => {
    expect(run('ottawa-tornozelo', { midfootPain: true, fifthMetatarsal: true }).headline).toBe('Radiografia de pé');
  });
  it('achado do pé sem dor no mediopé não indica RX de pé', () => {
    expect(run('ottawa-tornozelo', { malleolarPain: true, navicular: true }).level).toBe('negative');
  });
  it('não apoia + dor nas duas zonas → tornozelo e pé', () => {
    const r = run('ottawa-tornozelo', { malleolarPain: true, midfootPain: true, cannotBearWeight: true });
    expect(r.headline).toBe('Radiografia de tornozelo e de pé');
  });
});

describe('Ottawa joelho', () => {
  it('nenhum critério → negativa', () => expect(run('ottawa-joelho', {}).level).toBe('negative'));
  it.each(['age55', 'patella', 'fibula', 'flex90', 'weight'])('critério %s isolado → positiva', (k) => {
    expect(run('ottawa-joelho', { [k]: true }).level).toBe('positive');
  });
});

describe('Canadian C-Spine', () => {
  it('exclusão → não se aplica', () => expect(run('canadian-c-spine', { excluded: true }).level).toBe('not-applicable'));
  it('idade ≥ 65 → imagem', () => expect(run('canadian-c-spine', { age65: true, sitting: true }).level).toBe('positive'));
  it('sem fator de baixo risco → imagem', () => expect(run('canadian-c-spine', {}).level).toBe('positive'));
  it('baixo risco mas não roda → imagem', () =>
    expect(run('canadian-c-spine', { sitting: true, rotation: 'no' }).level).toBe('positive'));
  it('baixo risco e roda 45° → dispensa', () =>
    expect(run('canadian-c-spine', { ambulatory: true, rotation: 'yes' }).level).toBe('negative'));
  it('pergunta de rotação só aparece quando faz sentido', () => {
    const s = getScore('canadian-c-spine')!;
    expect(missingFields(s, { sitting: true }).map((f) => f.id)).toEqual(['rotation']);
    expect(missingFields(s, { sitting: true, age65: true })).toEqual([]);
    expect(missingFields(s, {})).toEqual([]);
  });
});

describe('NEXUS', () => {
  it('nenhum critério → baixo risco', () => expect(run('nexus', {}).level).toBe('negative'));
  it('dor na linha média → imagem', () => expect(run('nexus', { midline: true }).level).toBe('positive'));
});

describe('MESS', () => {
  const base = { skeletal: 'high', ischemia: 'pulseless', shock: 'transient', age: '30to50' }; // 3+2+1+1 = 7
  it('soma os quatro componentes', () => {
    const r = run('mess', base);
    expect(r.points).toBe(7);
    expect(r.level).toBe('positive');
  });
  it('isquemia > 6 h dobra a pontuação de isquemia', () => {
    expect(run('mess', { ...base, ischemiaOver6h: true }).points).toBe(9);
  });
  it('> 6 h não dobra quando não há isquemia', () => {
    expect(run('mess', { ...base, ischemia: 'none', ischemiaOver6h: true }).points).toBe(5);
  });
  it('6 pontos → abaixo do limiar', () => {
    expect(run('mess', { ...base, age: 'lt30' }).level).toBe('negative');
  });
  it('máximo teórico é 14', () => {
    expect(run('mess', { skeletal: 'veryHigh', ischemia: 'cold', ischemiaOver6h: true, shock: 'persistent', age: 'gt50' }).points).toBe(14);
  });
  it('exige todas as respostas', () => {
    expect(missingFields(getScore('mess')!, { skeletal: 'low' }).length).toBe(3);
  });
});

describe('Gustilo-Anderson', () => {
  const clean = { arterial: 'no', wound: 'lt1', contamination: 'clean', softTissue: 'minimal' };
  it('ferida < 1 cm limpa → I', () => expect(run('gustilo-anderson', clean).headline).toBe('Tipo I'));
  it('ferida de 1–10 cm → II', () => expect(run('gustilo-anderson', { ...clean, wound: '1to10' }).headline).toBe('Tipo II'));
  it('ferida < 1 cm com contaminação moderada → II', () =>
    expect(run('gustilo-anderson', { ...clean, contamination: 'moderate' }).headline).toBe('Tipo II'));
  it('ferida pequena mas alta energia → III', () =>
    expect(run('gustilo-anderson', { ...clean, highEnergy: true, flap: 'no' }).headline).toBe('Tipo IIIA'));
  it('> 10 cm com necessidade de retalho → IIIB', () =>
    expect(run('gustilo-anderson', { ...clean, wound: 'gt10', flap: 'yes' }).headline).toBe('Tipo IIIB'));
  it('lesão arterial → IIIC sem outras perguntas', () => {
    expect(run('gustilo-anderson', { arterial: 'yes' }).headline).toBe('Tipo IIIC');
    expect(missingFields(getScore('gustilo-anderson')!, { arterial: 'yes' })).toEqual([]);
  });
  it('pergunta do retalho só aparece no tipo III', () => {
    const s = getScore('gustilo-anderson')!;
    expect(missingFields(s, clean)).toEqual([]);
    expect(missingFields(s, { ...clean, contamination: 'gross' }).map((f) => f.id)).toEqual(['flap']);
  });
  it('tipo III inclui cobertura para gram-negativos', () => {
    const r = run('gustilo-anderson', { ...clean, contamination: 'gross', flap: 'no' });
    expect(r.recommendation!.some((x) => x.includes('gram-negativos'))).toBe(true);
    expect(r.recommendation!.some((x) => x.includes('penicilina'))).toBe(true);
  });
});

describe('Salter-Harris', () => {
  it.each([
    [{ crush: 'no', metaphysis: 'no', epiphysis: 'no' }, 'Tipo I'],
    [{ crush: 'no', metaphysis: 'yes', epiphysis: 'no' }, 'Tipo II'],
    [{ crush: 'no', metaphysis: 'no', epiphysis: 'yes' }, 'Tipo III'],
    [{ crush: 'no', metaphysis: 'yes', epiphysis: 'yes' }, 'Tipo IV'],
    [{ crush: 'yes' }, 'Tipo V'],
  ])('%o → %s', (a, t) => expect(run('salter-harris', a as Answers).headline).toBe(t));
});

describe('Garden', () => {
  it.each([
    [{ complete: 'no' }, 'Garden I', 'info'],
    [{ complete: 'yes', displacement: 'none' }, 'Garden II', 'info'],
    [{ complete: 'yes', displacement: 'partial' }, 'Garden III', 'caution'],
    [{ complete: 'yes', displacement: 'full' }, 'Garden IV', 'caution'],
  ])('%o → %s', (a, t, level) => {
    const r = run('garden', a as Answers);
    expect(r.headline).toBe(t);
    expect(r.level).toBe(level);
  });
});

describe('Kocher', () => {
  it.each([
    [{}, 0, '0,2%'],
    [{ fever: true }, 1, '3%'],
    [{ fever: true, nwb: true }, 2, '40%'],
    [{ fever: true, nwb: true, esr: true }, 3, '93,1%'],
    [{ fever: true, nwb: true, esr: true, wbc: true }, 4, '99,6%'],
  ])('%o → %i critérios', (a, n, pct) => {
    const r = run('kocher', a as Answers);
    expect(r.points).toBe(n);
    expect(r.interpretation).toContain(pct);
  });
});

describe('Mirels', () => {
  it('7 pontos → baixo risco', () => {
    const r = run('mirels', { site: 'upper', pain: 'moderate', lesion: 'mixed', size: '13to23' });
    expect(r.points).toBe(7);
    expect(r.level).toBe('negative');
  });
  it('8 pontos → limítrofe', () =>
    expect(run('mirels', { site: 'lower', pain: 'moderate', lesion: 'mixed', size: '13to23' }).level).toBe('caution'));
  it('9 pontos → fixação profilática', () => {
    const r = run('mirels', { site: 'peritrochanteric', pain: 'moderate', lesion: 'mixed', size: '13to23' });
    expect(r.points).toBe(9);
    expect(r.recommendation![0]).toContain('Fixação profilática');
  });
});

describe('integridade', () => {
  it('ids únicos', () => expect(new Set(SCORES.map((s) => s.id)).size).toBe(SCORES.length));
  it.each(SCORES.map((s) => [s.id, s] as const))('%s tem referência, aplicabilidade e campos com ids únicos', (_id, s) => {
    expect(s.references.length).toBeGreaterThan(0);
    expect(s.applicability.length).toBeGreaterThan(0);
    expect(new Set(s.fields.map((f) => f.id)).size).toBe(s.fields.length);
  });
  it('nota para prontuário inclui nome, resultado e referência', () => {
    const s = getScore('mess')!;
    const note = chartNote(s, s.evaluate({ skeletal: 'low', ischemia: 'none', shock: 'none', age: 'lt30' }));
    expect(note).toContain('MESS 1');
    expect(note).toContain('Ref.: Johansen et al., 1990.');
  });
});

describe('checklist pendente', () => {
  it('checklist sem marcação fica pendente', () => {
    expect(isPending(getScore('ottawa-joelho')!, {})).toBe(true);
    expect(isPending(getScore('kocher')!, {})).toBe(true);
    expect(isPending(getScore('canadian-c-spine')!, {})).toBe(true);
  });
  it('uma marcação ou a confirmação "nenhum" libera o resultado', () => {
    expect(isPending(getScore('ottawa-joelho')!, { fibula: true })).toBe(false);
    expect(isPending(getScore('ottawa-joelho')!, { __none: true })).toBe(false);
  });
  it('desmarcar tudo volta a ficar pendente', () => {
    expect(isPending(getScore('nexus')!, { midline: false })).toBe(true);
  });
  it('escores só de múltipla escolha nunca ficam pendentes', () => {
    expect(isPending(getScore('garden')!, {})).toBe(false);
  });
});

describe('casos clínicos de exemplo', () => {
  it.each(SCORES.map((s) => [s.id, s] as const))('%s: exemplo gera o resultado esperado', (_id, s) => {
    const a = s.example.answers;
    expect(missingFields(s, a)).toEqual([]);
    expect(isPending(s, a)).toBe(false);
    expect(s.evaluate(a).headline).toBe(s.example.expected);
  });
});
