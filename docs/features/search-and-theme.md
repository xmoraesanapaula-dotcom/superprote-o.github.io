# Recursos Avançados: Pesquisa e Temas (Atualizado!)

Agora que o site está 100% funcional e com novos aprimoramentos, vamos explorar os recursos dinâmicos que construímos. Esta página serve como um guia e uma demonstração dessas funcionalidades.

## A Magia da Pesquisa Instantânea

A barra de pesquisa no topo não é apenas um enfeite; é um motor de busca completo que funciona inteiramente no seu navegador, sem precisar de um servidor.

### Como Funciona?

1.  **Indexação Eficiente:** Ao carregar o site, o `app.js` lê o seu arquivo `nav.json`. Em seguida, ele visita silenciosamente cada página listada e armazena o título e o conteúdo completo de todos os seus arquivos `.md` em memória.
2.  **Filtragem em Tempo Real:** Conforme você digita na caixa de pesquisa, o JavaScript filtra esse índice em tempo real, procurando por qualquer artigo que contenha o texto que você digitou.
3.  **Resultados Inteligentes e Visuais:** Os artigos correspondentes são exibidos imediatamente abaixo da barra de pesquisa. Notavelmente, os termos da sua pesquisa são **realçados** tanto nos títulos dos resultados quanto no conteúdo da página após você navegar para ela, facilitando a identificação rápida das informações.

**Teste você mesmo:** Tente pesquisar pela palavra **"variáveis"** ou pela frase **"instalação do console"**. A pesquisa deve encontrar e realçar os termos neste documento instantaneamente!

## Personalização com Temas Dinâmicos e de Alto Contraste

Um bom site de documentação deve ser confortável para ler, de dia ou de noite, e acessível para todos. O nosso sistema de temas permite isso com um clique e agora oferece ainda mais opções.

O botão de tema no canto superior direito agora abre um menu que permite escolher entre quatro temas:

  * **Claro (Light)**
  * **Escuro (Dark)**
  * **Claro Contraste (Light High Contrast)**
  * **Escuro Contraste (Dark High Contrast)**

### A Técnica por Trás dos Temas (Variáveis CSS)

O JavaScript simplesmente adiciona um atributo `data-theme="[nome-do-tema]"` à tag `<html>` do documento. O CSS faz todo o resto do trabalho, trocando as cores que definimos em variáveis.

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

/* Exemplo de tema de Alto Contraste */
[data-theme='dark-high-contrast'] {
    --bg-primary: #000000; /* Preto puro */
    --text-primary: #ffffff; /* Branco puro */
    --border-primary: #424242;
}

/* O resto do código usa essas variáveis, sem se preocupar com o tema */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
