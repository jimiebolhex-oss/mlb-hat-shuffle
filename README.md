# Hat Shuffle MLB

Jogo de browser inspirado no clássico "hat shuffle" dos telões de estádio de baseball: uma bola é colocada debaixo de um de três bonés, os bonés são embaralhados e você precisa adivinhar onde a bola está.

**A cada rodada o jogo troca para um time diferente da MLB** (os 30 times, em ordem aleatória): os bonés, a faixa do time e o telão mudam para as cores daquele time.

## Como jogar

1. Veja debaixo de qual boné a bola foi colocada.
2. Acompanhe o embaralhamento.
3. Clique (ou toque) no boné onde a bola está. No teclado: `1`, `2`, `3` escolhem o boné da esquerda, do meio e da direita; `Enter` avança.

- Acertou: o taco rebate a bola para um **HOME RUN!** Pontos = 100 × rodada, mais bônus de sequência (+50 por acerto seguido).
- Errou: **STRIKE**. Três strikes e você está fora.
- Já começa rápido (360 ms por troca) e acelera a cada rodada até 170 ms, com mais trocas, rotações dos três bonés (a partir da 6ª rodada) e bonés que dão cambalhota no ar (a partir da 3ª).
- Passe pelos 30 times para ser campeão.
- O recorde fica salvo no navegador.

## Vinhetas

Seguem as dos telões de estádio (vídeos de referência: Angels e Nashville Sounds):

- **HAT SHUFFLE**: abertura de cada rodada, com raios nas cores do time e a faixa com o nome dele.
- **FOLLOW THE BALL!**: enquanto a bola é mostrada.
- **WHERE IS THE BALL?**: com os selos **1 · 2 · 3** em cima de cada boné.
- **HOME RUN!**: no acerto, a bola salta, o taco a rebate ("CRACK!") e ela some por cima do muro, com fogos nas cores do time, torcida e o "Charge!" do órgão.
- **STRIKE!**: no erro, com o "ôôôh" da torcida e o boné certo revelado.
- O muro do outfield mostra o nome do time da rodada.

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
