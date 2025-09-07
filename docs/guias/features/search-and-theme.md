# Recursos: Pesquisa e Temas

Esta página existe para testar as funcionalidades dinâmicas do site.

## Testando a Pesquisa

O sistema de pesquisa é feito inteiramente no lado do cliente (client-side). Ao carregar o site, o JavaScript busca o conteúdo de todos os arquivos Markdown listados no `_nav.json` e cria um índice em memória.

Quando você digita algo na barra de pesquisa (como a palavra "índice"), o `app.js` filtra esse índice e mostra os resultados.

## Testando os Temas

O botão de tema no topo da página adiciona ou remove um atributo `data-theme='dark'` na tag `<html>` do documento.

O arquivo `style.css` usa variáveis CSS que mudam de valor com base nesse atributo, permitindo uma troca de tema instantânea.

```css
/* Exemplo do CSS para temas */
:root {
  --bg-primary: #ffffff;
  --text-primary: #24292f;
}

[data-theme='dark'] {
  --bg-primary: #0d1117;
  --text-primary: #c9d1d9;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
