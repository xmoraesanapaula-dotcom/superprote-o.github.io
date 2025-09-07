document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO DOM ---
    const trigger = document.getElementById('dev-tools-trigger');
    const panel = document.getElementById('dev-tools-panel');
    const closeButton = document.getElementById('dev-tools-close');
    const tabs = document.querySelectorAll('.tab-button');
    const contentAreas = document.querySelectorAll('.tab-content');
    const consoleOutput = document.getElementById('console-output');
    const consoleClearBtn = document.getElementById('console-clear-button');
    const domTreeOutput = document.getElementById('dom-tree-output');
    const performanceContent = document.getElementById('performance-tab-content');
    const infoContent = document.getElementById('info-tab-content');

    // ADICIONADO DE VOLTA: Elementos para status e notificação
    const versionInfo = document.getElementById('version-info');
    const statusIndicator = document.getElementById('status-indicator');
    const errorToast = document.getElementById('error-toast');

    // --- INICIALIZAÇÃO E CONTROLES DO PAINEL ---
    versionInfo.textContent = 'Nascemos como a versão 1.0';
    statusIndicator.classList.add('ok');
    statusIndicator.title = 'Todos os scripts foram carregados com sucesso.';

    trigger.addEventListener('click', () => panel.classList.remove('hidden'));
    closeButton.addEventListener('click', () => panel.classList.add('hidden'));

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contentAreas.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab-content`).classList.add('active');
        });
    });

    // --- FUNÇÃO AUXILIAR PARA LIDAR COM ERROS VISUAIS ---
    function handleVisualError(message) {
        // 1. Mostrar a notificação pop-up
        if (errorToast) {
            errorToast.textContent = message;
            errorToast.classList.add('show');
            setTimeout(() => errorToast.classList.remove('show'), 5000);
        }
        // 2. Atualizar o indicador de status para vermelho
        if (statusIndicator) {
            statusIndicator.classList.remove('ok');
            statusIndicator.classList.add('error');
            statusIndicator.title = `Erro no script! Veja o console (F12) ou o painel para detalhes.`;
        }
    }

    // --- MÓDULO 1: MONITOR GLOBAL E CONSOLE EMBUTIDO ---
    // Monitora erros não capturados em todo o site
    window.onerror = function(message, source, lineno, colno, error) {
        const errorMessage = `${message} em ${source.split('/').pop()}:${lineno}`;
        handleVisualError(errorMessage); // Ativa os alertas visuais
        console.error(errorMessage, error); // Envia para o nosso console customizado
        return true; // Impede o log padrão do navegador
    };

    const originalConsole = { log: console.log, warn: console.warn, error: console.error, info: console.info };

    function createLogMessage(type, icon, args) {
        /* ... (código do createLogMessage continua o mesmo) ... */
    }

    // Intercepta as chamadas do console para exibi-las no painel
    console.log = function(...args) { /* ... */ };
    console.warn = function(...args) { /* ... */ };
    console.error = function(...args) {
        originalConsole.error.apply(console, args);
        createLogMessage('error', 'error', args);
        // Se um erro for logado manualmente, também ativa os alertas
        handleVisualError(args[0]); 
    };
    console.info = function(...args) { /* ... */ };

    consoleClearBtn.addEventListener('click', () => { /* ... */ });
    
    console.info("Painel de Diagnóstico e Alertas Visuais inicializados.");

    // --- MÓDULO 2: INSPETOR DE ELEMENTOS ---
    // ... (toda a lógica do inspetor de elementos continua aqui, sem alterações) ...
    function buildDomTree(element, parentElement, depth = 0) { /* ... */ }
    buildDomTree(document.documentElement, domTreeOutput);

    // --- MÓDULO 3: MÉTRICAS DE DESEMPENHO ---
    // ... (toda a lógica de desempenho continua aqui, sem alterações) ...
    window.addEventListener('load', () => { /* ... */ });
    
    // --- MÓDULO 4: INFORMAÇÕES DA PÁGINA ---
    // ... (toda a lógica de informações da página continua aqui, sem alterações) ...
    function populateInfoTab() { /* ... */ }
    populateInfoTab();

    // Para testar, remova o comentário da linha abaixo para simular um erro.
    // testeDeErroProposital();
});
