// ==========================
// Super Proteção v1.7.0
// Script principal (main.js)
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  console.info("Super Proteção v1.7.0 - main.js carregado");

  // --- Controle de versão no rodapé ---
  const versionInfo = document.getElementById("version-info");
  if (versionInfo) {
    versionInfo.textContent = "v1.7.0";
  }

  // --- Alternar tema (claro/escuro) ---
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const html = document.documentElement;
      const isDark = html.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");

      // Atualiza ícone
      const icon = themeToggle.querySelector(".material-symbols-outlined");
      if (icon) {
        icon.textContent = isDark ? "light_mode" : "dark_mode";
      }

      console.log(`Tema alterado para: ${isDark ? "🌑 Escuro" : "☀️ Claro"}`);
    });
  }

  // --- Toast de erro reutilizável ---
  function showErrorToast(message) {
    const toast = document.getElementById("error-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 4000);
  }

  // Expor globalmente para outros scripts
  window.showErrorToast = showErrorToast;

  // --- Sidebar mobile (se existir em alguma página futura) ---
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("hidden");
    });
  }

  // --- Acessibilidade: foco visível ao navegar por teclado ---
  function handleFirstTab(e) {
    if (e.key === "Tab") {
      document.body.classList.add("user-is-tabbing");
      window.removeEventListener("keydown", handleFirstTab);
    }
  }
  window.addEventListener("keydown", handleFirstTab);
});
