// ARQUIVO: main.js
// RESPONSABILIDADE: Controlar a lógica e interações globais.
// VERSÃO: 4.0.0 (Com menu de navegação dinâmico)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DO MODO ESCURO (DARK MODE) ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.material-symbols-outlined') : null;

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (themeIcon) themeIcon.textContent = 'light_mode';
        } else {
            document.documentElement.classList.remove('dark');
            if (themeIcon) themeIcon.textContent = 'dark_mode';
        }
    };

    const smoothThemeTransition = (newTheme) => {
        document.documentElement.classList.add('no-transitions');
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.offsetHeight;
        document.documentElement.classList.remove('no-transitions');
    };

    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    applyTheme(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            smoothThemeTransition(newTheme);
        });
    }

    // --- LÓGICA DA SIDEBAR RESPONSIVA ---
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebar && hamburgerBtn && sidebarCloseBtn && sidebarOverlay) {
        const openSidebar = () => document.body.classList.add('sidebar-open');
        const closeSidebar = () => document.body.classList.remove('sidebar-open');

        hamburgerBtn.addEventListener('click', openSidebar);
        sidebarCloseBtn.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // --- NOVO: LÓGICA PARA CARREGAR O MENU DE NAVEGAÇÃO DINAMICAMENTE ---
    async function loadMainMenu() {
        const navContainer = document.getElementById('main-nav');
        if (!navContainer) return;

        try {
            const response = await fetch('artigos.json');
            if (!response.ok) throw new Error('Arquivo de navegação "artigos.json" não encontrado.');
            
            const articles = await response.json();
            
            let navHTML = '';
            articles.forEach(article => {
                navHTML += `
                    <a href="documento.html?pagina=${article.pagina}" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--secondary-color)] hover:text-[var(--text-primary)]">
                        <span class="material-symbols-outlined">${article.icone}</span>
                        <span>${article.titulo}</span>
                    </a>
                `;
            });
            
            navContainer.innerHTML = navHTML;
            
            // Reativa a lógica de navegação ativa após o menu ser carregado
            highlightActiveNavLink();

        } catch (error) {
            console.error("Erro ao carregar o menu de navegação:", error);
            navContainer.innerHTML = '<p class="text-red-500 px-3">Erro ao carregar menu.</p>';
        }
    }

    // --- LÓGICA DE NAVEGAÇÃO ATIVA (ATUALIZADA) ---
    function highlightActiveNavLink() {
        const currentPage = new URLSearchParams(window.location.search).get('pagina');
        const navLinks = document.querySelectorAll('#main-nav a');
        navLinks.forEach(link => {
            const linkPage = new URL(link.href).searchParams.get('pagina');
            if (linkPage === currentPage) {
                link.classList.add('active-nav-link');
            }
        });
    }

    // --- LÓGICA PARA CARREGAR CONTEÚDO DA PÁGINA INICIAL ---
    async function loadHomePageContent() {
        const heroTitulo = document.getElementById('hero-titulo');
        const cardsContainer = document.getElementById('cards-container');
        if (!heroTitulo || !cardsContainer) return; // Só executa na index.html

        try {
            const response = await fetch('conteudo-index.json');
            if (!response.ok) throw new Error('Arquivo "conteudo-index.json" não encontrado.');
            const data = await response.json();

            heroTitulo.textContent = data.hero_titulo;
            document.getElementById('hero-subtitulo').textContent = data.hero_subtitulo;

            if (data.cards) {
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
            if(heroTitulo) heroTitulo.textContent = "Erro ao carregar conteúdo";
        }
    }

    // Executa as funções de inicialização
    loadMainMenu();
    loadHomePageContent();

    console.log("Script principal (main.js) v4.0.0 carregado com sucesso.");
});
