// ARQUIVO: main.js
// RESPONSABILIDADE: Controlar a lógica e interações da página principal e globais (como o tema).

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DA VERSÃO ---
    const versionInfo = document.getElementById('version-info');
    if (versionInfo) {
        versionInfo.textContent = 'v1.6.1'; // Será atualizado para 1.6.2 no final
    }

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
        console.log(`Tema alterado para: ${newTheme === 'dark' ? 'Escuro' : 'Claro'}`);
        document.documentElement.offsetHeight;
        document.documentElement.classList.remove('no-transitions');
    };

    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    if (currentTheme === 'dark') {
        if (themeIcon) themeIcon.textContent = 'light_mode';
    } else {
        if (themeIcon) themeIcon.textContent = 'dark_mode';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            const newTheme = isDarkMode ? 'light' : 'dark';
            smoothThemeTransition(newTheme);
        });
    }

    // --- LÓGICA DA SIDEBAR RESPONSIVA (NOVO v1.6.2) ---
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    const openSidebar = () => {
        if (sidebar && sidebarOverlay) {
            document.body.classList.add('sidebar-open');
        }
    };

    const closeSidebar = () => {
        if (sidebar && sidebarOverlay) {
            document.body.classList.remove('sidebar-open');
        }
    };

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openSidebar);
    }
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', closeSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    console.log("Script principal (main.js) v1.6.1 carregado com sucesso."); // Será atualizado para 1.6.2
});
