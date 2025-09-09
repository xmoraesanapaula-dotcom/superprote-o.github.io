// ARQUIVO: doc-loader.js
// RESPONSABILIDADE: Carregar, converter e exibir documentos Markdown na página 'documento.html'.
// VERSÃO: 2.0.0 (Reescrito para o novo layout com breadcrumbs, paginação e metadados)

// Importa a biblioteca front-matter (precisará ser carregada no HTML)
import fm from 'https://cdn.jsdelivr.net/npm/front-matter@4.0.2/dist/front-matter.mjs';

document.addEventListener('DOMContentLoaded', async () => {
    const contentArea = document.getElementById('markdown-content');
    const tocContainer = document.getElementById('table-of-contents');
    const breadcrumbsContainer = document.getElementById('breadcrumbs');
    const paginationContainer = document.getElementById('pagination-nav');
    const lastUpdatedSpan = document.getElementById('last-updated');

    if (!contentArea || !tocContainer) {
        console.error("Elementos essenciais do layout de documento não foram encontrados.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const pageName = params.get('pagina');

    if (!pageName) {
        contentArea.innerHTML = `<h1>Erro</h1><p>Nenhuma página especificada.</p>`;
        return;
    }

    try {
        // Carrega o Markdown e a lista de todos os artigos em paralelo
        const [markdownResponse, navResponse] = await Promise.all([
            fetch(`artigos/${pageName}.md`),
            fetch('artigos.json')
        ]);

        if (!markdownResponse.ok) throw new Error(`Documento ${pageName}.md não encontrado.`);
        if (!navResponse.ok) throw new Error(`Arquivo de navegação artigos.json não encontrado.`);

        const markdownText = await markdownResponse.text();
        const navLinks = await navResponse.json();
        
        // Usa a biblioteca front-matter para separar metadados do conteúdo
        const { attributes, body } = fm(markdownText);
        
        // Renderiza o corpo do Markdown
        contentArea.innerHTML = marked.parse(body);

        // Funções para popular o novo layout
        buildBreadcrumbs(attributes.title, breadcrumbsContainer);
        updateMetadata(attributes.lastUpdated, lastUpdatedSpan);
        buildPagination(pageName, navLinks, paginationContainer);

        // Funções antigas que continuam a funcionar
        buildTableOfContents(contentArea, tocContainer);
        activateScrollSpy();
        enhanceCodeBlocks();

    } catch (error) {
        console.error('Erro ao carregar o documento:', error);
        contentArea.innerHTML = `<h1 class="text-red-500">Erro ao carregar documento</h1><p>${error.message}</p>`;
    }

    function buildBreadcrumbs(title, container) {
        if (!container) return;
        container.innerHTML = `
            <a class="hover:text-[var(--primary-color)]" href="index.html">Docs</a>
            <span>/</span>
            <span class="text-[var(--text-primary)] font-semibold">${title || 'Artigo'}</span>
        `;
    }

    function updateMetadata(date, container) {
        if (!container || !date) return;
        const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        container.textContent = `Última atualização: ${formattedDate}`;
    }

    function buildPagination(currentPage, allLinks, container) {
        if (!container) return;
        const currentIndex = allLinks.findIndex(link => link.pagina === currentPage);
        
        const prevLink = allLinks[currentIndex - 1];
        const nextLink = allLinks[currentIndex + 1];

        let prevHTML = '';
        if (prevLink) {
            prevHTML = `
                <a class="inline-flex items-center gap-2 rounded-md border border-[var(--secondary-color)] bg-[var(--background-primary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--secondary-color)]" href="documento.html?pagina=${prevLink.pagina}">
                    <span class="material-symbols-outlined">arrow_back</span>
                    <span>${prevLink.titulo}</span>
                </a>`;
        }

        let nextHTML = '';
        if (nextLink) {
            nextHTML = `
                <a class="inline-flex items-center gap-2 rounded-md border border-[var(--secondary-color)] bg-[var(--background-primary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--secondary-color)]" href="documento.html?pagina=${nextLink.pagina}">
                    <span>${nextLink.titulo}</span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                </a>`;
        }
        
        container.innerHTML = `${prevHTML} <div class="flex-grow"></div> ${nextHTML}`;
    }

    function buildTableOfContents(sourceElement, targetContainer) {
        targetContainer.innerHTML = '';
        const headings = sourceElement.querySelectorAll('h2, h3, h4');
        headings.forEach((heading, index) => {
            const id = `heading-${index}-${heading.tagName}`;
            heading.id = id;
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = heading.textContent;
            link.className = 'block rounded-md px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--secondary-color)]';
            if (heading.tagName === 'H3') link.style.paddingLeft = '2.5rem';
            else if (heading.tagName === 'H4') link.style.paddingLeft = '3.5rem';
            targetContainer.appendChild(link);
        });
    }

    function activateScrollSpy() {
        const headings = [...contentArea.querySelectorAll('h2, h3, h4')];
        const tocLinks = [...tocContainer.querySelectorAll('a')];
        if (headings.length === 0) return;
        
        const highlightTocLink = () => {
            let activeHeadingId = '';
            const headerOffset = 80;
            headings.forEach(h => {
                if (h.getBoundingClientRect().top <= headerOffset) activeHeadingId = h.id;
            });
            tocLinks.forEach(l => {
                l.classList.toggle('active-toc-link', l.href.endsWith(`#${activeHeadingId}`));
            });
        };
        window.addEventListener('scroll', highlightTocLink, { passive: true });
        highlightTocLink();
    }

    function enhanceCodeBlocks() {
        contentArea.querySelectorAll('pre').forEach(block => {
            const code = block.querySelector('code');
            let lang = 'shell';
            if (code && code.className.startsWith('language-')) {
                lang = code.className.replace('language-', '').trim();
            }
            const header = document.createElement('div');
            header.className = 'code-block-header';
            header.innerHTML = `<span class="language-name">${lang}</span><button class="copy-code-btn"><span class="material-symbols-outlined">content_copy</span><span>Copiar</span></button>`;
            block.prepend(header);
            header.querySelector('button').addEventListener('click', () => {
                if (!code) return;
                navigator.clipboard.writeText(code.innerText).then(() => {
                    const btn = header.querySelector('button');
                    btn.innerHTML = `<span class="material-symbols-outlined">done</span><span>Copiado!</span>`;
                    setTimeout(() => {
                        btn.innerHTML = `<span class="material-symbols-outlined">content_copy</span><span>Copiar</span>`;
                    }, 2000);
                });
            });
        });
    }
});
