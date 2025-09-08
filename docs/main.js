// ARQUIVO: main.js
// RESPONSABILIDADE: Controlar a lógica e interações da página principal e globais (como o tema).

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DA VERSÃO ---
    const versionInfo = document.getElementById('version-info');
    if (versionInfo) {
        versionInfo.textContent = 'v1.5.3';
    }

    // --- LÓGICA DO MODO ESCURO (DARK MODE) - ATUALIZADO v1.5.3 ---
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
    } else {
        // Garante que o tema claro seja aplicado se nada estiver salvo
        applyTheme('light');
    }

    // Adiciona o evento de clique ao botão de toggle com a lógica de transição suave
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDarkMode = body.classList.contains('dark');
            const newTheme = isDarkMode ? 'light' : 'dark';

            // 1. Adiciona classe para desativar transições
            document.documentElement.classList.add('no-transitions');

            // 2. Aplica o novo tema
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            console.log(`Tema alterado para: ${newTheme === 'dark' ? 'Escuro' : 'Claro'}`);

            // 3. Força o navegador a aplicar as mudanças (reflow)
            // A leitura de uma propriedade como offsetHeight é uma forma de garantir isso.
            document.documentElement.offsetHeight; 

            // 4. Remove a classe para reativar as transições
            document.documentElement.classList.remove('no-transitions');
        });
    }

    console.log("Script principal (main.js) v1.5.3 carregado com sucesso.");
});
