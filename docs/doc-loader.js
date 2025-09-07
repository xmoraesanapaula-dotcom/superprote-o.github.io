// ARQUIVO: doc-loader.js
// RESPONSABILIDADE: Carregar, converter e exibir documentos Markdown na página 'documento.html'.

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('markdown-content');
    const tocContainer = document.getElementById('table-of-contents');

    // Se os elementos principais não existirem, não faz nada.
    if (!contentArea || !tocContainer) {
        console.error("Área de conteúdo ou de sumário não encontrada. O script 'doc-loader.js' não será executado.");
        return;
    }

    // 1. LÊ A URL PARA PEGAR O NOME DO DOCUMENTO
    const params = new URLSearchParams(window.location.search);
    const pageName = params.get('pagina');

    if (!pageName) {
        contentArea.innerHTML = `<h1>Erro</h1><p>Nenhuma página especificada. Por favor, use um link no formato <code>documento.html?pagina=nome-do-arquivo</code>.</p>`;
        return;
    }

    const markdownFile = `/docs/${pageName}.md`;

    // 2. BUSCA O ARQUIVO MARKDOWN
    fetch(markdownFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Documento não encontrado: ${response.statusText}`);
            }
            return response.text();
        })
        .then(markdownText => {
            // 3. CONVERTE O MARKDOWN PARA HTML USANDO A BIBLIOTECA 'marked'
            // A biblioteca 'marked' foi carregada via CDN no documento.html
            contentArea.innerHTML = marked.parse(markdownText);
            
            // 4. CRIA A "TABLE OF CONTENTS" (SUMÁRIO) DINAMICAMENTE
            buildTableOfContents(contentArea, tocContainer);
        })
        .catch(error => {
            console.error('Erro ao carregar o documento:', error);
            contentArea.innerHTML = `
                <h1 style="color: var(--color-error);">Erro ao carregar documento</h1>
                <p>O arquivo <code>${markdownFile}</code> não pôde ser encontrado ou lido.</p>
                <p>Verifique se o arquivo existe na pasta '/docs/' e se o nome na URL está correto.</p>
            `;
        });

    /**
     * Constrói o sumário (Table of Contents) na barra lateral
     * a partir dos títulos (h2, h3) encontrados no conteúdo renderizado.
     */
    function buildTableOfContents(sourceElement, targetContainer) {
        targetContainer.innerHTML = ''; // Limpa o container
        const headings = sourceElement.querySelectorAll('h2, h3');

        headings.forEach((heading, index) => {
            // Cria um ID único para cada título para que os links possam apontar para ele
            const id = `heading-${index}-${heading.tagName}`;
            heading.id = id;

            // Cria o link do sumário
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = heading.textContent;
            
            // Adiciona classes de estilo e indentação para H3
            link.className = 'block rounded-md px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--secondary-color)]';
            if (heading.tagName === 'H3') {
                link.style.paddingLeft = '2.5rem';
            }
            
            targetContainer.appendChild(link);
        });
    }
});
