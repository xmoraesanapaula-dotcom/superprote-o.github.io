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
    let capturedErrors = []; // Array para armazenar erros

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
        capturedErrors.push(errorMessage); // Captura o erro
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

                if (!searchTerm) {
                    isVisible = true;
                } else if (searchTerm.startsWith('#')) {
                    const idToFind = searchTerm.substring(1);
                    node.querySelectorAll('.dom-attribute-name').forEach(attrName => {
                        if (attrName.textContent === 'id') {
                            const attrValue = attrName.nextElementSibling;
                            if (attrValue && attrValue.textContent === idToFind) {
                                isVisible = true;
                            }
                        }
                    });
                } else if (searchTerm.startsWith('.')) {
                    const classToFind = searchTerm.substring(1);
                    node.querySelectorAll('.dom-attribute-name').forEach(attrName => {
                        if (attrName.textContent === 'class') {
                            const attrValue = attrName.nextElementSibling;
                            if (attrValue) {
                                const classes = attrValue.textContent.split(' ');
                                if (classes.includes(classToFind)) {
                                    isVisible = true;
                                }
                            }
                        }
                    });
                } else {
                    const tag = node.querySelector('.dom-tag');
                    if (tag && tag.textContent.toLowerCase().includes(searchTerm)) {
                        isVisible = true;
                    }
                }
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

        const createStorageTable = (title, storage) => {
            let tableHTML = `<div class="storage-section"><h3 class="storage-title">${title}</h3>`;
            if (storage.length === 0) {
                tableHTML += `<p>Nenhum dado encontrado.</p></div>`;
                return tableHTML;
            }

            tableHTML += `<table class="storage-table"><thead><tr><th>Chave (Key)</th><th>Valor (Value)</th><th>Ações</th></tr></thead><tbody>`;
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                const value = storage.getItem(key);
                tableHTML += `
                    <tr>
                        <td class="key">${key}</td>
                        <td class="value">${value}</td>
                        <td class="actions">
                            <button class="storage-action-btn edit-btn" data-storage-type="${title}" data-key="${key}" title="Editar Valor">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                            <button class="storage-action-btn delete-btn" data-storage-type="${title}" data-key="${key}" title="Excluir Chave">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </td>
                    </tr>`;
            }
            tableHTML += `</tbody></table></div>`;
            return tableHTML;
        };

        storageContent.innerHTML += createStorageTable('Local Storage', window.localStorage);
        storageContent.innerHTML += createStorageTable('Session Storage', window.sessionStorage);
    }
    
    if (storageContent) {
        storageContent.addEventListener('click', (e) => {
            const target = e.target.closest('.storage-action-btn');
            if (!target) return;

            const storageType = target.dataset.storageType;
            const key = target.dataset.key;
            const storage = storageType === 'Local Storage' ? window.localStorage : window.sessionStorage;

            if (target.classList.contains('delete-btn')) {
                if (confirm(`Tem certeza que deseja excluir a chave "${key}" do ${storageType}?`)) {
                    storage.removeItem(key);
                    populateStorageTab();
                    console.info(`Chave "${key}" removida do ${storageType}.`);
                }
            }

            if (target.classList.contains('edit-btn')) {
                const currentValue = storage.getItem(key);
                const newValue = prompt(`Digite o novo valor para a chave "${key}":`, currentValue);
                
                if (newValue !== null && newValue !== currentValue) {
                    storage.setItem(key, newValue);
                    populateStorageTab();
                    console.info(`Chave "${key}" atualizada no ${storageType}.`);
                }
            }
        });
    }

    // --- MÓDULO 5: INFORMAÇÕES DA PÁGINA ---
    function populateInfoTab() {
        if (!infoContent) return;
        const info = {
            'URL': window.location.href,
            'Navegador (User Agent)': navigator.userAgent,
            'Resolução da Tela': `${window.screen.width}x${window.screen.height}`,
            'Versão do Projeto': '3.0.1',
            'Linguagem': navigator.language
        };
        let content = `<table class="info-table">`;
        for (const [key, value] of Object.entries(info)) {
            content += `<tr><td>${key}:</td><td>${value}</td></tr>`;
        }
        content += '</table>';
        infoContent.innerHTML = content;
    }
    
    // --- MÓDULO 6: NETWORK INTERCEPTOR ---
    function initializeNetworkInterceptor() {
        if (!networkContent) return;
        let networkRequests = [];

        networkContent.innerHTML = `
            <table class="network-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Status</th>
                        <th>Método</th>
                        <th>Tempo</th>
                    </tr>
                </thead>
                <tbody id="network-log-body"></tbody>
            </table>
        `;

        const networkLogBody = document.getElementById('network-log-body');
        const originalFetch = window.fetch;

        window.fetch = function(...args) {
            const startTime = performance.now();
            const url = args[0] instanceof Request ? args[0].url : args[0];
            const method = args[0] instanceof Request ? args[0].method : (args[1]?.method || 'GET');
            const shortUrl = url.split('/').pop().split('?')[0] || url;

            const requestIndex = networkRequests.length;
            const requestData = { url, method, response: null, duration: null };
            networkRequests.push(requestData);

            const row = document.createElement('tr');
            row.dataset.requestIndex = requestIndex;
            row.classList.add('network-row');
            row.innerHTML = `
                <td class="url">${shortUrl}</td>
                <td class="status-pending">pendente...</td>
                <td>${method}</td>
                <td class="time">...</td>
            `;
            if (networkLogBody) networkLogBody.prepend(row);

            const fetchPromise = originalFetch.apply(this, args);
            fetchPromise.then(response => {
                const resClone = response.clone();
                requestData.response = resClone;
                const duration = (performance.now() - startTime).toFixed(0);
                requestData.duration = duration;

                const statusCell = row.querySelector('td:nth-child(2)');
                if (statusCell) {
                    statusCell.textContent = `${resClone.status} ${resClone.statusText}`;
                    statusCell.className = resClone.ok ? 'status-ok' : 'status-error';
                }
                const timeCell = row.querySelector('.time');
                if (timeCell) timeCell.textContent = `${duration} ms`;

            }).catch(error => {
                const duration = (performance.now() - startTime).toFixed(0);
                requestData.duration = duration;
                
                const statusCell = row.querySelector('td:nth-child(2)');
                if (statusCell) {
                    statusCell.textContent = 'Falhou';
                    statusCell.className = 'status-error';
                }
                const timeCell = row.querySelector('.time');
                if (timeCell) timeCell.textContent = `${duration} ms`;
                
                console.error("Erro de rede interceptado:", error);
            });

            return fetchPromise;
        };

        if (networkLogBody) {
            networkLogBody.addEventListener('click', (e) => {
                const row = e.target.closest('.network-row');
                if (!row) return;

                const existingDetailsRow = row.nextElementSibling;
                if (existingDetailsRow && existingDetailsRow.classList.contains('network-details-row')) {
                    existingDetailsRow.remove();
                    row.classList.remove('details-visible');
                    return;
                }

                document.querySelectorAll('.network-details-row').forEach(r => r.remove());
                document.querySelectorAll('.network-row.details-visible').forEach(r => r.classList.remove('details-visible'));

                const requestIndex = parseInt(row.dataset.requestIndex, 10);
                const requestData = networkRequests[requestIndex];

                if (!requestData || !requestData.response) return;

                const detailsRow = document.createElement('tr');
                detailsRow.className = 'network-details-row';

                let headersHTML = '';
                for (const [key, value] of requestData.response.headers.entries()) {
                    headersHTML += `<div><strong>${key}:</strong> ${value}</div>`;
                }

                detailsRow.innerHTML = `
                    <td colspan="4">
                        <div class="network-details-content">
                            <h4>Response Headers</h4>
                            <div class="headers-list">${headersHTML}</div>
                        </div>
                    </td>
                `;
                
                row.after(detailsRow);
                row.classList.add('details-visible');
            });
        }
    }

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

    function testAcessibilidadeBotoes() {
        addTestResult("Executando: Teste de Acessibilidade (Botões)...");
        const botoes = document.querySelectorAll('button');
        let badButtons = [];
        botoes.forEach(btn => {
            if (btn.closest('#dev-tools-panel')) { return; }
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

    async function testPerformanceImagens() {
        addTestResult("Executando: Teste de Performance (Imagens)...");
        const images = document.querySelectorAll('img');
        let oversizedImages = 0;
        const promises = Array.from(images).map(img => new Promise(resolve => {
            if (!img.src || img.src.startsWith('data:')) {
                resolve();
                return;
            }
            const tempImg = new Image();
            tempImg.onload = () => {
                const renderedWidth = img.clientWidth;
                const naturalWidth = tempImg.naturalWidth;
                if (naturalWidth > renderedWidth * 2 && renderedWidth > 0) {
                    oversizedImages++;
                    addTestResult(`AVISO: Imagem grande para a área exibida. (Exibida: ${renderedWidth}px, Original: ${naturalWidth}px)<br>&nbsp;&nbsp;&nbsp;- src: <code>${img.src}</code>`, "warn");
                }
                resolve();
            };
            tempImg.onerror = () => { resolve(); };
            tempImg.src = img.src;
        }));
        await Promise.all(promises);
        if (oversizedImages === 0) {
            addTestResult("PASSOU: Nenhuma imagem com dimensões desproporcionais foi encontrada.", "success");
        }
    }
    
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

    function testSeoBasico() {
        addTestResult("Executando: Teste de SEO Básico...");
        let issuesFound = 0;

        const titleElement = document.querySelector('title');
        if (!titleElement) {
            addTestResult("FALHOU: A página não possui uma tag <code>&lt;title&gt;</code>.", "error");
            issuesFound++;
        } else if (!titleElement.textContent.trim()) {
            addTestResult("AVISO: A tag <code>&lt;title&gt;</code> está vazia.", "warn");
            issuesFound++;
        }

        const metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            addTestResult("AVISO: A página não possui uma <code>&lt;meta name='description'&gt;</code>.", "warn");
            issuesFound++;
        } else if (!metaDescription.getAttribute('content')?.trim()) {
            addTestResult("AVISO: A <code>&lt;meta name='description'&gt;</code> está vazia.", "warn");
            issuesFound++;
        }

        if (issuesFound === 0) {
            addTestResult("PASSOU: As tags essenciais de SEO (title e description) estão presentes e preenchidas.", "success");
        }
    }

    async function runAllTests() {
        if (!testsOutput) return;
        testsOutput.innerHTML = ''; 

        addTestResult("Iniciando verificação do site...");
        
        testConsoleErros();
        testAcessibilidadeImagens();
        testAcessibilidadeBotoes();
        testSeoBasico();
        await testLinksQuebrados();
        await testPerformanceImagens();

        addTestResult("Verificação concluída.", "success");
    }

    if (runTestsButton) {
        runTestsButton.addEventListener('click', runAllTests);
    }

    // --- INICIALIZAÇÃO FINAL ---
    populateInfoTab();
    initializeNetworkInterceptor();
    console.info("Painel de Diagnóstico v3.0.1 inicializado.");
});
