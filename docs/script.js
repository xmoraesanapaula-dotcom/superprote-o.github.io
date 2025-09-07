// CÓDIGO JAVASCRIPT COMPLETO E CORRIGIDO
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
    const versionInfo = document.getElementById('version-info');
    const statusIndicator = document.getElementById('status-indicator');
    const errorToast = document.getElementById('error-toast');

    // --- INICIALIZAÇÃO E CONTROLES DO PAINEL ---
    if (versionInfo) versionInfo.textContent = 'Nascemos como a versão 1.0';
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
        if (args.length > 0) handleVisualError(args[0]);
    };
    console.info = function(...args) {
        originalConsole.info.apply(console, args);
        createLogMessage('info', 'info', args);
    };
    
    if(consoleClearBtn) consoleClearBtn.addEventListener('click', () => {
        if(consoleOutput) consoleOutput.innerHTML = '';
        console.info("Console limpo.");
    });
    
    console.info("Painel de Diagnóstico e Alertas Visuais inicializados.");

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

    // --- MÓDULO 3: MÉTRICAS DE DESEMPENHO ---
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!performanceContent || !window.performance) return;
            const perf = window.performance;
            const resources = perf.getEntriesByType('resource');
            const navTiming = perf.getEntriesByType("navigation")[0];
            
            let content = `<table class="info-table">`;
            content += `<tr><td>Tempo total de carregamento:</td><td>${navTiming.duration.toFixed(2)} ms</td></tr>`;
            content += `<tr><td>Recursos carregados:</td><td>${resources.length}</td></tr>`;
            content += `</table><h4 class="mt-4 font-bold">Recursos:</h4><table class="info-table">`;
            resources.forEach(res => {
                content += `<tr><td>${res.name.split('/').pop()}</td><td>${res.duration.toFixed(2)} ms</td></tr>`;
            });
            content += '</table>';
            performanceContent.innerHTML = content;
        }, 500);
    });
    
    // --- MÓDULO 4: INFORMAÇÕES DA PÁGINA ---
    function populateInfoTab() {
        if (!infoContent) return;
        const info = {
            'URL': window.location.href,
            'Navegador (User Agent)': navigator.userAgent,
            'Resolução da Tela': `${window.screen.width}x${window.screen.height}`,
            'Versão do Projeto': '1.0',
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
