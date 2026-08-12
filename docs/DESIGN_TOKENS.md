# Design tokens — origem e limites desta fase

Os tokens em `resources/css/app.css` foram extraídos do WordPress preservado na pasta pai, cruzando o CSS gerado pelo Elementor com as capturas em `../Imagens do site`. Eles são uma base técnica, não uma proposta de redesign.

## Paleta

| Token | Valor | Uso observado |
|---|---:|---|
| `brand` | `#971C20` | CTAs, links e destaques |
| `brand-dark` | `#7F161A` | hover e bordas escuras |
| `brand-deep` | `#770408` | variação vinho |
| `ink` | `#111111` | fundos escuros e títulos |
| `text` | `#58595B` | corpo de texto |
| `muted` | `#939598` | textos secundários |
| `line` | `#E5E8EA` | bordas/divisores |
| `surface` | `#F7F7F7` | superfícies claras |
| `blue` | `#21445C` | cor auxiliar observada |
| `blue-soft` | `#AFCCD0` | fundo auxiliar observado |
| `footer` | `#121212` | footer |

## Tipografia e geometria

- Família principal observada: Gotham Rounded. Os arquivos existentes em `wp-content/uploads/2026/07/` não foram copiados; a licença deve ser confirmada antes de empacotá-los na aplicação nova.
- Fallback: Arial Rounded e fontes do sistema.
- Conteúdo: `1280px`; header: `1430px`.
- Espaçamento vertical de seção: responsivo entre `48px` e `80px`.
- Raios: cards `15px`; pills/CTAs `25px`.
- Breakpoints legados relevantes: `767px`, `1024px` e transição desktop em `1025px`.
- Sombra de card: `0 12px 32px rgba(17,17,17,.10)`.
- Sombra de header após scroll: `0 4px 18px rgba(17,17,17,.12)`.

## Comportamento estrutural observado

- Header sobre fundo escuro/hero, sticky, passando a fundo branco com sombra após scroll.
- Menu desktop a partir de `1025px`; abaixo disso, navegação em drawer vertical.
- Grids imobiliários reduzem para uma coluna no mobile.

Capturas adicionais serão usadas na fase visual para calibrar valores por página. Nenhuma composição completa da Home foi produzida nesta fase.
