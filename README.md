# OrtoScore 🦴

**▶ Abrir o app: https://julianakrmem.github.io/ortoscore/** (instalável no celular)

Escores ortopédicos e de trauma com perguntas guiadas. Você responde como faria no exame físico, e o app mostra o resultado, como ele foi calculado, a conduta sugerida pela literatura e a referência original de cada regra.

> [!WARNING]
> **Ferramenta educacional.** Os escores apoiam, mas não substituem, o exame clínico e o julgamento da equipe. Confira sempre a referência original e o protocolo da sua instituição.

## Escores

| Grupo | Escore | Para quê |
|---|---|---|
| Decisão no PS | Regras de Ottawa — tornozelo e pé | Radiografia de tornozelo e/ou pé na entorse |
| | Regra de Ottawa — joelho | Radiografia no trauma agudo de joelho |
| | Canadian C-Spine Rule | Imagem da coluna cervical no paciente alerta e estável |
| | Critérios NEXUS | Liberação clínica da coluna cervical |
| Trauma grave | MESS | Gravidade do membro catastrófico (amputação × salvamento) |
| | Gustilo-Anderson | Classificação da fratura exposta e antibioticoprofilaxia |
| Classificações | Salter-Harris | Fraturas da fise |
| | Garden | Fratura do colo do fêmur |
| Pediatria e oncologia | Critérios de Kocher | Artrite séptica × sinovite transitória do quadril |
| | Escore de Mirels | Risco de fratura patológica e fixação profilática |

## Funcionalidades

- **Perguntas guiadas.** Classificações viram árvores de decisão: no Gustilo-Anderson, a pergunta sobre retalho só aparece quando a fratura já é tipo III; uma lesão arterial leva direto ao IIIC.
- **Cálculo explicado.** Cada resultado mostra de onde veio (ex.: "MESS 9: esqueleto 3 + isquemia 4, dobrada por > 6 h + choque 1 + idade 1").
- **Régua de pontuação** com os limiares do estudo original (MESS, Mirels, Kocher).
- **Conduta sugerida pela literatura**, incluindo a antibioticoprofilaxia por tipo de fratura exposta.
- **Quando usar e limitações** de cada escore, com as referências completas.
- **Copiar para a evolução:** gera o texto para colar no prontuário.
- **Temas claro, escuro e alto contraste.**
- **PWA:** pode ser instalado no celular e funciona offline.
- Endereço próprio para cada escore (ex.: `#mess`), para compartilhar.

## Arquitetura

```
src/scores/
├── types.ts            ← contrato comum: perguntas (dados) + evaluate (função pura)
├── helpers.ts          ← pontuação, perguntas visíveis, respostas faltantes
├── ps-rules.ts         ← Ottawa tornozelo/joelho, Canadian C-Spine, NEXUS
├── trauma.ts           ← MESS, Gustilo-Anderson
├── classifications.ts  ← Salter-Harris, Garden, Kocher, Mirels
├── index.ts            ← registro dos escores e nota para o prontuário
└── scores.test.ts      ← testes (Vitest)
src/App.tsx             ← interface gerada a partir das definições
src/theme.ts            ← temas
```

**A interface não conhece nenhum escore.** Cada escore declara suas perguntas (`fields`, com `showIf` para árvores de decisão) e uma função `evaluate()` pura que devolve o resultado, a explicação e a conduta. O formulário, a régua e o painel de resultado são montados a partir dessas definições. Um escore novo é só um objeto novo em `src/scores/`.

## Testes

```bash
npm test
```

63 testes conferem cada escore contra os critérios publicados, por exemplo:

- todos os tipos de Salter-Harris, Garden e Gustilo-Anderson (incluindo casos limítrofes, como ferida pequena com alta energia → III);
- a regra de duplicar a isquemia no MESS só quando há isquemia, e o máximo teórico de 14 pontos;
- as probabilidades do estudo original de Kocher para 0 a 4 critérios;
- os limiares 7/8/9 do Mirels;
- as perguntas que aparecem ou somem em cada caminho das árvores de decisão.

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento
npm test         # testes
npm run build    # build de produção em dist/
```

O workflow em `.github/workflows/ci.yml` roda os testes e publica no GitHub Pages a cada push na `main`.

## Roadmap

- [ ] Classificação AO/OTA guiada para os ossos longos
- [ ] Neer (úmero proximal), Weber e Lauge-Hansen (tornozelo), Schatzker (platô tibial)
- [ ] Pittsburgh Knee Rules e PECARN para trauma cervical pediátrico
- [ ] Escala de Tscherne para partes moles em fraturas fechadas

## Licença

MIT. Veja [LICENSE](LICENSE).

---

Desenvolvido por **Juliana Carmem Costa**, estudante de Medicina, com auxílio de IA (Claude).
