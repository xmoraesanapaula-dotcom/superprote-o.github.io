document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const mainContent = document.getElementById('mainContent');
    const sidebarNav = document.getElementById('sidebarNav');
    const tocContainer = document.getElementById('tocContainer');
    const themeToggleButton = document.getElementById('themeToggleButton'); // Novo botão para abrir o dropdown
    const themeDropdown = document.getElementById('themeDropdown'); // Novo dropdown
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const sidebar = document.getElementById('sidebar');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    // --- ESTADO DA APLICAÇÃO ---
    let searchIndex = [];
    let navStructure = [];
    let tocObserver;
    const availableThemes = ['light', 'dark', 'light-high-contrast', 'dark-high-contrast'];

    /**
     * Carrega e renderiza um arquivo Markdown no conteúdo principal.
     * @param {string} path - O caminho para o arquivo .md.
     * @param {string} searchTerm - Termo de pesquisa para realçar.
     */
    const loadContent = async (path, searchTerm = '') => {
        // Remove a classe 'loaded' para reiniciar a animação
        mainContent.classList.remove('loaded');

        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error('Documento não encontrado.');
            
            let markdown = await response.text();
            
            // Realça termos de pesquisa no conteúdo (se houver)
            if (searchTerm) {
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                markdown = markdown.replace(regex, '<span class="highlight">$1</span>');
            }

            mainContent.innerHTML = marked.parse(markdown);
            
            // Adiciona a classe 'loaded' após um pequeno atraso para a animação
            setTimeout(() => {
                mainContent.classList.add('loaded');
            }, 50);

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
        const path = window.location.hash.substring(1).split('?')[0] || defaultPath || 'home.md'; // Ignora query params
        const params = new URLSearchParams(window.location.hash.substring(1).split('?')[1]);
        const searchTerm = params.get('q') || ''; // Pega o termo de pesquisa da URL se existir

        loadContent(path, searchTerm);
    };

    /**
     * Constrói a navegação da barra lateral a partir do nav.json.
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
        if (headings.length < 2) { // Não gerar TOC se menos de 2 headings
            document.getElementById('tocSidebar').style.display = 'none';
            return;
        } else {
            document.getElementById('tocSidebar').style.display = 'block'; // Mostra se houver TOC
        }

        const ul = document.createElement('ul');
        headings.forEach(h => {
            const id = h.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            h.id = id;
            
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${window.location.hash.split('?')[0].substring(1)}?q=${searchInput.value}#${id}`; // Mantém termo de busca na URL
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
                if (link) { // Verifica se o link existe
                    if (entry.isIntersecting) {
                        tocLinks.forEach(l => l.classList.remove('toc-active'));
                        link.classList.add('toc-active');
                    }
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
                    console.error(`Não foi possível indexar: ${item.path}`, e);
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

        // Prioriza resultados que contêm a query no título
        const titleResults = searchIndex.filter(item => item.title.toLowerCase().includes(query));
        const contentResults = searchIndex.filter(item => 
            !item.title.toLowerCase().includes(query) && // Evita duplicados já no título
            item.content.toLowerCase().includes(query)
        );

        const results = [...titleResults, ...contentResults];

        if (results.length > 0) {
            results.forEach(item => {
                const resultItem = document.createElement('a');
                resultItem.href = `#${item.path}?q=${encodeURIComponent(query)}`; // Adiciona termo na URL
                resultItem.className = 'search-result-item';
                
                // Realça o termo de busca no título do resultado
                const highlightedTitle = item.title.replace(new RegExp(query, 'gi'), '<span class="highlight">$&</span>');
                
                resultItem.innerHTML = `<span class="title">${highlightedTitle}</span><span class="path">${item.path}</span>`;
                resultItem.onclick = () => {
                    searchInput.value = '';
                    searchResults.classList.remove('visible');
                    // Não precisa mais chamar loadContent aqui, o hashchange fará isso
                };
                searchResults.appendChild(resultItem);
            });
        } else {
            searchResults.innerHTML = '<div class="no-results">Nenhum resultado encontrado.</div>';
        }
        searchResults.classList.add('visible');
    };

    /**
     * Altera o tema do site.
     * @param {string} themeName - O nome do tema ('light', 'dark', etc.).
     */
    const setTheme = (themeName) => {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
        updateThemeDropdownActiveState(themeName);
    };

    /**
     * Atualiza o estado ativo dos botões no dropdown de temas.
     * @param {string} activeTheme - O tema atualmente ativo.
     */
    const updateThemeDropdownActiveState = (activeTheme) => {
        themeDropdown.querySelectorAll('button').forEach(button => {
            button.classList.toggle('active-theme', button.dataset.themeName === activeTheme);
        });
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
        // Inicializa o tema
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);

        try {
            const response = await fetch('nav.json'); // Atualizado para nav.json
            navStructure = await response.json();
            buildNav(navStructure, sidebarNav);
            handleRouting();
            await buildSearchIndex(navStructure);
        } catch(error) {
            console.error("Falha ao carregar a navegação:", error);
            mainContent.innerHTML = "<h1>Erro Crítico</h1><p>Não foi possível carregar a navegação do site (nav.json). Verifique o console para mais detalhes.</p>";
        }

        window.addEventListener('hashchange', handleRouting);
        
        // Evento para abrir/fechar o dropdown de temas
        themeToggleButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique no botão feche o dropdown imediatamente
            themeDropdown.classList.toggle('visible');
        });

        // Eventos para selecionar o tema
        themeDropdown.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                setTheme(button.dataset.themeName);
                themeDropdown.classList.remove('visible'); // Fecha o dropdown após a seleção
            });
        });

        // Fecha o dropdown se clicar fora
        document.addEventListener('click', (e) => {
            if (!themeDropdown.contains(e.target) && e.target !== themeToggleButton) {
                themeDropdown.classList.remove('visible');
            }
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
