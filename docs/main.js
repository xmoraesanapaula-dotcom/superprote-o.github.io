// ARQUIVO: main.js
// RESPONSABILIDADE: Controlar a lógica e interações da página principal e globais (como o tema).

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DA VERSÃO ---
    const versionInfo = document.getElementById('version-info');
    if (versionInfo) {
        versionInfo.textContent = 'v1.4.1';
    }

    // --- v1.4: LÓGICA DO MODO ESCURO (DARK MODE) ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle ? themeToggle.querySelector('.material-symbols-outlined') : null;

    // Função para aplicar o tema (claro ou escuro)
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark');
            if (themeIcon) themeIcon.textContent = 'light_mode'; // Mostra o ícone do sol
        } else {
            body.classList.remove('dark');
            if (themeIcon) themeIcon.textContent = 'dark_mode'; // Mostra o ícone da lua
        }
    };

    // Verifica se há um tema salvo no localStorage ao carregar a página
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }

    // Adiciona o evento de clique ao botão de toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Verifica se o corpo JÁ TEM a classe 'dark'
            const isDarkMode = body.classList.contains('dark');
            
            if (isDarkMode) {
                // Se sim, remove e salva a preferência 'light'
                applyTheme('light');
                localStorage.setItem('theme', 'light');
                console.log("Tema alterado para: Claro");
            } else {
                // Se não, adiciona e salva a preferência 'dark'
                applyTheme('dark');
                localStorage.setItem('theme', 'dark');
                console.log("Tema alterado para: Escuro");
            }
        });
    }

    console.log("Script principal (main.js) v1.4.1 carregado com sucesso.");

    // No futuro, a lógica para animações de cards, formulários, etc., viria aqui.
});
