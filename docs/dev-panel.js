// ==========================
// Super Proteção v1.7.0
// Painel de Desenvolvimento (dev-panel.js)
// ==========================

(function () {
  let panel, content, tabs;
  let activeTab = "console";

  // Logs interceptados
  const logs = [];

  // Criação do painel
  function createPanel() {
    panel = document.createElement("div");
    panel.id = "dev-tools-panel";

    panel.innerHTML = `
      <header>
        <h3>Painel de Desenvolvedor</h3>
        <button id="dev-close">Fechar</button>
      </header>
      <div id="dev-tools-tabs">
        <button data-tab="console" class="active">Console</button>
        <button data-tab="dom">DOM</button>
        <button data-tab="storage">Storage</button>
        <button data-tab="network">Network</button>
        <button data-tab="performance">Performance</button>
        <button data-tab="testes">Testes</button>
      </div>
      <div id="dev-tools-content"></div>
    `;

    document.body.appendChild(panel);

    content = panel.querySelector("#dev-tools-content");
    tabs = panel.querySelectorAll("#dev-tools-tabs button");

    // Eventos
    panel.querySelector("#dev-close").onclick = () => panel.classList.remove("open");
    tabs.forEach(tab => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));
  }

  // Alternar aba
  function switchTab(tab) {
    activeTab = tab;
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
    renderContent();
  }

  // Renderizar conteúdo por aba
  function renderContent() {
    if (!content) return;

    if (activeTab === "console") {
      content.innerHTML = logs.map(
        log => `<div class="dev-log-${log.type}">[${log.type.toUpperCase()}] ${log.msg}</div>`
      ).join("") || "<em>Nenhum log.</em>";
    }

    if (activeTab === "dom") {
      content.innerHTML = `<pre>${escapeHTML(document.documentElement.outerHTML.substring(0, 2000))}...</pre>`;
    }

    if (activeTab === "storage") {
      let html = "<h4>localStorage</h4><pre>" + escapeHTML(JSON.stringify(localStorage, null, 2)) + "</pre>";
      html += "<h4>sessionStorage</h4><pre>" + escapeHTML(JSON.stringify(sessionStorage, null, 2)) + "</pre>";
      content.innerHTML = html;
    }

    if (activeTab === "network") {
      content.innerHTML = "<em>Monitoramento de rede ainda não implementado.</em>";
    }

    if (activeTab === "performance") {
      const perf = performance.getEntriesByType("navigation")[0];
      content.innerHTML = `<pre>${escapeHTML(JSON.stringify(perf, null, 2))}</pre>`;
    }

    if (activeTab === "testes") {
      content.innerHTML = `
        <div id="tester-results">
          <p class="text-sm text-[var(--text-secondary)]">Resultados dos testes automáticos aparecerão aqui.</p>
          <button id="run-tests" class="mt-2 px-3 py-1 border rounded bg-[var(--background-secondary)] hover:bg-[var(--background-primary)]">
            Rodar Testes
          </button>
        </div>
      `;
      const runBtn = content.querySelector("#run-tests");
      if (runBtn) {
        runBtn.addEventListener("click", () => {
          if (window.runAllTests) {
            window.runAllTests();
          } else {
            alert("tester.js não carregado.");
          }
        });
      }
    }
  }

  // Utilitário para escapar HTML
  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (m) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[m];
    });
  }

  // Interceptar logs
  ["log", "warn", "error", "info"].forEach(type => {
    const orig = console[type];
    console[type] = function (...args) {
      logs.push({ type, msg: args.join(" ") });
      if (activeTab === "console") renderContent();
      orig.apply(console, args);
    };
  });

  // Atalho com F12 (para não conflitar com DevTools real, use Shift+F12)
  window.addEventListener("keydown", e => {
    if (e.key === "F12" && e.shiftKey) {
      if (!panel) createPanel();
      panel.classList.toggle("open");
      renderContent();
      e.preventDefault();
    }
  });

})();
