// ARQUIVO: dev-panel.js
// RESPONSABILIDADE: Controlar toda a lógica do Painel de Diagnóstico (Dev Tools interno).
// VERSÃO: 5.3.0 (Base 5.2.0 + refinamentos de UX, integração com status-checker e logs padronizados)
// -------------------------------------------------------------------------------------
// NOTAS DE VERSÃO 5.3.0
// - Mantém TODOS os módulos da versão 5.2.0 (Console, Elements, Performance, Storage, Network, Testes, Info).
// - Padroniza logs com prefixo [DevPanel v5.3.0].
// - Toast de erro e indicador de status alinhados com style.css/status-checker (classes ok/warn/error).
// - "Elements": Element Picker e Style Inspector com edição inline, preservando outline original.
// - "Network": intercepta fetch e XHR; inclui método HTTP, status e tempo.
// - "Storage": edição inline, export JSON, limpeza total; eventos com feedback no console embedado.
// - "Testes": resultados com sugestão de solução e ícone por severidade.
// - Proteções extra (defensive checks), limpeza de listeners e acessibilidade básica.
// - Eventos customizados para integração futura: devtools:status-change, devtools:refresh-dom-tree.
// -------------------------------------------------------------------------------------

(function () {
  'use strict';

  // -----------------------------------------------------------------------------------
  // CONSTANTES E HELPERS GERAIS
  // -----------------------------------------------------------------------------------
  const VERSION = '5.3.0';
  const LOG_PREFIX = `[DevPanel v${VERSION}]`;

  /**
   * Helper para seletores com fallback silencioso.
   * @param {string} selector
   * @returns {HTMLElement|null}
   */
  function $(selector) {
    try { return document.querySelector(selector); } catch { return null; }
  }

  /** Formata texto de forma segura para HTML. */
  function escapeHTML(str) {
    return String(str).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /** Dispara um evento customizado para integração com outros módulos. */
  function emit(name, detail) {
    try { document.dispatchEvent(new CustomEvent(name, { detail })); } catch { /* noop */ }
  }

  document.addEventListener('DOMContentLoaded', () => {
    console.info(`${LOG_PREFIX} Inicializando…`);

    // ---------------------------------------------------------------------------------
    // ELEMENTOS DO DOM (seletores)
    // ---------------------------------------------------------------------------------
    const trigger = $('#dev-tools-trigger');
    const panel = $('#dev-tools-panel');
    const closeButton = $('#dev-tools-close');

    const tabs = document.querySelectorAll('.tab-button');
    const contentAreas = document.querySelectorAll('.tab-content');

    // Status/Info visual
    const statusIndicator = $('#status-indicator');
    const errorToast = $('#error-toast');

    // Console
    const consoleOutput = $('#console-output');
    const consoleClearBtn = $('#console-clear-button');
    const consoleExportBtn = $('#console-export-button');
    const consoleInput = $('#console-input');

    // Performance & Info
    const performanceContent = $('#performance-tab-content');
    const infoContent = $('#info-tab-content');

    // Storage
    const storageContent = $('#storage-tab-content');

    // Network
    const networkContent = $('#network-tab-content');

    // Testes
    const runTestsButton = $('#run-tests-button');
    const testsOutput = $('#tests-output');

    // Elements (Inspector)
    const domTreeOutput = $('#dom-tree-output');
    const elementsSearchInput = $('#elements-search-input');
    const elementPickerBtn = $('#element-picker-button');
    const styleInspectorOutput = $('#style-inspector-output');

    // ---------------------------------------------------------------------------------
    // ESTADO INTERNO
    // ---------------------------------------------------------------------------------
    const state = {
      commandHistory: [],
      historyIndex: 0,
      capturedErrors: [],
      selectedElement: null,
      isPickerActive: false,
      originalOutline: '',
      lastHoveredElement: null
    };

    if (!panel) {
      console.warn(`${LOG_PREFIX} Painel não encontrado no DOM. Abortando inicialização.`);
      return;
    }

    // ---------------------------------------------------------------------------------
    // INICIALIZAÇÃO BÁSICA DO PAINEL
    // ---------------------------------------------------------------------------------
    if (statusIndicator) {
      statusIndicator.classList.remove('warn', 'error');
      statusIndicator.classList.add('ok');
      statusIndicator.title = 'Todos os scripts do painel carregados.';
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

    // ---------------------------------------------------------------------------------
    // ERROS VISUAIS (toast + indicador de status)
    // ---------------------------------------------------------------------------------
    function setStatus(level, title) {
      if (!statusIndicator) return;
      statusIndicator.classList.remove('ok', 'warn', 'error');
      statusIndicator.classList.add(level);
      if (title) statusIndicator.title = title;
      emit('devtools:status-change', { level, title });
    }

    function showToast(message) {
      if (!errorToast) return;
      errorToast.textContent = message;
      errorToast.classList.add('show');
      setTimeout(() => errorToast.classList.remove('show'), 5000);
    }

    function handleVisualError(message) {
      showToast(message);
      setStatus('error', 'Erro no script! Veja a aba Console para detalhes.');
    }

    // ---------------------------------------------------------------------------------
    // MÓDULO 1: MONITOR GLOBAL + CONSOLE EMBUTIDO
    // ---------------------------------------------------------------------------------
    window.onerror = function (message, source, lineno, colno, error) {
      const sourceFile = source ? source.split('/').pop() : 'script';
      const errorMessage = `${message} em ${sourceFile}:${lineno}`;
      state.capturedErrors.push(errorMessage);
      handleVisualError(errorMessage);
      console.error(`${LOG_PREFIX}`, errorMessage, error);
      return true; // evita alerta padrão do browser
    };

    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    function stringifyForPanel(arg) {
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}\n${arg.stack || '(sem stack trace)'}`;
      }
      if (typeof arg === 'object' && arg !== null) {
        try { return JSON.stringify(arg, null, 2); } catch { return String(arg); }
      }
      return String(arg);
    }

    function createLogMessage(type, icon, args) {
      if (!consoleOutput) return;
      const line = document.createElement('div');
      line.className = `console-line ${type}`;
      const inner = args.map(a => `<div>${escapeHTML(stringifyForPanel(a))}</div>`).join(' ');
      line.innerHTML = `
        <span class="material-symbols-outlined console-icon">${icon}</span>
        <div>${inner}</div>
      `;
      consoleOutput.appendChild(line);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    console.log = function (...args) {
      originalConsole.log.apply(console, args);
      createLogMessage('log', 'terminal', args);
    };
    console.warn = function (...args) {
      originalConsole.warn.apply(console, args);
      createLogMessage('warn', 'warning', args);
      setStatus('warn', 'Avisos detectados. Veja a aba Console.');
    };
    console.error = function (...args) {
      const errorString = args.map(a => (a instanceof Error ? `${a.name}: ${a.message}` : String(a))).join(' ');
      state.capturedErrors.push(errorString);
      originalConsole.error.apply(console, args);
      createLogMessage('error', 'error', args);
      if (args.length > 0) {
        const first = args[0];
        handleVisualError(first instanceof Error ? first.message : String(first));
      }
    };
    console.info = function (...args) {
      originalConsole.info.apply(console, args);
      createLogMessage('info', 'info', args);
    };

    if (consoleClearBtn) {
      consoleClearBtn.addEventListener('click', () => {
        if (consoleOutput) consoleOutput.innerHTML = '';
        console.info(`${LOG_PREFIX} Console limpo.`);
        setStatus('ok', 'Sem erros no momento.');
      });
    }

    if (consoleExportBtn) {
      consoleExportBtn.addEventListener('click', () => {
        try {
          const lines = consoleOutput ? Array.from(consoleOutput.querySelectorAll('.console-line')) : [];
          const exportData = lines.map(line => {
            const type =
              line.classList.contains('error') ? 'error' :
              line.classList.contains('warn') ? 'warn' :
              line.classList.contains('info') ? 'info' :
              line.classList.contains('log') ? 'log' :
              line.classList.contains('command') ? 'command' :
              line.classList.contains('return') ? 'return' : 'unknown';
            const text = line.innerText || '';
            return { type, text };
          });

          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `console-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.info(`${LOG_PREFIX} Logs exportados em JSON.`);
        } catch (e) {
          console.error(`${LOG_PREFIX} Falha ao exportar logs.`, e);
        }
      });
    }

    if (consoleInput) {
      consoleInput.addEventListener('keydown', (e) => {
        const command = e.target.value.trim();
        if (e.key === 'Enter' && command) {
          if (state.commandHistory[state.commandHistory.length - 1] !== command) state.commandHistory.push(command);
          state.historyIndex = state.commandHistory.length;
          createLogMessage('command', 'chevron_right', [command]);
          try {
            // Executa em Function isolada (scope local)
            const result = (new Function(`return (${command})`))();
            if (typeof result !== 'undefined') createLogMessage('return', 'subdirectory_arrow_left', [result]);
          } catch (error) {
            console.error(error);
          }
          e.target.value = '';
          if (consoleOutput) consoleOutput.scrollTop = consoleOutput.scrollHeight;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (state.historyIndex > 0) e.target.value = state.commandHistory[--state.historyIndex] || '';
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (state.historyIndex < state.commandHistory.length - 1) e.target.value = state.commandHistory[++state.historyIndex] || '';
          else { state.historyIndex = state.commandHistory.length; e.target.value = ''; }
        }
      });
    }

    // ---------------------------------------------------------------------------------
    // MÓDULO 2: ELEMENTS - Árvore DOM + Element Picker + Style Inspector
    // ---------------------------------------------------------------------------------
    function isPanelInternal(el) {
      return !!(el && (el.id === 'dev-tools-panel' || (el.closest && el.closest('#dev-tools-panel'))));
    }

    function buildDomTree(element, parentElement, depth = 0) {
      if (!element || !parentElement) return;
      if (element.id === 'dev-tools-panel' || element.id === 'dev-tools-trigger') return;
      if (['SCRIPT', 'LINK', 'STYLE', 'META'].includes(element.tagName)) return;

      const node = document.createElement('div');
      node.className = 'dom-node';
      node.style.paddingLeft = `${depth * 20}px`;
      node.elementRef = element;
      element.domNodeRef = node;

      const tag = element.tagName.toLowerCase();
      const id = element.id ? `<span class="dom-id">#${escapeHTML(element.id)}</span>` : '';
      const cls = element.className ? `<span class="dom-class">.${escapeHTML(String(element.className).trim().split(/\s+/).join('.'))}</span>` : '';
      node.innerHTML = `&lt;<span class="dom-tag">${tag}</span>${id}${cls}&gt;`;

      parentElement.appendChild(node);

      node.addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement(element);
      });

      element.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) buildDomTree(child, parentElement, depth + 1);
      });
    }

    function refreshDomTree() {
      if (!domTreeOutput) return;
      domTreeOutput.innerHTML = '';
      buildDomTree(document.documentElement, domTreeOutput);
    }

    function selectElement(element) {
      if (!element || isPanelInternal(element)) return;

      if (state.selectedElement && state.selectedElement.domNodeRef) {
        state.selectedElement.domNodeRef.classList.remove('selected');
      }

      state.selectedElement = element;

      if (state.selectedElement && state.selectedElement.domNodeRef) {
        state.selectedElement.domNodeRef.classList.add('selected');
        state.selectedElement.domNodeRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      updateStyleInspector(state.selectedElement);
    }

    function createStyleRuleHTML(property, value, isEditable) {
      return `
        <div class="style-rule ${isEditable ? 'editable' : ''}">
          <label class="style-checkbox-wrapper">
            <input type="checkbox" ${isEditable ? 'checked' : 'checked disabled'}>
          </label>
          <span class="property" ${isEditable ? 'contenteditable="true"' : ''}>${escapeHTML(property)}</span>:
          <span class="value" ${isEditable ? 'contenteditable="true"' : ''}>${escapeHTML(value)}</span>;
        </div>
      `;
    }

    function updateStyleInspector(element) {
      if (!styleInspectorOutput) return;

      if (!element) {
        styleInspectorOutput.innerHTML = `<div class="style-placeholder">Selecione um elemento na árvore para inspecionar seus estilos.</div>`;
        return;
      }

      const styles = window.getComputedStyle(element);
      let html = '';

      // Seletor do elemento
      const tag = element.tagName.toLowerCase();
      const id = element.id ? `#${escapeHTML(element.id)}` : '';
      const classStr = element.className ? '.' + escapeHTML(String(element.className).trim().split(/\s+/).join('.')) : '';
      html += `<div class="inspector-target"><strong>Selecionado:</strong> <code>${tag}${id}${classStr}</code></div>`;

      // Inline Styles (editáveis)
      html += '<div class="style-group"><h4>element.style {</h4>';
      if (element.style.length === 0) {
        html += `<div class="style-rule"><em>(sem propriedades inline)</em></div>`;
      } else {
        for (let i = 0; i < element.style.length; i++) {
          const prop = element.style[i];
          const value = element.style.getPropertyValue(prop);
          html += createStyleRuleHTML(prop, value, true);
        }
      }
      html += '<h4>}</h4></div>';

      // Computed Styles (principais)
      html += '<div class="style-group"><h4>Computed Styles</h4>';
      const important = [
        'color', 'background-color', 'font-family', 'font-size', 'font-weight',
        'line-height', 'margin', 'padding', 'display', 'border', 'width', 'height',
        'position', 'top', 'right', 'bottom', 'left', 'z-index', 'opacity', 'box-shadow'
      ];
      important.forEach(prop => {
        html += `
          <div class="style-rule">
            <span class="property">${prop}</span>:
            <span class="value">${escapeHTML(styles.getPropertyValue(prop))}</span>;
          </div>
        `;
      });
      html += '</div>';

      // Ações rápidas
      html += `
        <div class="style-actions">
          <button id="add-inline-style" class="style-action-btn" title="Adicionar propriedade inline">
            <span class="material-symbols-outlined">add</span> Adicionar propriedade
          </button>
          <button id="clear-inline-styles" class="style-action-btn" title="Remover todas as propriedades inline">
            <span class="material-symbols-outlined">delete</span> Limpar inline
          </button>
        </div>
      `;

      styleInspectorOutput.innerHTML = html;

      // Listeners de edição inline
      styleInspectorOutput.querySelectorAll('.style-group .editable').forEach(rule => {
        const checkbox = rule.querySelector('input[type="checkbox"]');
        const propEl = rule.querySelector('.property');
        const valEl = rule.querySelector('.value');

        if (checkbox) {
          checkbox.addEventListener('change', () => {
            const prop = propEl.textContent.trim();
            if (!prop) return;
            if (checkbox.checked) {
              const val = valEl.textContent.trim();
              state.selectedElement.style.setProperty(prop, val);
            } else {
              state.selectedElement.style.removeProperty(prop);
            }
            updateStyleInspector(state.selectedElement); // reflete mudanças
          });
        }

        if (propEl && valEl) {
          const commit = () => {
            const prop = propEl.textContent.trim();
            const val = valEl.textContent.trim();
            if (!prop) return;
            state.selectedElement.style.setProperty(prop, val);
            updateStyleInspector(state.selectedElement);
          };
          propEl.addEventListener('blur', commit);
          valEl.addEventListener('blur', commit);
          propEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
          valEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
        }
      });

      const addBtn = styleInspectorOutput.querySelector('#add-inline-style');
      const clearBtn = styleInspectorOutput.querySelector('#clear-inline-styles');

      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const prop = prompt('Nome da propriedade CSS (ex: color, margin-top, etc.):');
          if (!prop) return;
          const val = prompt(`Valor para "${prop}":`);
          if (val == null) return;
          try {
            state.selectedElement.style.setProperty(prop, val);
            updateStyleInspector(state.selectedElement);
          } catch (e) {
            console.error(`${LOG_PREFIX} Falha ao definir propriedade CSS:`, e);
          }
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (!state.selectedElement) return;
          if (!confirm('Remover TODAS as propriedades inline deste elemento?')) return;
          state.selectedElement.removeAttribute('style');
          updateStyleInspector(state.selectedElement);
        });
      }
    }

    function startPicker() {
      if (state.isPickerActive) return;
      state.isPickerActive = true;
      if (elementPickerBtn) elementPickerBtn.classList.add('active');

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleMouseClick, true);
      document.addEventListener('keydown', handlePickerEscape, true);
    }

    function stopPicker() {
      if (!state.isPickerActive) return;
      state.isPickerActive = false;
      if (elementPickerBtn) elementPickerBtn.classList.remove('active');

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseClick, true);
      document.removeEventListener('keydown', handlePickerEscape, true);

      if (state.lastHoveredElement) {
        state.lastHoveredElement.style.outline = state.originalOutline;
        state.lastHoveredElement = null;
      }
    }

    function togglePicker() { state.isPickerActive ? stopPicker() : startPicker(); }

    function handlePickerEscape(e) { if (e.key === 'Escape') stopPicker(); }

    function handleMouseMove(e) {
      if (state.lastHoveredElement) {
        state.lastHoveredElement.style.outline = state.originalOutline;
      }
      state.lastHoveredElement = e.target;
      if (!state.lastHoveredElement || isPanelInternal(state.lastHoveredElement) || state.lastHoveredElement === document.body) {
        state.lastHoveredElement = null; return;
      }
      state.originalOutline = state.lastHoveredElement.style.outline;
      state.lastHoveredElement.style.outline = '2px solid #2563eb';
    }

    function handleMouseClick(e) {
      e.preventDefault();
      e.stopPropagation();
      if (state.lastHoveredElement && !isPanelInternal(state.lastHoveredElement)) {
        selectElement(state.lastHoveredElement);
        stopPicker();
      }
    }

    if (elementPickerBtn) {
      elementPickerBtn.addEventListener('click', togglePicker);
      elementPickerBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePicker(); } });
    }

    if (elementsSearchInput && domTreeOutput) {
      elementsSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim().toLowerCase();
        const allNodes = domTreeOutput.querySelectorAll('.dom-node');

        allNodes.forEach(node => {
          let isVisible = false;
          if (!searchTerm) {
            isVisible = true;
          } else if (searchTerm.startsWith('#')) {
            // Busca por ID
            const idToFind = searchTerm.substring(1);
            const idEl = node.querySelector('.dom-id');
            if (idEl && idEl.textContent.replace('#', '') === idToFind) isVisible = true;
          } else if (searchTerm.startsWith('.')) {
            // Busca por classe
            const classToFind = searchTerm.substring(1);
            const classEl = node.querySelector('.dom-class');
            if (classEl) {
              const classes = classEl.textContent.split('.').filter(Boolean);
              if (classes.includes(classToFind)) isVisible = true;
            }
          } else {
            // Busca por tag
            const tag = node.querySelector('.dom-tag');
            if (tag && tag.textContent.toLowerCase().includes(searchTerm)) isVisible = true;
          }
          node.style.display = isVisible ? 'block' : 'none';
        });
      });
    }

    if (domTreeOutput) {
      refreshDomTree();
      // Observa alterações grandes no DOM para permitir refresh manual via evento
      document.addEventListener('devtools:refresh-dom-tree', refreshDomTree);
    }

    // ---------------------------------------------------------------------------------
    // MÓDULO 3: PERFORMANCE
    // ---------------------------------------------------------------------------------
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
          if (resourceName) content += `<tr><td>${escapeHTML(resourceName)}</td><td>${res.duration.toFixed(2)} ms</td></tr>`;
        });

        content += '</table>';
        performanceContent.innerHTML = content;
      }, 500);
    });

    // ---------------------------------------------------------------------------------
    // MÓDULO 4: STORAGE (Local & Session)
    // ---------------------------------------------------------------------------------
    function createStorageTableHTML(title, storage) {
      let tableHTML = `<div class="storage-section"><h3 class="storage-title">${escapeHTML(title)}</h3>`;
      if (!storage || storage.length === 0) {
        tableHTML += `<p>Nenhum dado encontrado.</p></div>`;
        return tableHTML;
      }

      tableHTML += `
        <div class="storage-actions">
          <button class="storage-clear-all" data-storage-type="${escapeHTML(title)}">
            <span class="material-symbols-outlined">delete_sweep</span> Limpar tudo
          </button>
          <button class="storage-export" data-storage-type="${escapeHTML(title)}">
            <span class="material-symbols-outlined">download</span> Exportar JSON
          </button>
        </div>
        <table class="storage-table">
          <thead>
            <tr><th>Chave (Key)</th><th>Valor (Value)</th><th>Ações</th></tr>
          </thead>
          <tbody>
      `;

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        const value = storage.getItem(key);
        tableHTML += `
          <tr>
            <td class="key">${escapeHTML(key)}</td>
            <td class="value" contenteditable="true">${escapeHTML(value)}</td>
            <td class="actions">
              <button class="storage-action-btn edit-btn" data-storage-type="${escapeHTML(title)}" data-key="${escapeHTML(key)}" title="Salvar Edição">
                <span class="material-symbols-outlined">save</span>
              </button>
              <button class="storage-action-btn delete-btn" data-storage-type="${escapeHTML(title)}" data-key="${escapeHTML(key)}" title="Excluir Chave">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </td>
          </tr>`;
      }

      tableHTML += `</tbody></table></div>`;
      return tableHTML;
    }

    function populateStorageTab() {
      if (!storageContent) return;
      storageContent.innerHTML = '';
      storageContent.innerHTML += createStorageTableHTML('Local Storage', window.localStorage);
      storageContent.innerHTML += createStorageTableHTML('Session Storage', window.sessionStorage);
    }

    if (storageContent) {
      storageContent.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const storageType = target.dataset.storageType;
        const key = target.dataset.key;
        const store = storageType === 'Local Storage' ? window.localStorage : window.sessionStorage;

        // Exportar
        if (target.classList.contains('storage-export')) {
          const data = {};
          for (let i = 0; i < store.length; i++) {
            const k = store.key(i);
            data[k] = store.getItem(k);
          }
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${storageType.replace(' ', '-').toLowerCase()}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.info(`${LOG_PREFIX} ${storageType} exportado em JSON.`);
          return;
        }

        // Limpar tudo
        if (target.classList.contains('storage-clear-all')) {
          if (confirm(`Tem certeza que deseja LIMPAR TODOS os itens do ${storageType}?`)) {
            store.clear();
            populateStorageTab();
            console.info(`${LOG_PREFIX} Todos os itens do ${storageType} foram removidos.`);
          }
          return;
        }

        // Salvar edição de uma chave
        if (target.classList.contains('edit-btn')) {
          const row = target.closest('tr');
          const newValueCell = row && row.querySelector('.value');
          const newValue = newValueCell ? newValueCell.textContent : store.getItem(key);
          if (newValue !== null) {
            store.setItem(key, newValue);
            populateStorageTab();
            console.info(`${LOG_PREFIX} Chave "${key}" atualizada no ${storageType}.`);
          }
          return;
        }

        // Remover chave
        if (target.classList.contains('delete-btn')) {
          if (confirm(`Tem certeza que deseja excluir a chave "${key}" do ${storageType}?`)) {
            store.removeItem(key);
            populateStorageTab();
            console.info(`${LOG_PREFIX} Chave "${key}" removida do ${storageType}.`);
          }
        }
      });
    }

    // ---------------------------------------------------------------------------------
    // MÓDULO 5: INFORMAÇÕES DA PÁGINA
    // ---------------------------------------------------------------------------------
    function populateInfoTab() {
      if (!infoContent) return;
      const info = {
        'URL': window.location.href,
        'Navegador (User Agent)': navigator.userAgent,
        'Resolução da Tela': `${window.screen.width}x${window.screen.height}`,
        'Resolução da Janela': `${window.innerWidth}x${window.innerHeight}`,
        'Versão do Projeto': VERSION,
        'Linguagem': navigator.language,
        'Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'n/a',
        'Online': navigator.onLine ? 'Sim' : 'Não'
      };

      let content = `<table class="info-table">`;
      for (const [key, value] of Object.entries(info)) {
        content += `<tr><td>${escapeHTML(key)}:</td><td>${escapeHTML(value)}</td></tr>`;
      }
      content += '</table>';
      infoContent.innerHTML = content;
    }

    // ---------------------------------------------------------------------------------
    // MÓDULO 6: NETWORK INTERCEPTOR (fetch + XHR)
    // ---------------------------------------------------------------------------------
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

      // ---- Intercepta fetch
      const originalFetch = window.fetch;
      window.fetch = function (...args) {
        const startTime = performance.now();
        const url = args[0] instanceof Request ? args[0].url : args[0];
        const method = args[0] instanceof Request ? args[0].method : (args[1]?.method || 'GET');
        const shortUrl = (url || '').split('/').pop().split('?')[0] || url;

        const row = document.createElement('tr');
        row.className = 'network-row';
        row.innerHTML = `
          <td class="url">${escapeHTML(shortUrl)}</td>
          <td class="status-pending">pendente...</td>
          <td>${escapeHTML(method)}</td>
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
          console.error(`${LOG_PREFIX} Erro de rede interceptado (fetch):`, error);
        });

        return fetchPromise;
      };

      // ---- Intercepta XHR
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        this.__requestInfo = { method, url };
        return originalOpen.apply(this, arguments);
      };

      XMLHttpRequest.prototype.send = function (body) {
        const startTime = performance.now();
        const info = this.__requestInfo || { method: 'GET', url: 'desconhecido' };
        const shortUrl = (info.url || '').split('/').pop().split('?')[0] || info.url;

        const row = document.createElement('tr');
        row.className = 'network-row';
        row.innerHTML = `
          <td class="url">${escapeHTML(shortUrl)}</td>
          <td class="status-pending">pendente...</td>
          <td>${escapeHTML(info.method)}</td>
          <td class="time">...</td>
        `;
        if (networkLogBody) networkLogBody.prepend(row);

        this.addEventListener('loadend', () => {
          const duration = (performance.now() - startTime).toFixed(0);
          const statusCell = row.querySelector('td:nth-child(2)');
          if (statusCell) {
            statusCell.textContent = `${this.status} ${this.statusText || ''}`.trim();
            statusCell.className = (this.status >= 200 && this.status < 400) ? 'status-ok' : 'status-error';
          }
          const timeCell = row.querySelector('.time');
          if (timeCell) timeCell.textContent = `${duration} ms`;
        });

        this.addEventListener('error', () => {
          const duration = (performance.now() - startTime).toFixed(0);
          const statusCell = row.querySelector('td:nth-child(2)');
          if (statusCell) {
            statusCell.textContent = 'Falhou';
            statusCell.className = 'status-error';
          }
          const timeCell = row.querySelector('.time');
          if (timeCell) timeCell.textContent = `${duration} ms`;
          console.error(`${LOG_PREFIX} Erro de rede interceptado (XHR).`);
        });

        return originalSend.apply(this, arguments);
      };
    }
    // ---------------------------------------------------------------------------------
    // MÓDULO 7: SUÍTE DE DIAGNÓSTICO
    // Responsável por rodar uma série de testes rápidos para identificar problemas comuns
    // na página, scripts, rede e performance.
    // ---------------------------------------------------------------------------------
    function addTestResult(message, type = 'info', solution = null) {
      // Adiciona uma linha no painel de resultados dos testes
      if (!testsOutput) return;

      const line = document.createElement('div');
      line.className = `console-line ${type}`;

      // Ícone conforme tipo do teste
      let icon = 'info';
      if (type === 'success') icon = 'check_circle';
      if (type === 'warn') icon = 'warning';
      if (type === 'error') icon = 'error';

      // HTML principal
      let html = `
        <span class="material-symbols-outlined console-icon">${icon}</span> 
        <div>${message.replace(/</g, '&lt;')}</div>
      `;

      // Solução sugerida (quando disponível)
      if (solution) {
        html += `
          <div style="margin-left:32px;margin-top:4px;font-size:12px;color:var(--text-secondary);">
            Sugestão: ${solution}
          </div>`;
      }

      line.innerHTML = html;
      testsOutput.appendChild(line);
      testsOutput.scrollTop = testsOutput.scrollHeight;
    }

    function runDiagnostics() {
      // Limpa resultados anteriores
      if (testsOutput) testsOutput.innerHTML = '';

      // --- Teste 1: Conectividade
      if (navigator.onLine) {
        addTestResult('Conexão com a internet: OK', 'success');
      } else {
        addTestResult('Sem conexão com a internet.', 'error',
          'Verifique sua rede ou cabo de internet.');
      }

      // --- Teste 2: LocalStorage
      try {
        localStorage.setItem('__test__', '1');
        localStorage.removeItem('__test__');
        addTestResult('LocalStorage acessível.', 'success');
      } catch (e) {
        addTestResult('Falha ao acessar LocalStorage.', 'error',
          'Verifique se o navegador está em modo privado ou se há bloqueios.');
      }

      // --- Teste 3: Performance API
      if (performance && performance.now) {
        const t = performance.now();
        addTestResult(`Performance API disponível (now=${t.toFixed(2)}ms).`, 'success');
      } else {
        addTestResult('Performance API não suportada.', 'warn',
          'Atualize para um navegador mais moderno.');
      }

      // --- Teste 4: Fetch API
      if (window.fetch) {
        addTestResult('Fetch API disponível.', 'success');
      } else {
        addTestResult('Fetch API não suportada.', 'error',
          'Necessário polyfill ou navegador atualizado.');
      }

      // --- Teste 5: Erros capturados
      if (capturedErrors.length > 0) {
        capturedErrors.forEach(err =>
          addTestResult(`Erro capturado: ${err}`, 'error')
        );
      } else {
        addTestResult('Nenhum erro capturado até agora.', 'success');
      }
    }

    if (runTestsButton) {
      runTestsButton.addEventListener('click', runDiagnostics);
    }

    // ---------------------------------------------------------------------------------
    // MÓDULO 8: INICIALIZAÇÃO FINAL
    // Responsável por ligar todos os módulos e garantir o funcionamento do painel.
    // ---------------------------------------------------------------------------------

    // Inicializa abas "Info" e "Storage"
    populateInfoTab();
    populateStorageTab();

    // Inicializa interceptador de rede
    initializeNetworkInterceptor();

    // Observa alterações de tamanho da janela para atualizar info
    window.addEventListener('resize', populateInfoTab);

    // Força atualização da árvore DOM (Elements Tab) se algo mudar no DOM
    const observer = new MutationObserver(() => {
      document.dispatchEvent(new Event('devtools:refresh-dom-tree'));
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Mensagem de confirmação no console do navegador
    console.info('%cPainel de Diagnóstico inicializado (v5.2.0)', 'color: green; font-weight: bold;');

  }); // fim do DOMContentLoaded

})(); // fim da IIFE principal
