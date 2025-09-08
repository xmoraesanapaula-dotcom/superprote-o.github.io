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
        handleVisualError(errorMessage);
        console.error(errorMessage, error);
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
                if (commandHistory[commandHistory.length - 1] !== command) {
                    commandHistory.push(command);
                }
                historyIndex = commandHistory.length;
                
                createLogMessage('command', 'chevron_right', [command]);
                try {
                    const result = (new Function(`return ${command}`))();
                    if (result !== undefined) {
                        const resultLine = document.createElement('div');
                        resultLine.className = 'console-line return';
                        let resultString = '';
                        if (typeof result === 'object' && result !== null) {
                            resultString = JSON.stringify(result, null, 2);
                        } else {
                            resultString = String(result);
                        }
                        resultLine.innerHTML = `<span class="material-symbols-outlined console-return-icon">subdirectory_arrow_left</span> <div>${resultString.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;
                        if (consoleOutput) consoleOutput.appendChild(resultLine);
                    }
                } catch (error) {
                    console.error(error.name + ':', error.message);
                }
                e.target.value = '';
                if (consoleOutput) consoleOutput.scrollTop = consoleOutput.scrollHeight;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    e.target.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    e.target.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    e.target.value = '';
                }
            }
        });
    }

    // --- MÓDULO 2: INSPETOR DE ELEMENTOS ---
    function buildDomTree(element, parentElement, depth = 0) {
        if (!element || !parentElement || element.id === 'dev-tools-panel' || element.id === 'dev-tools-trigger' || element.tagName === 'SCRIPT' || element.tagName === 'LINK') return;

        const node = document.createElement('div');
        node.className = 'dom-node';
        node.style.paddingLeft = `${depth * 20}px`;

        let attributes = '';
        if (element.attributes) {
            for (const attr of element.attributes) {
                attributes += ` <span class="dom-attribute-name">${attr.name}</span>="<span class="dom-attribute-value">${attr.value}</span>"`;
            }
        }

        node.innerHTML = `&lt;<span class="dom-tag">${element.tagName.toLowerCase()}</span>${attributes}&gt;`;
        parentElement.appendChild(node);
        
        let originalOutline = '';
        node.addEventListener('mouseover', (e) => {
            e.stopPropagation();
            originalOutline = element.style.outline;
            element.style.outline = '2px solid #60a5fa';
        });
        node.addEventListener('mouseout', (e) => {
            e.stopPropagation();
            element.style.outline = originalOutline;
        });

        element.childNodes.forEach(child => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                buildDomTree(child, parentElement, depth + 1);
            }
        });
    }
    if (domTreeOutput) buildDomTree(document.documentElement, domTreeOutput);
    
    if (elementsSearchInput) {
        elementsSearchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.trim().toLowerCase();
            const allNodes = domTreeOutput.querySelectorAll('.dom-node');
            
            allNodes.forEach(node => {
                let isVisible = false;
                if (!searchTerm) { isVisible = true; }
                else if (searchTerm.startsWith('#')) { /* ...código sem alteração... */ }
                else if (searchTerm.startsWith('.')) { /* ...código sem alteração... */ }
                else { const tag = node.querySelector('.dom-tag'); if (tag && tag.textContent.toLowerCase().includes(searchTerm)) { isVisible = true; } }
                node.style.display = isVisible ? 'block' : 'none';
            });
        });
    }

    // --- MÓDULO 3: MÉTRICAS DE DESEMPENHO ---
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!performanceContent || !window.performance || !window.performance.getEntriesByType) return;
            const perf = window.performance;
            const resources = perf.getEntriesByType('resource');
            const navTiming = perf.getEntriesByType("navigation")[0];
            if (!navTiming) return;
            let content = `<table class="info-table">`;
            content += `<tr><td>Tempo total de carregamento:</td><td>${navTiming.duration.toFixed(2)} ms</td></tr>`;
            content += `<tr><td>Recursos carregados:</td><td>${resources.length}</td></tr>`;
            content += `</table><h4 class="mt-4 font-bold">Recursos:</h4><table class="info-table">`;
            resources.forEach(res => {
                const resourceName = res.name.split('/').pop();
                if (resourceName) {
                     content += `<tr><td>${resourceName}</td><td>${res.duration.toFixed(2)} ms</td></tr>`;
                }
            });
            content += '</table>';
            performanceContent.innerHTML = content;
        }, 500);
    });
    
    // --- MÓDULO 4: STORAGE ---
    function populateStorageTab() {
        if (!storageContent) return;
        storageContent.innerHTML = ''; 
        const createStorageTable = (title, storage) => { /* ...código sem alteração... */ };
        storageContent.innerHTML += createStorageTable('Local Storage', window.localStorage);
        storageContent.innerHTML += createStorageTable('Session Storage', window.sessionStorage);
    }
    
    if (storageContent) {
        storageContent.addEventListener('click', (e) => { /* ...código sem alteração... */ });
    }

    // --- MÓDULO 5: INFORMAÇÕES DA PÁGINA ---
    function populateInfoTab() {
        if (!infoContent) return;
        const info = { /* ...código sem alteração... */ };
        let content = `<table class="info-table">`;
        for (const [key, value] of Object.entries(info)) { content += `<tr><td>${key}:</td><td>${value}</td></tr>`; }
        content += '</table>';
        infoContent.innerHTML = content;
    }
    
    // --- MÓDULO 6: NETWORK INTERCEPTOR ---
    function initializeNetworkInterceptor() {
        if (!networkContent) return;
        /* ...código sem alteração... */
    }

    // --- MÓDULO 7: TESTES AUTOMATIZADOS ---

    // Função auxiliar para adicionar linhas de resultado na aba de Testes
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

    // Teste 1: Verifica se todas as imagens possuem o atributo 'alt'
    function testAcessibilidadeImagens() {
        addTestResult("Executando: Teste de Acessibilidade (Imagens)...");
        const imagensSemAlt = document.querySelectorAll('img:not([alt])');
        
        if (imagensSemAlt.length === 0) {
            addTestResult("PASSOU: Todas as imagens possuem o atributo 'alt'.", "success");
        } else {
            addTestResult(`AVISO: Encontrada(s) ${imagensSemAlt.length} imagem(ns) sem o atributo 'alt'.`, "warn");
            imagensSemAlt.forEach(img => {
                const imgSrc = img.src || 'Fonte da imagem não encontrada';
                addTestResult(`&nbsp;&nbsp;&nbsp;- <code>${imgSrc.length > 80 ? '...' + imgSrc.slice(-77) : imgSrc}</code>`, "warn");
            });
        }
    }

    // Teste 2: Verifica links internos quebrados
    async function testLinksQuebrados() {
        addTestResult("Executando: Teste de Links Quebrados...");
        const links = document.querySelectorAll('a[href*=".html"]');
        let brokenLinks = 0;

        const promises = Array.from(links).map(async (link) => {
            const url = link.href;
            if (new URL(url).origin !== window.location.origin) { return; }
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    brokenLinks++;
                    addTestResult(`FALHOU: Link quebrado para <code>${link.getAttribute('href')}</code> (Status: ${response.status})`, "error");
                }
            } catch (error) {
                brokenLinks++;
                addTestResult(`FALHOU: Link quebrado para <code>${link.getAttribute('href')}</code> (Erro de rede)`, "error");
            }
        });
        await Promise.all(promises);

        if (brokenLinks === 0) {
            addTestResult("PASSOU: Nenhum link interno quebrado foi encontrado.", "success");
        }
    }

    // NOVO: Teste 3: Verifica botões sem texto ou 'aria-label'
    function testAcessibilidadeBotoes() {
        addTestResult("Executando: Teste de Acessibilidade (Botões)...");
        const botoes = document.querySelectorAll('button');
        let badButtons = [];

        botoes.forEach(btn => {
            // Ignora botões que estão dentro do próprio painel de diagnóstico
            if (btn.closest('#dev-tools-panel')) {
                return;
            }

            const hasAriaLabel = btn.hasAttribute('aria-label') || btn.hasAttribute('aria-labelledby');
            const hasText = btn.textContent.trim() !== '';

            if (!hasAriaLabel && !hasText) {
                badButtons.push(btn);
            }
        });

        if (badButtons.length === 0) {
            addTestResult("PASSOU: Todos os botões têm um nome acessível.", "success");
        } else {
            addTestResult(`AVISO: Encontrado(s) ${badButtons.length} botão(ões) sem texto ou aria-label.`, "warn");
            badButtons.forEach(btn => {
                addTestResult(`&nbsp;&nbsp;&nbsp;- Botão: <code>${btn.outerHTML.split('>')[0]}></code>`, "warn");
            });
        }
    }

    // Função principal que executa todos os testes em sequência
    async function runAllTests() {
        if (!testsOutput) return;
        testsOutput.innerHTML = ''; 

        addTestResult("Iniciando verificação do site...");
        
        // Execute todos os módulos de teste aqui
        testAcessibilidadeImagens();
        testAcessibilidadeBotoes(); // Teste síncrono, não precisa de await
        await testLinksQuebrados(); // 'await' garante que este teste termine antes da mensagem final

        addTestResult("Verificação concluída.", "success");
    }

    if (runTestsButton) {
        runTestsButton.addEventListener('click', runAllTests);
    }

    // --- INICIALIZAÇÃO FINAL ---
    populateInfoTab();
    console.info("Painel de Diagnóstico v1.6.3 inicializado.");
});
