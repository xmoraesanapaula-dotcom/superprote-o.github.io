// ARQUIVO: doc-loader.js
// RESPONSABILIDADE: Carregar, converter e exibir documentos Markdown na página 'documento.html'.

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('markdown-content');
    const tocContainer = document.getElementById('table-of-contents');

    if (!contentArea || !tocContainer) {
        console.error("Área de conteúdo ou de sumário não encontrada. O script 'doc-loader.js' não será executado.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const pageName = params.get('pagina');

    if (!pageName) {
        contentArea.innerHTML = `<h1>Erro</h1><p>Nenhuma página especificada. Por favor, use um link no formato <code>documento.html?pagina=nome-do-arquivo</code>.</p>`;
        return;
    }

    const markdownFile = `artigos/${pageName}.md`;

    fetch(markdownFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Documento não encontrado: ${response.statusText}`);
            }
            return response.text();
        })
        .then(markdownText => {
            contentArea.innerHTML = marked.parse(markdownText);
            buildTableOfContents(contentArea, tocContainer);
            activateScrollSpy();
            enhanceCodeBlocks();
        })
        .catch(error => {
            console.error('Erro ao carregar o documento:', error);
            contentArea.innerHTML = `
                <h1 style="color: var(--color-error);">Erro ao carregar documento</h1>
                <p>O arquivo <code>${markdownFile}</code> não pôde ser encontrado ou lido.</p>
                <p>Verifique se o arquivo existe na pasta 'artigos/' e se o nome na URL está correto.</p>
            `;
        });

    function buildTableOfContents(sourceElement, targetContainer) {
        targetContainer.innerHTML = '';
        // ATUALIZADO: Agora seleciona h2, h3, e h4
        const headings = sourceElement.querySelectorAll('h2, h3, h4');

        headings.forEach((heading, index) => {
            const id = `heading-${index}-${heading.tagName}`;
            heading.id = id;
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = heading.textContent;
            
            link.className = 'block rounded-md px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--secondary-color)]';
            
            // Adiciona recuo (padding) com base no nível do título
            if (heading.tagName === 'H3') {
                link.style.paddingLeft = '2.5rem';
            } else if (heading.tagName === 'H4') {
                link.style.paddingLeft = '3.5rem'; // Maior recuo para H4
            }
            
            targetContainer.appendChild(link);
        });
    }

    function activateScrollSpy() {
        // ATUALIZADO: Agora monitora h2, h3, e h4
        const headings = [...contentArea.querySelectorAll('h2, h3, h4')];
        const tocLinks = [...tocContainer.querySelectorAll('a')];

        if (headings.length === 0 || tocLinks.length === 0) return;

        let timeout;
        const highlightTocLink = () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                let activeHeadingId = '';
                const headerOffset = 80;

                headings.forEach(heading => {
                    const rect = heading.getBoundingClientRect();
                    if (rect.top <= headerOffset) {
                        activeHeadingId = heading.id;
                    }
                });

                tocLinks.forEach(link => {
                    link.classList.remove('active-toc-link');
                    if (link.href.endsWith(`#${activeHeadingId}`)) {
                        link.classList.add('active-toc-link');
                    }
                });
            }, 100);
        };
        
        window.addEventListener('scroll', highlightTocLink);
        highlightTocLink();
    }

    function enhanceCodeBlocks() {
        const codeBlocks = contentArea.querySelectorAll('pre');
        codeBlocks.forEach(block => {
            const code = block.querySelector('code');
            let language = 'shell';

            if (code && code.className.startsWith('language-')) {
                language = code.className.replace('language-', '').trim();
            }

            const header = document.createElement('div');
            header.className = 'code-block-header';

            const langSpan = document.createElement('span');
            langSpan.className = 'language-name';
            langSpan.textContent = language;

            const button = document.createElement('button');
            button.className = 'copy-code-btn';
            button.title = 'Copiar código';
            button.innerHTML = '<span class="material-symbols-outlined">content_copy</span><span>Copiar</span>';

            header.appendChild(langSpan);
            header.appendChild(button);

            block.prepend(header);

            button.addEventListener('click', () => {
                if (!code) return;

                navigator.clipboard.writeText(code.innerText).then(() => {
                    button.innerHTML = '<span class="material-symbols-outlined">done</span><span>Copiado!</span>';
                    button.title = 'Copiado!';
                    
                    setTimeout(() => {
                        button.innerHTML = '<span class="material-symbols-outlined">content_copy</span><span>Copiar</span>';
                        button.title = 'Copiar código';
                    }, 2000);
                }).catch(err => {
                    console.error('Falha ao copiar o texto:', err);
                    button.title = 'Erro ao copiar';
                });
            });
        });
    }
});
