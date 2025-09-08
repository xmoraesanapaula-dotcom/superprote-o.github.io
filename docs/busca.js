// ==========================
// Super Proteção v1.7.0
// Busca na documentação (busca.js)
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  console.info("busca.js v1.7.0 carregado");

  const input = document.getElementById("search-input");
  const resultsContainer = document.getElementById("search-results");

  if (!input || !resultsContainer) {
    console.error("Elementos da busca não encontrados.");
    return;
  }

  // Lista de artigos para indexar
  const artigos = [
    { id: "introducao", titulo: "Introdução", arquivo: "artigos/introducao.md" },
    { id: "alertas", titulo: "Alertas", arquivo: "artigos/alertas.md" },
    { id: "relatorios", titulo: "Relatórios", arquivo: "artigos/relatorios.md" }
  ];

  let indice = [];

  // Carregar artigos e montar índice
  Promise.all(
    artigos.map(a =>
      fetch(a.arquivo)
        .then(res => res.text())
        .then(texto => {
          indice.push({ ...a, conteudo: texto.toLowerCase() });
        })
        .catch(err => console.error(`Erro ao carregar ${a.arquivo}:`, err))
    )
  ).then(() => {
    console.log("✅ Índice de busca carregado");
  });

  // Função de busca
  function buscar(query) {
    query = query.toLowerCase().trim();
    if (!query) {
      resultsContainer.innerHTML =
        `<p class="text-[var(--text-secondary)]">Digite algo para buscar.</p>`;
      return;
    }

    const resultados = indice
      .map(a => {
        const pos = a.conteudo.indexOf(query);
        if (pos === -1) return null;

        // Cria snippet ao redor da ocorrência
        const start = Math.max(0, pos - 50);
        const end = Math.min(a.conteudo.length, pos + 150);
        const snippet = a.conteudo.substring(start, end)
          .replace(new RegExp(query, "gi"), match => `<mark>${match}</mark>`);

        return {
          id: a.id,
          titulo: a.titulo,
          snippet
        };
      })
      .filter(r => r !== null);

    if (!resultados.length) {
      resultsContainer.innerHTML =
        `<p class="text-red-600">Nenhum resultado encontrado para "<strong>${query}</strong>".</p>`;
      return;
    }

    resultsContainer.innerHTML = resultados.map(r => `
      <div class="p-4 border border-[var(--secondary-color)] rounded-lg bg-[var(--background-primary)]">
        <a href="documento.html?pagina=${r.id}" class="font-semibold text-blue-600 hover:underline">
          ${r.titulo}
        </a>
        <p class="mt-2 text-sm text-[var(--text-secondary)]">${r.snippet}...</p>
      </div>
    `).join("");
  }

  // Evento de digitação
  input.addEventListener("input", e => {
    buscar(e.target.value);
  });
});
