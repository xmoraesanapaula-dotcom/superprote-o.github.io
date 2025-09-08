<!DOCTYPE html>
<html lang="pt-BR" class="bg-[var(--background-primary)] text-[var(--text-primary)]">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Super Proteção - Busca</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
</head>
<body class="min-h-screen flex flex-col bg-[var(--background-primary)] text-[var(--text-primary)]">

  <!-- Header -->
  <header class="px-6 py-4 flex justify-between items-center border-b border-[var(--secondary-color)] bg-[var(--background-secondary)]">
    <h1 class="text-xl font-bold">🔍 Busca</h1>
    <button id="theme-toggle" class="flex items-center gap-2 px-3 py-1 border rounded">
      <span class="material-symbols-outlined">dark_mode</span>
      Tema
    </button>
  </header>

  <!-- Conteúdo -->
  <main class="flex-1 p-6 space-y-6">
    <input
      id="search-input"
      type="text"
      placeholder="Digite para buscar..."
      class="w-full px-4 py-2 border rounded bg-[var(--background-secondary)] text-[var(--text-primary)]"
    />

    <div id="search-results" class="space-y-4"></div>
  </main>

  <!-- Rodapé -->
  <footer class="px-6 py-4 border-t border-[var(--secondary-color)] text-sm text-[var(--text-secondary)] flex justify-between">
    <span>Super Proteção</span>
    <span id="version-info">v1.7.1</span>
  </footer>

  <!-- Botão Dev Tools -->
  <div id="dev-tools-trigger" class="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg cursor-pointer z-50">
    🛠️ Dev
  </div>
  <div id="dev-tools-panel" class="hidden"></div>

  <!-- Scripts -->
  <script src="main.js"></script>
  <script src="busca.js"></script>
  <script src="dev-panel.js"></script>
  <script src="tester.js"></script>
</body>
</html>
