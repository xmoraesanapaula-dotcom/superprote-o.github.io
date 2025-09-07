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

    // v1.3: Variáveis para o Histórico de Comandos
    const commandHistory = [];
    let historyIndex = 0;

    // Se o painel não existir na página, este script não faz mais nada.
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
            if (typeof arg === 'object' && arg !== null) {
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
        if (args.length > 0) handleVisualError(String(args[0]));
    };
    console.info = function(...args) {
        originalConsole.info.apply(console, args);
        createLogMessage('info', 'info', args);
    };
    
    if(consoleClearBtn) consoleClearBtn.addEventListener('click', () => {
        if(consoleOutput) consoleOutput.innerHTML = '';
        console.info("Console limpo.");
    });
    
    if (consoleExportBtn) {
        consoleExportBtn.addEventListener('click', () => {
            if (!consoleOutput) return;
            let logText = `--- Log do Console - Super Proteção v1.3 ---\nGerado em: ${new Date().toLocaleString()}\n\n`;
            
            consoleOutput.querySelectorAll('.console-line').forEach(line => {
                const type = line.classList[1] ? `[${line.classList[1].toUpperCase()}]` : '[LOG]';
                logText += `${type} ${line.innerText}\n`;
            });

            const blob = new Blob([logText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `superprotecao-log-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.info("Log do console exportado com sucesso.");
        });
    }
    
    if (consoleInput) {
        consoleInput.addEventListener('keydown', (e) => {
            const command = e.target.value.trim();

            if (e.key === 'Enter' && command !== '') {
                // v1.3: Adiciona o comando ao histórico
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
                // v1.3: Navega para o comando anterior no histórico
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    e.target.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                // v1.3: Navega para o próximo comando no histórico
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    e.target.value = commandHistory[historyIndex];
                } else {
                    // Se chegar ao final do histórico, limpa o campo
                    historyIndex = commandHistory.length;
                    e.target.value = '';
                }
            }
        });
    }

    console.info("Painel de Diagnóstico v1.3 (com histórico) inicializado.");

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
            const searchTerm = e.target.value.toLowerCase();
            const allNodes = domTreeOutput.querySelectorAll('.dom-node');
            
            allNodes.forEach(node => {
                const tag = node.querySelector('.dom-tag');
                if (tag && tag.textContent.toLowerCase().includes(searchTerm)) {
                    node.style.display = 'block';
                } else {
                    node.style.display = 'none';
                }
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

        const createStorageTable = (title, storage) => {
            let tableHTML = `<div class="storage-section"><h3 class="storage-title">${title}</h3>`;
            if (storage.length === 0) {
                tableHTML += `<p>Nenhum dado encontrado.</p></div>`;
                return tableHTML;
            }

            tableHTML += `<table class="storage-table"><thead><tr><th>Chave (Key)</th><th>Valor (Value)</th></tr></thead><tbody>`;
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                const value = storage.getItem(key);
                tableHTML += `<tr><td class="key">${key}</td><td class="value">${value}</td></tr>`;
            }
            tableHTML += `</tbody></table></div>`;
            return tableHTML;
        };

        storageContent.innerHTML += createStorageTable('Local Storage', window.localStorage);
        storageContent.innerHTML += createStorageTable('Session Storage', window.sessionStorage);
    }
    
    // --- MÓDULO 5: INFORMAÇÕES DA PÁGINA ---
    function populateInfoTab() {
        if (!infoContent) return;
        const info = {
            'URL': window.location.href,
            'Navegador (User Agent)': navigator.userAgent,
            'Resolução da Tela': `${window.screen.width}x${window.screen.height}`,
            'Versão do Projeto': '1.3',
            'Linguagem': navigator.language
        };
        let content = `<table class="info-table">`;
        for (const [key, value] of Object.entries(info)) {
            content += `<tr><td>${key}:</td><td>${value}</td></tr>`;
        }
        content += '</table>';
        infoContent.innerHTML = content;
    }
    populateInfoTab();
});
