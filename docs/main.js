// ARQUIVO: main.js
// RESPONSABILIDADE: Controlar a lógica e interações da página principal.

document.addEventListener('DOMContentLoaded', () => {
    
    const versionInfo = document.getElementById('version-info');
    if (versionInfo) {
        versionInfo.textContent = 'v1.2';
    }

    console.log("Script principal (main.js) carregado com sucesso.");

    // No futuro, a lógica para animações de cards, formulários, etc., viria aqui.
});
