// ==========================
// Super Proteção v1.7.0
// Testes automáticos (tester.js)
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  console.info("tester.js v1.7.0 carregado");

  // Lista de artigos para validar
  const artigos = [
    { id: "introducao", titulo: "Introdução", arquivo: "artigos/introducao.md" },
    { id: "alertas", titulo: "Alertas", arquivo: "artigos/alertas.md" },
    { id: "relatorios", titulo: "Relatórios", arquivo: "artigos/relatorios.md" }
  ];

  // Área de resultados (se a aba "Testes" estiver aberta)
  function updateUI(msg, type = "info") {
    const resultsDiv = document.getElementById("tester-results");
    if (resultsDiv) {
      const line = document.createElement("div");
      line.className = `dev-log-${type}`;
      line.textContent = `[${type.toUpperCase()}] ${msg}`;
      resultsDiv.appendChild(line);
    }
  }

  // --- TESTE 1: Markdown ---
  async function testarMarkdown() {
    for (let artigo of artigos) {
      try {
        const res = await fetch(artigo.arquivo);
        if (!res.ok) throw new Error(res.statusText);
        updateUI(`✔️ ${artigo.titulo} carregado com sucesso`, "success");
      } catch (e) {
        updateUI(`❌ Erro ao carregar ${artigo.titulo}: ${e.message}`, "error");
      }
    }
  }

  // --- TESTE 2: Tema ---
  function testarTema() {
    const html = document.documentElement;
    for (let i = 0; i < 2; i++) {
      html.classList.toggle("dark");
      const isDark = html.classList.contains("dark");
      updateUI(`Tema atual: ${isDark ? "🌑 Escuro" : "☀️ Claro"}`, "info");
    }
    html.classList.remove("dark");
  }

  // --- TESTE 3: Acessibilidade ---
  function testarAcessibilidade() {
    document.querySelectorAll("img:not([alt])").forEach(img =>
      updateUI(`Imagem sem ALT: ${img.src}`, "warn")
    );
    document.querySelectorAll("button:not([aria-label]):not(#theme-toggle)").forEach(btn =>
      updateUI(`Botão sem aria-label detectado: ${btn.outerHTML}`, "warn")
    );
  }

  // --- TESTE 4: Busca ---
  async function testarBusca() {
    try {
      const res = await fetch("artigos/introducao.md");
      const txt = await res.text();
      if (txt.toLowerCase().includes("login")) {
        updateUI("✔️ Busca encontrou 'login' em introducao.md", "success");
      } else {
        updateUI("❌ Busca não retornou 'login' em introducao.md", "error");
      }
    } catch (e) {
      updateUI(`Erro no teste de busca: ${e.message}`, "error");
    }
  }

  // Executar todos os testes
  async function runAllTests() {
    updateUI("=== Rodando testes automáticos v1.7.0 ===", "info");
    await testarMarkdown();
    testarTema();
    testarAcessibilidade();
    await testarBusca();
    updateUI("✅ Testes concluídos.", "success");
  }

  // Expor para o painel Dev
  window.runAllTests = runAllTests;

  // Roda automaticamente após carregamento inicial
  setTimeout(() => runAllTests(), 1000);
});
