# Hat Shuffle MLB

Jogo de browser inspirado no clássico "hat shuffle" dos telões de estádio de baseball: uma bola é colocada debaixo de um de três bonés, os bonés são embaralhados e você precisa adivinhar onde a bola está.

**A cada rodada o jogo troca para um time diferente da MLB** (os 30 times, em ordem aleatória): os bonés, a faixa do time e o telão mudam para as cores daquele time.

## Como jogar

1. Veja debaixo de qual boné a bola foi colocada.
2. Acompanhe o embaralhamento.
3. Clique (ou toque) no boné onde a bola está. No teclado: `1`, `2`, `3` escolhem o boné da esquerda, do meio e da direita; `Enter` avança.

- Acertou: **HOME RUN!** Pontos = 100 × rodada, mais bônus de sequência (+50 por acerto seguido).
- Errou: **STRIKE**. Três strikes e você está fora.
- Cada rodada fica mais difícil: mais trocas, mais rápidas e, a partir da 8ª rodada, rotações envolvendo os três bonés.
- Passe pelos 30 times para ser campeão.
- O recorde fica salvo no navegador.

## Rodar localmente

É HTML, CSS e JavaScript puro, sem build e sem dependências. Abra o `index.html` no navegador, ou sirva a pasta:

```bash
python3 -m http.server 8765
```

e acesse <http://localhost:8765>.

## Estrutura

| Arquivo      | O que tem                                                         |
| ------------ | ----------------------------------------------------------------- |
| `index.html` | Placar, faixa do time, telão e telas de início/fim                |
| `style.css`  | Visual de estádio à noite, telão de LED e animações               |
| `teams.js`   | Os 30 times: nome, divisão, cores do boné e letras                |
| `game.js`    | Lógica do jogo, desenho dos bonés em SVG, embaralhamento e sons   |

Os sons são gerados com Web Audio (nenhum arquivo de áudio). Os bonés são desenhados em SVG a partir das cores de `teams.js`.

## Aviso

Projeto de fã, sem afiliação com a MLB ou com qualquer time. Nomes de times pertencem aos seus donos. Nenhum logo oficial é usado: os bonés mostram apenas as letras do time, em cores aproximadas.
