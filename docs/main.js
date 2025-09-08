// ARQUIVO: main.js
// RESPONSABILIDADE: Controlar a lógica e interações globais.
// VERSÃO: 4.2.0 (Melhoria no menu dinâmico e destaque de links)

document.addEventListener('DOMContentLoaded', () => {
    
    // Função para inicializar os controles do tema
    function initializeThemeControls() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const themeIcon = themeToggle.querySelector('.material-symbols-outlined');
        
        const applyTheme = (theme) => {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                if (themeIcon) themeIcon.textContent = 'light_mode';
            } else {
                document.documentElement.classList.remove('dark');
                if (themeIcon) themeIcon.textContent = 'dark_mode';
            }
        };

        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            // Adiciona classe para desativar transições durante a troca de tema
            document.documentElement.classList.add('no-transitions');
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            // Força o navegador a recalcular os estilos e remove a classe
            window.setTimeout(() => {
                document.documentElement.classList.remove('no-transitions');
            }, 0);
        });
        
        // Aplica o tema inicial
        const currentTheme = localStorage.getItem('theme') || 'light';
        applyTheme(currentTheme);
    }

    // Função para inicializar a sidebar responsiva
    function initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
        const sidebarOverlay = document.getElementById('sidebar-overlay');

        if (!sidebar || !hamburgerBtn || !sidebarCloseBtn || !sidebarOverlay) {
            console.warn("Um ou mais elementos da sidebar não foram encontrados. A funcionalidade pode estar comprometida.");
            return;
        }

        const openSidebar = () => document.body.classList.add('sidebar-open');
        const closeSidebar = () => document.body.classList.remove('sidebar-open');

        hamburgerBtn.addEventListener('click', openSidebar);
        sidebarCloseBtn.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Função para carregar o menu de navegação dinamicamente
    async function loadMainMenu() {
        const navContainer = document.getElementById('main-nav');
        if (!navContainer) return;

        try {
            const response = await fetch('artigos.json');
            if (!response.ok) throw new Error('Arquivo de navegação "artigos.json" não encontrado.');
            
            const articles = await response.json();
            
            navContainer.innerHTML = articles.map(article => {
                if (!article?.pagina || !article?.titulo) {
                    console.warn("Artigo inválido no JSON:", article);
                    return '';
                }

                const linkHref = article.pagina.endsWith('.html') 
                    ? article.pagina 
                    : `documento.html?pagina=${article.pagina}`;

                return `
                    <a href="${linkHref}" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--secondary-color)] hover:text-[var(--text-primary)]">
                        <span class="material-symbols-outlined">${article.icone || 'article'}</span>
                        <span>${article.titulo}</span>
                    </a>
                `;
            }).join('');
            
            highlightActiveNavLink();

        } catch (error) {
            console.error("Erro ao carregar o menu de navegação:", error);
            navContainer.innerHTML = '<p class="text-red-500 px-3">Erro ao carregar menu.</p>';
        }
    }

    // Função para destacar o link ativo na navegação
    function highlightActiveNavLink() {
        const currentUrl = new URL(window.location.href);

        const currentPage = currentUrl.searchParams.get('pagina') 
            || currentUrl.pathname.split('/').pop(); // pega o arquivo atual (ex: "sobre.html")

        const navLinks = document.querySelectorAll('#main-nav a');

        navLinks.forEach(link => {
            const linkUrl = new URL(link.href, window.location.origin);

            const linkPage = linkUrl.searchParams.get('pagina') 
                || linkUrl.pathname.split('/').pop();

            if (linkPage === currentPage) {
                link.classList.add('active-nav-link');
                link.setAttribute('aria-current', 'page'); // acessibilidade
            }
        });
    }

    // Função para carregar conteúdo da página inicial
    async function loadHomePageContent() {
        if (!document.getElementById('hero-titulo')) return; 

        try {
            const response = await fetch('conteudo-index.json');
            if (!response.ok) throw new Error('Arquivo "conteudo-index.json" não encontrado.');
            const data = await response.json();
            
            document.getElementById('hero-titulo').textContent = data.hero_titulo;
            document.getElementById('hero-subtitulo').textContent = data.hero_subtitulo;
            
            const cardsContainer = document.getElementById('cards-container');
            if (cardsContainer && data.cards) {
                cardsContainer.innerHTML = data.cards.map(card => `
                    <a href="${card.link}" class="card p-6">
                        <div class="mb-4 flex items-center gap-4">
                            <div class="icon-gradient-${card.cor} flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                                <span class="material-symbols-outlined">${card.icone}</span>
                            </div>
                            <h4 class="flex-1 text-lg font-semibold text-gray-900">${card.titulo}</h4>
                        </div>
                        <p class="mb-4 text-sm text-gray-600">${card.descricao}</p>
                    </a>
                `).join('');
            }

            const novidadesContainer = document.getElementById('novidades-container');
            if (novidadesContainer && data.novidades) {
                novidadesContainer.innerHTML = data.novidades.map(item => `
                    <a href="${item.link}" class="news-item">
                        <p class="date">${item.data}</p>
                        <h4 class="title">${item.titulo}</h4>
                        <p class="description">${item.descricao}</p>
                    </a>
                `).join('');
            }

        } catch (error) {
            console.error("Erro ao carregar conteúdo da página inicial:", error);
            if(document.getElementById('hero-titulo')) {
                document.getElementById('hero-titulo').textContent = "Erro ao carregar conteúdo";
            }
        }
    }

    // --- INICIALIZAÇÃO DE TODAS AS FUNÇÕES ---
    initializeThemeControls();
    initializeSidebar();
    loadMainMenu();
    loadHomePageContent(); // Irá rodar apenas onde for relevante

    console.log("Script principal (main.js) v4.2.0 carregado com sucesso.");
});
