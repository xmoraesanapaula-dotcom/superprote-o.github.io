// ARQUIVO: main.js
// RESPONSABILIDADE: Controlar a lógica e interações da página principal e globais (como o tema).

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DA VERSÃO ---
    const versionInfo = document.getElementById('version-info');
    if (versionInfo) {
        versionInfo.textContent = 'v1.5.3';
    }

    // --- LÓGICA DO MODO ESCURO (DARK MODE) - ATUALIZADO ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.material-symbols-outlined') : null;

    // Função para aplicar o tema (claro ou escuro)
    // Agora opera no <html> (documentElement) para consistência com o script de bloqueio
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (themeIcon) themeIcon.textContent = 'light_mode'; // Mostra o ícone do sol
        } else {
            document.documentElement.classList.remove('dark');
            if (themeIcon) themeIcon.textContent = 'dark_mode'; // Mostra o ícone da lua
        }
    };

    // A lógica de transição suave que implementamos anteriormente
    const smoothThemeTransition = (newTheme) => {
        document.documentElement.classList.add('no-transitions');
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        console.log(`Tema alterado para: ${newTheme === 'dark' ? 'Escuro' : 'Claro'}`);
        document.documentElement.offsetHeight;
        document.documentElement.classList.remove('no-transitions');
    };

    // Garante que o ícone do botão esteja correto no carregamento da página
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    if (currentTheme === 'dark') {
        if (themeIcon) themeIcon.textContent = 'light_mode';
    } else {
        if (themeIcon) themeIcon.textContent = 'dark_mode';
    }

    // Adiciona o evento de clique ao botão de toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            const newTheme = isDarkMode ? 'light' : 'dark';
            smoothThemeTransition(newTheme);
        });
    }

    console.log("Script principal (main.js) v1.5.3 carregado com sucesso.");
});
