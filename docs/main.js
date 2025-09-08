// ARQUIVO: main.js
// RESPONSABILIDADE: Controlar a lógica e interações globais.

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

    // --- ATUALIZADO: LÓGICA DA SIDEBAR RESPONSIVA (MEGA ATUALIZAÇÃO 3.0.0) ---
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
    // Destaca o link na navegação principal que corresponde à página atual.
    const currentPage = window.location.search; // Ex: "?pagina=introducao"
    const navLinks = document.querySelectorAll('#main-nav a');

    navLinks.forEach(link => {
        if (link.href.includes(currentPage)) {
            link.classList.add('active-nav-link');
        }
    });

    console.log("Script principal (main.js) v3.0.0 carregado com sucesso.");
});
