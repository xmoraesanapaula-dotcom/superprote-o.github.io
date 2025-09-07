# Recursos Avançados: Pesquisa e Temas

Agora que o site está 100% funcional, vamos explorar os recursos dinâmicos que construímos. Esta página serve como um guia e uma demonstração dessas funcionalidades.

## A Magia da Pesquisa Instantânea

A barra de pesquisa no topo não é apenas um enfeite; é um motor de busca completo que funciona inteiramente no seu navegador, sem precisar de um servidor.

### Como Funciona?

1.  **Indexação:** Ao carregar o site, o `app.js` lê o seu arquivo `nav.json`. Em seguida, ele visita silenciosamente cada página listada e armazena o título e o conteúdo completo de todos os seus arquivos `.md` em memória.
2.  **Filtragem em Tempo Real:** Conforme você digita na caixa de pesquisa, o JavaScript filtra esse índice em tempo real, procurando por qualquer artigo que contenha o texto que você digitou.
3.  **Resultados:** Os artigos correspondentes são exibidos imediatamente abaixo da barra de pesquisa.

**Teste você mesmo:** Tente pesquisar pela palavra **"variáveis"** ou pela frase **"instalação do console"**. A pesquisa deve encontrar este documento instantaneamente!

## Personalização com Temas Dinâmicos

Um bom site de documentação deve ser confortável para ler, de dia ou de noite. O nosso sistema de temas permite isso com um clique.

O botão de sol/lua no canto superior direito alterna entre os modos claro e escuro. Essa funcionalidade é construída de forma moderna e eficiente, usando variáveis CSS.

### A Técnica por Trás dos Temas

O JavaScript simplesmente adiciona um atributo `data-theme="dark"` ao corpo da página. O CSS faz todo o resto do trabalho, trocando as cores que definimos em variáveis.

Veja como o `style.css` lida com isso. Este é um ótimo exemplo para testar o recurso de **copiar código** e também o **destaque de sintaxe** que implementamos.

```css
/* Definição das cores padrão (tema claro) */
:root {
  --bg-primary: #ffffff;
  --text-primary: #24292f;
  --border-primary: #d0d7de;
}

/* Quando o atributo data-theme='dark' está presente, trocamos os valores */
[data-theme='dark'] {
  --bg-primary: #0d1117;
  --text-primary: #c9d1d9;
  --border-primary: #30363d;
}

/* O resto do código usa essas variáveis, sem se preocupar com o tema */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
