// ==========================
// Super Proteção v1.7.0
// Carregador de documentos (doc-loader.js)
// ==========================

// Usa a lib marked.js para converter markdown → HTML
// Adiciona recursos: sumário, scrollspy, blocos de código formatados.

document.addEventListener("DOMContentLoaded", () => {
  console.info("doc-loader.js v1.7.0 iniciado");

  const container = document.getElementById("markdown-content");
  if (!container) {
    console.error("Elemento #markdown-content não encontrado.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const pagina = params.get("pagina") || "introducao";
  const url = `artigos/${pagina}.md`;

  // Carregar Markdown
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      return res.text();
    })
    .then(text => {
      renderMarkdown(text);
      gerarToC();
      aplicarScrollSpy();
      melhorarBlocosCodigo();
    })
    .catch(err => {
      console.error("Falha ao carregar markdown:", err);
      if (window.showErrorToast) {
        window.showErrorToast("Erro ao carregar o documento.");
      }
      container.innerHTML = `<p class="text-red-600">Erro ao carregar documento.</p>`;
    });

  // Renderizar markdown
  function renderMarkdown(mdText) {
    try {
      const html = marked.parse(mdText);
      container.innerHTML = html;
    } catch (err) {
      console.error("Erro ao converter markdown:", err);
      container.innerHTML = `<p class="text-red-600">Erro ao renderizar markdown.</p>`;
    }
  }

  // Gerar Sumário (h2, h3, h4)
  function gerarToC() {
    const toc = document.getElementById("toc-container");
    if (!toc) return;
    toc.innerHTML = "";

    const headings = container.querySelectorAll("h2, h3, h4");
    if (!headings.length) {
      toc.innerHTML = `<p class="text-[var(--text-secondary)]">Nenhum título encontrado.</p>`;
      return;
    }

    headings.forEach(h => {
      if (!h.id) {
        h.id = h.textContent.toLowerCase().replace(/\s+/g, "-");
      }
      const link = document.createElement("a");
      link.href = `#${h.id}`;
      link.textContent = h.textContent;
      link.className =
        "block pl-2 py-1 rounded hover:bg-[var(--background-secondary)]";

      if (h.tagName === "H3") link.classList.add("pl-4", "text-sm");
      if (h.tagName === "H4") link.classList.add("pl-6", "text-xs");

      toc.appendChild(link);
    });
  }

  // ScrollSpy
  function aplicarScrollSpy() {
    const toc = document.getElementById("toc-container");
    if (!toc) return;

    const links = toc.querySelectorAll("a");
    const headings = Array.from(container.querySelectorAll("h2, h3, h4"));

    function onScroll() {
      let current = "";
      const scrollY = window.scrollY + 100;
      headings.forEach(h => {
        if (h.offsetTop <= scrollY) {
          current = h.id;
        }
      });
      links.forEach(link => {
        link.classList.remove("text-blue-600", "font-semibold");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("text-blue-600", "font-semibold");
        }
      });
    }

    window.addEventListener("scroll", onScroll);
    onScroll();
  }

  // Melhorias para blocos de código
  function melhorarBlocosCodigo() {
    const blocks = container.querySelectorAll("pre > code");
    blocks.forEach((block, idx) => {
      const pre = block.parentElement;
      pre.style.position = "relative";

      // Cabeçalho do bloco
      const header = document.createElement("div");
      header.className =
        "flex justify-between items-center px-2 py-1 text-xs bg-[var(--background-secondary)] border-b border-[var(--secondary-color)] rounded-t";
      header.innerHTML = `<span>Bloco ${idx + 1}</span>`;

      // Botão copiar
      const btn = document.createElement("button");
      btn.textContent = "Copiar";
      btn.className =
        "px-2 py-0.5 text-xs border rounded hover:bg-[var(--background-primary)]";
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(block.innerText).then(() => {
          btn.textContent = "Copiado!";
          setTimeout(() => (btn.textContent = "Copiar"), 2000);
        });
      });

      header.appendChild(btn);
      pre.insertBefore(header, block);
    });
  }
});
