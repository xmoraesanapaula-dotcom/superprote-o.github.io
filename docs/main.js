// ARQUIVO: main.js
// RESPONSABILIDADE: Controlar a lógica e interações globais.
// VERSÃO: 3.0.5

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

    // --- LÓGICA DA SIDEBAR RESPONSIVA (3.0.0) ---
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebar && hamburgerBtn && sidebarCloseBtn && sidebarOverlay) {
        const openSidebar = () => {
            document.body.classList.add('sidebar-open');
        };

        const closeSidebar = () => {
            document.body.classList.remove('sidebar-open');
        };

        hamburgerBtn.addEventListener('click', openSidebar);
        sidebarCloseBtn.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // --- LÓGICA DE NAVEGAÇÃO ATIVA ---
    const currentPage = window.location.search;
    const navLinks = document.querySelectorAll('#main-nav a');
    navLinks.forEach(link => {
        if (link.href.includes(currentPage)) {
            link.classList.add('active-nav-link');
        }
    });

    // --- NOVO: LÓGICA PARA CARREGAR CONTEÚDO DA PÁGINA INICIAL ---
    
    // Função para analisar o texto com Front Matter (formato simples)
    function parseIndexContent(text) {
        const frontMatterRegex = /---([\s\S]*?)---/;
        const match = frontMatterRegex.exec(text);
        if (!match) return null;

        const data = {};
        const lines = match[1].split('\n');
        let currentList = null;
        let currentObject = null;

        lines.forEach(line => {
            if (line.trim() === '') return;
            const indent = line.search(/\S/);

            if (indent === 0) { // Propriedade de nível superior
                const [key, value] = line.split(':');
                if (value.trim() === '') {
                    data[key.trim()] = [];
                    currentList = data[key.trim()];
                } else {
                    data[key.trim()] = value.trim().replace(/"/g, '');
                }
            } else if (line.trim().startsWith('-')) { // Item de uma lista
                currentObject = {};
                currentList.push(currentObject);
            } else if (currentObject) { // Propriedade de um item da lista
                const [key, value] = line.trim().split(':');
                currentObject[key.trim()] = value.trim().replace(/"/g, '');
            }
        });
        return data;
    }

    async function loadHomePageContent() {
        // Esta função só executa se encontrar os elementos da página inicial
        const heroTitulo = document.getElementById('hero-titulo');
        const cardsContainer = document.getElementById('cards-container');
        if (!heroTitulo || !cardsContainer) return;

        try {
            const response = await fetch('conteudo-index.md');
            if (!response.ok) throw new Error('Arquivo de conteúdo não encontrado.');
            
            const text = await response.text();
            const data = parseIndexContent(text);

            if (!data) throw new Error('Erro ao ler o conteúdo do arquivo.');

            // Preenche o Título e Subtítulo
            heroTitulo.textContent = data.hero_titulo;
            document.getElementById('hero-subtitulo').textContent = data.hero_subtitulo;

            // Cria os Cards
            let cardsHTML = '';
            data.cards.forEach(card => {
                cardsHTML += `
                    <a href="${card.link}" class="card p-6">
                        <div class="mb-4 flex items-center gap-4">
                            <div class="icon-gradient-${card.cor} flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                                <span class="material-symbols-outlined">${card.icone}</span>
                            </div>
                            <h4 class="flex-1 text-lg font-semibold text-gray-900">${card.titulo}</h4>
                        </div>
                        <p class="mb-4 text-sm text-gray-600">${card.descricao}</p>
                    </a>
                `;
            });
            cardsContainer.innerHTML = cardsHTML;

        } catch (error) {
            console.error("Erro ao carregar conteúdo da página inicial:", error);
            heroTitulo.textContent = "Erro ao carregar conteúdo";
        }
    }

    // Executa a nova função
    loadHomePageContent();

    console.log("Script principal (main.js) v3.0.5 carregado com sucesso.");
});
