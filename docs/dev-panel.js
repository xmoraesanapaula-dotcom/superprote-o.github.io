// ARQUIVO: dev-panel.js
// RESPONSABILIDADE: Controlar toda a lógica do Painel de Diagnóstico.

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
    const statusIndicator = document.getElementById('status-indicator');
    const errorToast = document.getElementById('error-toast');
    const consoleExportBtn = document.getElementById('console-export-button');
    const elementsSearchInput = document.getElementById('elements-search-input');
    const storageContent = document.getElementById('storage-tab-content');
    const consoleInput = document.getElementById('console-input');
    const networkContent = document.getElementById('network-tab-content');
    const runTestsButton = document.getElementById('run-tests-button');
    const testsOutput = document.getElementById('tests-output');

    const commandHistory = [];
    let historyIndex = 0;
    let capturedErrors = []; // NOVO: Array para armazenar erros

    if (!panel) return;

    // --- INICIALIZAÇÃO E CONTROLES DO PAINEL ---
    if (statusIndicator) {
        statusIndicator.classList.add('ok');
        statusIndicator.title = 'Todos os scripts foram carregados com sucesso.';
    }

    if(trigger) trigger.addEventListener('click', () => panel.classList.remove('hidden'));
    if(closeButton) closeButton.addEventListener('click', () => panel.classList.add('hidden'));

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contentAreas.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetContent = document.getElementById(`${tab.dataset.tab}-tab-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            if (tab.dataset.tab === 'storage') {
                populateStorageTab();
            }
        });
    });

    // --- FUNÇÃO AUXILIAR PARA LIDAR COM ERROS VISUAIS ---
    function handleVisualError(message) {
        if (errorToast) {
            errorToast.textContent = message;
            errorToast.classList.add('show');
            setTimeout(() => errorToast.classList.remove('show'), 5000);
        }
        if (statusIndicator) {
            statusIndicator.classList.remove('ok');
            statusIndicator.classList.add('error');
            statusIndicator.title = `Erro no script! Veja o console (F12) ou o painel para detalhes.`;
        }
    }

    // --- MÓDULO 1: MONITOR GLOBAL E CONSOLE EMBUTIDO ---
    window.onerror = function(message, source, lineno, colno, error) {
        const sourceFile = source ? source.split('/').pop() : 'script';
        const errorMessage = `${message} em ${sourceFile}:${lineno}`;
        capturedErrors.push(errorMessage); // ATUALIZADO: Captura o erro
        handleVisualError(errorMessage);
        console.error(errorMessage, error); // console.error agora é o nosso customizado
        return true; 
    };

    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
    };

    function createLogMessage(type, icon, args) {
        if (!consoleOutput) return;
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        
        let message = `<span class="material-symbols-outlined console-icon">${icon}</span> <div>`;
        args.forEach(arg => {
            if (arg instanceof Error) {
                const errorText = `${arg.name}: ${arg.message}\n${arg.stack || '(no stack trace)'}`;
                message += `<pre style="white-space: pre-wrap; margin: 0; font-family: inherit;">${errorText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
            } else if (typeof arg === 'object' && arg !== null) {
                message += JSON.stringify(arg, null, 2).replace(/</g, "&lt;").replace(/>/g, "&gt;");
            } else {
                message += String(arg).replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
            message += ' ';
        });
        message += '</div>';
        line.innerHTML = message;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    console.log = function(...args) {
        originalConsole.log.apply(console, args);
        createLogMessage('log', 'terminal', args);
    };
    console.warn = function(...args) {
        originalConsole.warn.apply(console, args);
        createLogMessage('warn', 'warning', args);
    };
    console.error = function(...args) {
        // ATUALIZADO: Captura o erro para o teste
        const errorString = args.map(a => a.toString()).join(' ');
        capturedErrors.push(errorString);
        
        originalConsole.error.apply(console, args);
        createLogMessage('error', 'error', args);
        if (args.length > 0) {
            const firstArg = args[0];
            handleVisualError(firstArg instanceof Error ? firstArg.message : String(firstArg));
        }
    };
    console.info = function(...args) {
        originalConsole.info.apply(console, args);
        createLogMessage('info', 'info', args);
    };
    
    if(consoleClearBtn) consoleClearBtn.addEventListener('click', () => {
        if(consoleOutput) consoleOutput.innerHTML = '';
        console.info("Console limpo.");
    });
    
    if (consoleInput) {
        consoleInput.addEventListener('keydown', (e) => {
            const command = e.target.value.trim();
            if (e.key === 'Enter' && command !== '') {
                // ...código do input sem alterações...
            }
        });
    }

    // --- MÓDULO 2: INSPETOR DE ELEMENTOS ---
    function buildDomTree(element, parentElement, depth = 0) {
        // ...código sem alterações...
    }
    if (domTreeOutput) buildDomTree(document.documentElement, domTreeOutput);
    if (elementsSearchInput) {
        elementsSearchInput.addEventListener('keyup', (e) => {
            // ...código sem alterações...
        });
    }

    // --- MÓDULOS 3, 4, 5, 6 ---
    // (Sem alterações)

    // --- MÓDULO 7: TESTES AUTOMATIZADOS ---

    function addTestResult(message, type = 'info') {
        if (!testsOutput) return;
        const line = document.createElement('div');
        line.className = `console-line ${type}`; 
        
        let icon = 'info';
        if (type === 'success') icon = 'check_circle';
        if (type === 'warn') icon = 'warning';
        if (type === 'error') icon = 'error';

        line.innerHTML = `<span class="material-symbols-outlined console-icon">${icon}</span> <div>${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;
        testsOutput.appendChild(line);
    }

    function testAcessibilidadeImagens() { /* ...código sem alterações... */ }
    async function testLinksQuebrados() { /* ...código sem alterações... */ }
    function testAcessibilidadeBotoes() { /* ...código sem alterações... */ }
    async function testPerformanceImagens() { /* ...código sem alterações... */ }
    
    // NOVO: Teste 5: Verifica se ocorreram erros de JavaScript
    function testConsoleErros() {
        addTestResult("Executando: Teste de Erros no Console...");
        if (capturedErrors.length === 0) {
            addTestResult("PASSOU: Nenhum erro de JavaScript foi detectado.", "success");
        } else {
            addTestResult(`FALHOU: Foram detectados ${capturedErrors.length} erro(s). Veja o console para detalhes.`, "error");
            capturedErrors.forEach(err => {
                const shortErr = err.length > 100 ? err.substring(0, 97) + '...' : err;
                addTestResult(`&nbsp;&nbsp;&nbsp;- <code>${shortErr}</code>`, "error");
            });
        }
    }

    // Função principal que executa todos os testes em sequência
    async function runAllTests() {
        if (!testsOutput) return;
        testsOutput.innerHTML = ''; 

        addTestResult("Iniciando verificação do site...");
        
        // Execute todos os módulos de teste aqui
        testConsoleErros();
        testAcessibilidadeImagens();
        testAcessibilidadeBotoes();
        await testLinksQuebrados();
        await testPerformanceImagens();

        addTestResult("Verificação concluída.", "success");
    }

    if (runTestsButton) {
        runTestsButton.addEventListener('click', runAllTests);
    }

    // --- INICIALIZAÇÃO FINAL ---
    function init() {
        // Funções que precisam rodar no início
        const infoContent = document.getElementById('info-tab-content');
        if (infoContent) populateInfoTab(infoContent);
    }
    init();
    console.info("Painel de Diagnóstico v3.0.1 inicializado.");
});
