<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Proteção - Busca</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
</head>
<body>
    <header class="header">
        <h1>🔍 Busca</h1>
        <button id="theme-toggle" class="theme-toggle">
            <span class="material-symbols-outlined">dark_mode</span>
        </button>
    </header>

    <main class="content">
        <input id="search-input" type="text" placeholder="Digite para buscar..." class="search-input" />
        <div id="search-results" class="results"></div>
    </main>

    <footer class="footer">
        <span>Super Proteção</span>
        <span id="version-info">v1.7.1</span>
    </footer>

    <!-- Botão e painel Dev Tools -->
    <div id="dev-tools-trigger" class="dev-trigger">🛠️ Dev</div>
    <div id="dev-tools-panel" class="hidden"></div>

    <!-- Scripts -->
    <script src="main.js"></script>
    <script src="busca.js"></script>
    <script src="dev-panel.js"></script>
    <script src="tester.js"></script>
</body>
</html>
