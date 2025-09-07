document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const mainContent = document.getElementById('mainContent');
    const sidebarNav = document.getElementById('sidebarNav');
    const tocContainer = document.getElementById('tocContainer');
    const themeToggle = document.getElementById('themeToggle');
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const sidebar = document.getElementById('sidebar');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    // --- ESTADO DA APLICAÇÃO ---
    let searchIndex = [];
    let navStructure = [];
    let tocObserver;

    /**
     * Carrega e renderiza um arquivo Markdown no conteúdo principal.
     * @param {string} path - O caminho para o arquivo .md.
     */
    const loadContent = async (path) => {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error('Documento não encontrado.');
            
            const markdown = await response.text();
            mainContent.innerHTML = marked.parse(markdown);
            
            Prism.highlightAllUnder(mainContent);
            updateActiveLink(path);
            generateAndObserveToc();
            mainContent.scrollTop = 0;
            document.title = findTitleByPath(path) || 'Docs';
        } catch (error) {
            mainContent.innerHTML = `<h1>Erro</h1><p>${error.message}</p>`;
        }
    };

    /**
     * Controla o roteamento com base no hash da URL.
     */
    const handleRouting = () => {
        const defaultPath = navStructure[0]?.children ? navStructure[0].children[0].path : navStructure[0]?.path;
        const path = window.location.hash.substring(1) || defaultPath || 'home.md';
        loadContent(path);
    };

    /**
     * Constrói a navegação da barra lateral a partir do _nav.json.
     */
    const buildNav = (items, parentElement) => {
        const ul = document.createElement('ul');
        items.forEach(item => {
            const li = document.createElement('li');
            if (item.path) {
                const a = document.createElement('a');
                a.href = `#${item.path}`;
                a.textContent = item.title;
                a.dataset.path = item.path;
                li.appendChild(a);
            } else {
                li.textContent = item.title;
                li.classList.add('sidebar-category');
            }
            if (item.children) {
                buildNav(item.children, li);
            }
            ul.appendChild(li);
        });
        parentElement.appendChild(ul);
    };

    /**
     * Gera o sumário ("Nesta Página") e configura o observador de rolagem.
     */
    const generateAndObserveToc = () => {
        if (tocObserver) tocObserver.disconnect();
        tocContainer.innerHTML = '';
        const headings = mainContent.querySelectorAll('h2, h3');
        if (headings.length < 2) return;

        const ul = document.createElement('ul');
        headings.forEach(h => {
            const id = h.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            h.id = id;
            
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.textContent = h.textContent;
            a.dataset.targetId = id;
            a.classList.add(`toc-${h.tagName.toLowerCase()}`);
            li.appendChild(a);
            ul.appendChild(li);
        });
        tocContainer.appendChild(ul);
        
        const tocLinks = tocContainer.querySelectorAll('a');
        const observerOptions = { rootMargin: '-50px 0px -50% 0px', threshold: 1.0 };

        tocObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const link = tocContainer.querySelector(`a[data-target-id="${id}"]`);
                if (link && entry.isIntersecting) {
                    tocLinks.forEach(l => l.classList.remove('toc-active'));
                    link.classList.add('toc-active');
                }
            });
        }, observerOptions);

        headings.forEach(h => tocObserver.observe(h));
    };
    
    /**
     * Constrói o índice de pesquisa buscando todos os arquivos .md.
     */
    const buildSearchIndex = async (items) => {
        for (const item of items) {
            if (item.path) {
                try {
                    const response = await fetch(item.path);
                    const content = await response.text();
                    searchIndex.push({ path: item.path, title: item.title, content: content });
                } catch (e) {
                    console.error(`Não foi possível indexar: ${item.path}`);
                }
            }
            if (item.children) {
                await buildSearchIndex(item.children);
            }
        }
    };

    /**
     * Executa a pesquisa e exibe os resultados.
     */
    const performSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        searchResults.innerHTML = '';

        if (query.length < 2) {
            searchResults.classList.remove('visible');
            return;
        }

        const results = searchIndex.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.content.toLowerCase().includes(query)
        );

        if (results.length > 0) {
            results.forEach(item => {
                const resultItem = document.createElement('a');
                resultItem.href = `#${item.path}`;
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `<span class="title">${item.title}</span><span class="path">${item.path}</span>`;
                resultItem.onclick = () => {
                    searchInput.value = '';
                    searchResults.classList.remove('visible');
                };
                searchResults.appendChild(resultItem);
            });
        } else {
            searchResults.innerHTML = '<div class="no-results">Nenhum resultado encontrado.</div>';
        }
        searchResults.classList.add('visible');
    };

    // --- FUNÇÕES AUXILIARES ---
    const updateActiveLink = (path) => {
        document.querySelectorAll('#sidebarNav a').forEach(a => {
            a.classList.toggle('active', a.dataset.path === path);
        });
    };
    
    const findTitleByPath = (path, items = navStructure) => {
        for (const item of items) {
            if (item.path === path) return item.title;
            if (item.children) {
                const found = findTitleByPath(path, item.children);
                if (found) return found;
            }
        }
        return null;
    };
    
    // --- INICIALIZAÇÃO E EVENTOS ---
    const init = async () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        try {
            const response = await fetch('_nav.json');
            navStructure = await response.json();
            buildNav(navStructure, sidebarNav);
            handleRouting();
            await buildSearchIndex(navStructure);
        } catch(error) {
            console.error("Falha ao carregar a navegação:", error);
            mainContent.innerHTML = "<h1>Erro Crítico</h1><p>Não foi possível carregar a navegação do site (_nav.json). Verifique o console para mais detalhes.</p>";
        }

        window.addEventListener('hashchange', handleRouting);
        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
        mobileMenuButton.addEventListener('click', () => sidebar.classList.toggle('open'));
        searchInput.addEventListener('keyup', performSearch);
        searchInput.addEventListener('focus', performSearch);
        document.addEventListener('click', (e) => {
            if (!searchResults.contains(e.target) && e.target !== searchInput) {
                searchResults.classList.remove('visible');
            }
        });
    };

    init();
});
