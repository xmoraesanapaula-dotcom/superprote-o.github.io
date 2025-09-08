// ARQUIVO: dev-panel.js
// RESPONSABILIDADE: Controlar toda a lógica do Painel de Diagnóstico.
// VERSÃO: 5.1.0 (Base 5.0.0 + módulos completos da 4.1.0)

(function(){
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO DOM ---
    const trigger = document.getElementById('dev-tools-trigger');
    const panel = document.getElementById('dev-tools-panel');
    const closeButton = document.getElementById('dev-tools-close');
    const tabs = document.querySelectorAll('.tab-button');
    const contentAreas = document.querySelectorAll('.tab-content');

    // Console
    const consoleOutput = document.getElementById('console-output');
    const consoleClearBtn = document.getElementById('console-clear-button');
    const consoleInput = document.getElementById('console-input');

    // Performance, Info, Status
    const performanceContent = document.getElementById('performance-tab-content');
    const infoContent = document.getElementById('info-tab-content');
    const statusIndicator = document.getElementById('status-indicator');
    const errorToast = document.getElementById('error-toast');

    // Storage
    const storageContent = document.getElementById('storage-tab-content');

    // Network
    const networkContent = document.getElementById('network-tab-content');

    // Testes
    const runTestsButton = document.getElementById('run-tests-button');
    const testsOutput = document.getElementById('tests-output');

    // Elementos (Inspector)
    const elementsTab = document.getElementById('elements-tab-content');
    const domTreeOutput = document.getElementById('dom-tree-output');
    const elementsSearchInput = document.getElementById('elements-search-input');
    const elementPickerBtn = document.getElementById('element-picker-button');
    const styleInspectorOutput = document.getElementById('style-inspector-output');

    // Estado
    let commandHistory = [];
    let historyIndex = 0;
    let capturedErrors = [];

    if (!panel) return;

    // --- INICIALIZAÇÃO E CONTROLES DO PAINEL ---
    if (statusIndicator) {
      statusIndicator.classList.add('ok');
      statusIndicator.title = 'Todos os scripts foram carregados com sucesso.';
    }

    if (trigger) trigger.addEventListener('click', () => panel.classList.remove('hidden'));
    if (closeButton) closeButton.addEventListener('click', () => panel.classList.add('hidden'));

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contentAreas.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const targetContent = document.getElementById(`${tab.dataset.tab}-tab-content`);
        if (targetContent) targetContent.classList.add('active');
        if (tab.dataset.tab === 'storage') populateStorageTab();
      });
    });

    // --- ERROS VISUAIS ---
    function handleVisualError(message) {
      if (errorToast) {
        errorToast.textContent = message;
        errorToast.classList.add('show');
        setTimeout(() => errorToast.classList.remove('show'), 5000);
      }
      if (statusIndicator) {
        statusIndicator.classList.remove('ok');
        statusIndicator.classList.add('error');
        statusIndicator.title = 'Erro no script! Veja o console (F12) ou o painel para detalhes.';
      }
    }

    // --- MÓDULO 1: MONITOR GLOBAL E CONSOLE EMBUTIDO ---
    window.onerror = function(message, source, lineno, colno, error) {
      const sourceFile = source ? source.split('/').pop() : 'script';
      const errorMessage = `${message} em ${sourceFile}:${lineno}`;
      capturedErrors.push(errorMessage);
      handleVisualError(errorMessage);
      console.error(errorMessage, error);
      return true; // evita alerta padrão do browser
    };

    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    function createLogMessage(type, icon, args) {
      if (!consoleOutput) return;
      const line = document.createElement('div');
      line.className = `console-line ${type}`;
      let message = `<span class="material-symbols-outlined console-icon">${icon}</span> <div>`;
      args.forEach(arg => {
        if (arg instanceof Error) {
          const errorText = `${arg.name}: ${arg.message}\n${arg.stack || '(no stack trace)'}`;
          message += `<pre style="white-space: pre-wrap; margin: 0; font-family: inherit;">${errorText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        } else if (typeof arg === 'object' && arg !== null) {
          try {
            message += JSON.stringify(arg, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;');
          } catch {
            message += String(arg).replace(/</g, '&lt;').replace(/>/g, '&gt;');
          }
        } else {
          message += String(arg).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
        message += ' ';
      });
      message += '</div>';
      line.innerHTML = message;
      consoleOutput.appendChild(line);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    console.log = function(...args) { originalConsole.log.apply(console, args); createLogMessage('log', 'terminal', args); };
    console.warn = function(...args) { originalConsole.warn.apply(console, args); createLogMessage('warn', 'warning', args); };
    console.error = function(...args) {
      const errorString = args.map(a => (a instanceof Error ? `${a.name}: ${a.message}` : String(a))).join(' ');
      capturedErrors.push(errorString);
      originalConsole.error.apply(console, args);
      createLogMessage('error', 'error', args);
      if (args.length > 0) {
        const first = args[0];
        handleVisualError(first instanceof Error ? first.message : String(first));
      }
    };
    console.info = function(...args) { originalConsole.info.apply(console, args); createLogMessage('info', 'info', args); };

    if (consoleClearBtn) consoleClearBtn.addEventListener('click', () => { if (consoleOutput) consoleOutput.innerHTML = ''; console.info('Console limpo.'); });

    if (consoleInput) {
      consoleInput.addEventListener('keydown', (e) => {
        const command = e.target.value.trim();
        if (e.key === 'Enter' && command) {
          if (commandHistory[commandHistory.length - 1] !== command) commandHistory.push(command);
          historyIndex = commandHistory.length;
          createLogMessage('command', 'chevron_right', [command]);
          try {
            const result = (new Function(`return ${command}`))();
            if (result !== undefined) createLogMessage('return', 'subdirectory_arrow_left', [result]);
          } catch (error) { console.error(error); }
          e.target.value = '';
          if (consoleOutput) consoleOutput.scrollTop = consoleOutput.scrollHeight;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (historyIndex > 0) e.target.value = commandHistory[--historyIndex];
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIndex < commandHistory.length - 1) e.target.value = commandHistory[++historyIndex];
          else { historyIndex = commandHistory.length; e.target.value = ''; }
        }
      });
    }

    // --- MÓDULO 2: ABA DE ELEMENTOS COM INSPETOR E EDITOR DE CSS ---
    let selectedElement = null;
    let isPickerActive = false;
    let originalOutline = '';
    let lastHoveredElement = null;

    function buildDomTree(element, parentElement, depth = 0) {
      if (!element || !parentElement || element.id === 'dev-tools-panel' || element.id === 'dev-tools-trigger' || ['SCRIPT','LINK','STYLE','META'].includes(element.tagName)) return;

      const node = document.createElement('div');
      node.className = 'dom-node';
      node.style.paddingLeft = `${depth * 20}px`;
      node.elementRef = element;
      element.domNodeRef = node;

      const tag = element.tagName.toLowerCase();
      const id = element.id ? `<span class="dom-id">#${element.id}</span>` : '';
      const classes = element.className ? `<span class="dom-class">.${String(element.className).split(' ').join('.')}</span>` : '';
      node.innerHTML = `&lt;<span class="dom-tag">${tag}</span>${id}${classes}&gt;`;

      parentElement.appendChild(node);

      node.addEventListener('click', (e) => { e.stopPropagation(); selectElement(element); });

      element.childNodes.forEach(child => { if (child.nodeType === Node.ELEMENT_NODE) buildDomTree(child, parentElement, depth + 1); });
    }

    function selectElement(element) {
      if (selectedElement && selectedElement.domNodeRef) selectedElement.domNodeRef.classList.remove('selected');
      selectedElement = element;
      if (selectedElement && selectedElement.domNodeRef) {
        selectedElement.domNodeRef.classList.add('selected');
        selectedElement.domNodeRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      updateStyleInspector(element);
    }

    function updateStyleInspector(element) {
      if (!styleInspectorOutput || !element) return;
      const styles = window.getComputedStyle(element);
      let html = '<div class="style-group"><h4>element.style {</h4>';
      for (let i = 0; i < element.style.length; i++) {
        const prop = element.style[i];
        const value = element.style.getPropertyValue(prop);
        html += createStyleRuleHTML(prop, value, true);
      }
      html += '<h4>}</h4></div>';

      html += '<div class="style-group"><h4>Computed Styles</h4>';
      const importantStyles = ['color','background-color','font-family','font-size','font-weight','line-height','margin','padding','display','border','width','height'];
      importantStyles.forEach(prop => { html += createStyleRuleHTML(prop, styles.getPropertyValue(prop), false); });
      html += '</div>';

      styleInspectorOutput.innerHTML = html;
    }

    function createStyleRuleHTML(property, value, isEditable) {
      return `
        <div class="style-rule ${isEditable ? 'editable' : ''}">
          <label class="style-checkbox-wrapper"><input type="checkbox" ${isEditable ? 'checked' : 'checked disabled'}></label>
          <span class="property" ${isEditable ? 'contenteditable="true"' : ''}>${property}</span>:
          <span class="value" ${isEditable ? 'contenteditable="true"' : ''}>${value}</span>;
        </div>
      `;
    }

    if (styleInspectorOutput) {
      styleInspectorOutput.addEventListener('input', (e) => {
        if (!selectedElement || !e.target.closest('.editable')) return;
        const rule = e.target.closest('.style-rule');
        if (!rule) return;
        const prop = rule.querySelector('.property').textContent.trim();
        const val = rule.querySelector('.value').textContent.trim();
        if (prop && val) selectedElement.style.setProperty(prop, val);
      });
      styleInspectorOutput.addEventListener('change', (e) => {
        if (!selectedElement || e.target.type !== 'checkbox' || !e.target.closest('.editable')) return;
        const rule = e.target.closest('.style-rule');
        const prop = rule.querySelector('.property').textContent.trim();
        if (e.target.checked) {
          const val = rule.querySelector('.value').textContent.trim();
          selectedElement.style.setProperty(prop, val);
        } else {
          selectedElement.style.removeProperty(prop);
        }
      });
    }

    const handleMouseMove = (e) => {
      if (lastHoveredElement) lastHoveredElement.style.outline = originalOutline;
      lastHoveredElement = e.target;
      if (!lastHoveredElement || lastHoveredElement === document.body || lastHoveredElement.closest('#dev-tools-panel')) { lastHoveredElement = null; return; }
      originalOutline = lastHoveredElement.style.outline;
      lastHoveredElement.style.outline = '2px solid #2563eb';
    };

    const handleMouseClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (lastHoveredElement) {
        selectElement(lastHoveredElement);
        togglePicker();
      }
    };

    function togglePicker() {
      isPickerActive = !isPickerActive;
      if (elementPickerBtn) elementPickerBtn.classList.toggle('active', isPickerActive);
      if (isPickerActive) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleMouseClick, true);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleMouseClick, true);
        if (lastHoveredElement) lastHoveredElement.style.outline = originalOutline;
      }
    }

    if (elementPickerBtn) elementPickerBtn.addEventListener('click', togglePicker);

    if (elementsSearchInput && domTreeOutput) {
      elementsSearchInput.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.trim().toLowerCase();
        const allNodes = domTreeOutput.querySelectorAll('.dom-node');
        allNodes.forEach(node => {
          let isVisible = false;
          if (!searchTerm) {
            isVisible = true;
          } else if (searchTerm.startsWith('#')) {
            const idToFind = searchTerm.substring(1);
            const idEl = node.querySelector('.dom-id');
            if (idEl && idEl.textContent.replace('#','') === idToFind) isVisible = true;
          } else if (searchTerm.startsWith('.')) {
            const classToFind = searchTerm.substring(1);
            const classEl = node.querySelector('.dom-class');
            if (classEl && classEl.textContent.split('.').includes(classToFind)) isVisible = true;
          } else {
            const tag = node.querySelector('.dom-tag');
            if (tag && tag.textContent.toLowerCase().includes(searchTerm)) isVisible = true;
          }
          node.style.display = isVisible ? 'block' : 'none';
        });
      });
    }

    if (domTreeOutput) buildDomTree(document.documentElement, domTreeOutput);

    // --- MÓDULO 3: MÉTRICAS DE DESEMPENHO ---
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (!performanceContent || !window.performance || !window.performance.getEntriesByType) return;
        const perf = window.performance;
        const resources = perf.getEntriesByType('resource');
        const navTiming = perf.getEntriesByType('navigation')[0];
        if (!navTiming) return;
        let content = `<table class="info-table">`;
        content += `<tr><td>Tempo total de carregamento:</td><td>${navTiming.duration.toFixed(2)} ms</td></tr>`;
        content += `<tr><td>Recursos carregados:</td><td>${resources.length}</td></tr>`;
        content += `</table><h4 class="mt-4 font-bold">Recursos:</h4><table class="info-table">`;
        resources.forEach(res => {
          const resourceName = (res.name || '').split('/').pop();
          if (resourceName) content += `<tr><td>${resourceName}</td><td>${res.duration.toFixed(2)} ms</td></tr>`;
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
              <td class="value" contenteditable="true">${value}</td>
              <td class="actions">
                <button class="storage-action-btn edit-btn" data-storage-type="${title}" data-key="${key}" title="Salvar Edição">
                  <span class="material-symbols-outlined">save</span>
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
        const row = target.closest('tr');
        if (target.classList.contains('delete-btn')) {
          if (confirm(`Tem certeza que deseja excluir a chave "${key}" do ${storageType}?`)) {
            storage.removeItem(key);
            populateStorageTab();
            console.info(`Chave "${key}" removida do ${storageType}.`);
          }
        }
        if (target.classList.contains('edit-btn')) {
          const newValueCell = row && row.querySelector('.value');
          const newValue = newValueCell ? newValueCell.textContent : storage.getItem(key);
          if (newValue !== null) {
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
        'Resolução da Janela': `${window.innerWidth}x${window.innerHeight}`,
        'Versão do Projeto': '5.1.0',
        'Linguagem': navigator.language
      };
      let content = `<table class="info-table">`;
      for (const [key, value] of Object.entries(info)) content += `<tr><td>${key}:</td><td>${value}</td></tr>`;
      content += '</table>';
      infoContent.innerHTML = content;
    }

    // --- MÓDULO 6: NETWORK INTERCEPTOR ---
    function initializeNetworkInterceptor() {
      if (!networkContent) return;
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
        const shortUrl = (url || '').split('/').pop().split('?')[0] || url;

        const row = document.createElement('tr');
        row.className = 'network-row';
        row.innerHTML = `
          <td class="url">${shortUrl}</td>
          <td class="status-pending">pendente...</td>
          <td>${method}</td>
          <td class="time">...</td>
        `;
        if (networkLogBody) networkLogBody.prepend(row);

        const fetchPromise = originalFetch.apply(this, args);
        fetchPromise.then(response => {
          const duration = (performance.now() - startTime).toFixed(0);
          const statusCell = row.querySelector('td:nth-child(2)');
          if (statusCell) {
            statusCell.textContent = `${response.status} ${response.statusText}`;
            statusCell.className = response.ok ? 'status-ok' : 'status-error';
          }
          const timeCell = row.querySelector('.time');
          if (timeCell) timeCell.textContent = `${duration} ms`;
        }).catch(error => {
          const duration = (performance.now() - startTime).toFixed(0);
          const statusCell = row.querySelector('td:nth-child(2)');
          if (statusCell) {
            statusCell.textContent = 'Falhou';
            statusCell.className = 'status-error';
          }
          const timeCell = row.querySelector('.time');
          if (timeCell) timeCell.textContent = `${duration} ms`;
          console.error('Erro de rede interceptado:', error);
        });
        return fetchPromise;
      };
    }

    // --- MÓDULO 7: SUÍTE DE DIAGNÓSTICO AVANÇADA ---
    function addTestResult(message, type = 'info', solution = null) {
      if (!testsOutput) return;
      const line = document.createElement('div');
      line.className = `console-line ${type}`;
      let icon = 'info';
      if (type === 'success') icon = 'check_circle';
      if (type === 'warn') icon = 'warning';
      if (type === 'error') icon = 'error';
      let html = `<span class="material-symbols-outlined console-icon">${icon}</span> <div>${message.replace(/</g, '&lt;')}</div>`;
      if (solution) html += `<div style="margin-left:32px;margin-top:4px;font-size:12px;color:var(--color-info);"><strong>Sugestão:</strong> ${solution.replace(/</g, '&lt;')}</div>`;
      line.innerHTML = html;
      testsOutput.appendChild(line);
    }

    async function testArquivosEssenciais() {
      addTestResult('Executando: Verificação de Arquivos Essenciais...', 'info');
      const checks = [
        { name: 'Dados da Home (conteudo-index.json)', url: 'conteudo-index.json', type: 'json' },
        { name: 'Dados da Busca (busca-data.json)', url: 'busca-data.json', type: 'json' },
        { name: 'Artigo: Introdução', url: 'artigos/introducao.md', type: 'content' },
        { name: 'Script Principal (main.js)', url: 'main.js', type: 'script' }
      ];
      let hasErrors = false;
      const promises = checks.map(async (check) => {
        try {
          const response = await fetch(check.url);
          if (!response.ok) throw new Error(`Status ${response.status}`);
          const content = await response.text();
          if (content.trim() === '') {
            addTestResult(`${check.name}: O arquivo está vazio.`, 'warn', 'O arquivo existe mas não tem conteúdo, o que pode causar erros.');
            hasErrors = true;
          }
          if (check.type === 'json') JSON.parse(content);
        } catch (error) {
          addTestResult(`${check.name}: Falha ao carregar ou processar (${error.message})`, 'error', `Verifique se o arquivo existe no caminho correto: ${check.url}`);
          hasErrors = true;
        }
      });
      await Promise.all(promises);
      if (!hasErrors) addTestResult('PASSOU: Todos os arquivos essenciais foram carregados e são válidos.', 'success');
    }

    async function testLinksNosArtigos() {
      addTestResult('Executando: Verificação de Links nos Artigos .md...', 'info');
      const articleFiles = ['artigos/introducao.md', 'artigos/alertas.md', 'artigos/relatorios.md'];
      let brokenLinksCount = 0;
      const linkPromises = [];
      for (const file of articleFiles) {
        try {
          const response = await fetch(file);
          if (!response.ok) { addTestResult(`Não foi possível carregar o artigo ${file} para verificar links.`, 'warn'); continue; }
          const markdown = await response.text();
          const linkRegex = /\[.*?\]\((.*?)\)/g;
          let match;
          while ((match = linkRegex.exec(markdown)) !== null) {
            const url = match[1];
            const isWebOrRelative = /^(https?:|^\/|^\.\.?\/)/.test(url);
            if (!isWebOrRelative) continue;
            linkPromises.push(
              fetch(url, { method: 'HEAD' }).then(linkResponse => {
                if (!linkResponse.ok) {
                  brokenLinksCount++;
                  addTestResult(`Link quebrado em ${file}: <code>${url}</code> (Status: ${linkResponse.status})`, 'error', 'Corrija o caminho do link no arquivo Markdown.');
                }
              }).catch(() => {
                brokenLinksCount++;
                addTestResult(`Link quebrado em ${file}: <code>${url}</code> (Erro de rede)`, 'error', 'Corrija o caminho do link no arquivo Markdown.');
              })
            );
          }
        } catch (e) {
          addTestResult(`Erro ao processar o artigo ${file}.`, 'warn');
        }
      }
      await Promise.all(linkPromises);
      if (brokenLinksCount === 0) addTestResult('PASSOU: Nenhum link quebrado encontrado dentro dos artigos.', 'success');
    }

    function testBoasPraticasScripts() {
      addTestResult('Executando: Análise de Carregamento de Scripts...', 'info');
      const scripts = document.querySelectorAll('script[src]');
      let hasIssues = false;
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && (src.includes('main.js') || src.includes('doc-loader.js') || src.includes('busca.js') || src.includes('dev-panel.js'))) {
          if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
            hasIssues = true;
            addTestResult(`O script <code>${src}</code> está sem 'defer' ou 'async'.`, 'warn', "Adicione o atributo 'defer' à tag script para melhorar a performance de carregamento da página.");
          }
        }
      });
      if (!hasIssues) addTestResult("PASSOU: Todos os scripts locais usam 'defer' ou 'async'.", 'success');
    }

    function testConteudoMisto() {
      addTestResult('Executando: Verificação de Segurança (Conteúdo Misto)...', 'info');
      let mixedContentCount = 0;
      if (window.location.protocol === 'https:') {
        const resources = document.querySelectorAll('img[src], script[src], link[href]');
        resources.forEach(res => {
          const url = res.src || res.href;
          if (url && url.startsWith('http:')) {
            mixedContentCount++;
            addTestResult(`Conteúdo Misto encontrado: <code>${url}</code>`, 'error', 'Esta página é HTTPS, mas carrega um recurso via HTTP. Altere o link para HTTPS para evitar alertas de segurança.');
          }
        });
      }
      if (mixedContentCount === 0) addTestResult('PASSOU: Nenhum conteúdo misto (HTTP em página HTTPS) foi encontrado.', 'success');
    }

    function testAcessibilidadeImagens() {
      addTestResult('Executando: Teste de Acessibilidade (Imagens)...');
      const imagensSemAlt = document.querySelectorAll('main img:not([alt])');
      if (imagensSemAlt.length === 0) {
        addTestResult("PASSOU: Todas as imagens no conteúdo principal possuem o atributo 'alt'.", 'success');
      } else {
        addTestResult(`AVISO: Encontrada(s) ${imagensSemAlt.length} imagem(ns) sem o atributo 'alt'.`, 'warn', 'Adicione o atributo `alt` com uma descrição útil do conteúdo da imagem para melhorar a acessibilidade.');
      }
    }

    function testConsoleErros() {
      addTestResult('Executando: Teste de Erros no Console...', 'info');
      if (capturedErrors.length === 0) {
        addTestResult('PASSOU: Nenhum erro de JavaScript foi detectado desde que a página carregou.', 'success');
      } else {
        addTestResult(`FALHOU: Foram detectados ${capturedErrors.length} erro(s). Veja o console para detalhes.`, 'error', 'Abra a aba "Console" aqui no painel ou o console do navegador (F12) para ver os erros em vermelho.');
        capturedErrors.forEach(err => {
          const shortErr = err.length > 100 ? err.substring(0, 97) + '...' : err;
          addTestResult(`\u00A0\u00A0\u00A0- <code>${shortErr}</code>`, 'error');
        });
      }
    }

    async function runAllTests() {
      if (!testsOutput || !runTestsButton) return;
      runTestsButton.disabled = true;
      testsOutput.innerHTML = '';
      capturedErrors = [];

      addTestResult('Iniciando varredura completa do site...', 'info');
      await testArquivosEssenciais();
      await testLinksNosArtigos();
      testAcessibilidadeImagens();
      testBoasPraticasScripts();
      testConteudoMisto();
      testConsoleErros();
      addTestResult('Varredura completa concluída.', 'success');
      runTestsButton.disabled = false;
    }

    if (runTestsButton) runTestsButton.addEventListener('click', runAllTests);

    // --- INICIALIZAÇÃO FINAL ---
    populateInfoTab();
    initializeNetworkInterceptor();
  });
})();
