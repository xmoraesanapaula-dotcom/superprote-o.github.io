document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO PAINEL ---
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

    // --- LÓGICA DE ABERTURA/FECHAMENTO E ABAS ---
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

    // --- MÓDULO 1: CONSOLE EMBUTIDO ---
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
    };

    function createLogMessage(type, icon, args) {
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        
        let message = `<span class="material-symbols-outlined console-icon">${icon}</span> <div>`;
        args.forEach(arg => {
            if (typeof arg === 'object' && arg !== null) {
                message += JSON.stringify(arg, null, 2);
            } else {
                message += arg;
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
    };
    console.info = function(...args) {
        originalConsole.info.apply(console, args);
        createLogMessage('info', 'info', args);
    };

    consoleClearBtn.addEventListener('click', () => {
        consoleOutput.innerHTML = '';
        console.info("Console limpo.");
    });
    
    console.info("Painel de Diagnóstico inicializado.");

    // --- MÓDULO 2: INSPETOR DE ELEMENTOS ---
    function buildDomTree(element, parentElement, depth = 0) {
        if (element.id === 'dev-tools-panel' || element.id === 'dev-tools-trigger') return;

        const node = document.createElement('div');
        node.className = 'dom-node';
        node.style.paddingLeft = `${depth * 20}px`;

        let attributes = '';
        for (const attr of element.attributes) {
            attributes += ` <span class="dom-attribute-name">${attr.name}</span>="<span class="dom-attribute-value">${attr.value}</span>"`;
        }

        node.innerHTML = `&lt;<span class="dom-tag">${element.tagName.toLowerCase()}</span>${attributes}&gt;`;
        parentElement.appendChild(node);
        
        // Destaque na página ao passar o mouse
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
    buildDomTree(document.documentElement, domTreeOutput);

    // --- MÓDULO 3: MÉTRICAS DE DESEMPENHO ---
    window.addEventListener('load', () => {
        setTimeout(() => { // Espera um pouco para capturar todas as métricas
            const perf = window.performance;
            const resources = perf.getEntriesByType('resource');
            let content = `<table class="info-table">`;
            content += `<tr><td>Tempo total de carregamento:</td><td>${(perf.timing.loadEventEnd - perf.timing.navigationStart).toFixed(2)} ms</td></tr>`;
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
