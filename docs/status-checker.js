// ARQUIVO: status-checker.js
// RESPONSABILIDADE: Verificar a saúde dos componentes do site e exibir na página status.html.

document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('status-results');
    const summaryContainer = document.getElementById('status-summary');

    if (!resultsContainer || !summaryContainer) {
        console.error("Elementos para exibir o status não foram encontrados na página.");
        return;
    }

    // Lista de componentes essenciais a serem verificados.
    const checks = [
        { name: 'Arquivo de dados da Home (conteudo-index.json)', url: 'conteudo-index.json', type: 'json' },
        { name: 'Arquivo de dados da Busca (busca-data.json)', url: 'busca-data.json', type: 'json' },
        { name: 'Artigo: Introdução (introducao.md)', url: 'artigos/introducao.md', type: 'file' },
        { name: 'Artigo: Alertas (alertas.md)', url: 'artigos/alertas.md', type: 'file' },
        { name: 'Artigo: Relatórios (relatorios.md)', url: 'artigos/relatorios.md', type: 'file' },
        { name: 'Script Principal (main.js)', url: 'main.js', type: 'file' },
        { name: 'Folha de Estilos (style.css)', url: 'style.css', type: 'file' },
        { name: 'Dependência Externa (Tailwind CSS)', url: 'https://cdn.tailwindcss.com?plugins=forms,container-queries', type: 'external' }
    ];

    let criticalErrors = 0;

    // Função para renderizar o resultado de cada verificação na tela.
    const renderResult = (name, success, message) => {
        const icon = success 
            ? '<span class="material-symbols-outlined text-green-500">check_circle</span>'
            : '<span class="material-symbols-outlined text-red-500">error</span>';
        
        const textColor = success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400';

        resultsContainer.innerHTML += `
            <div class="flex items-center p-4 rounded-md border ${success ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'}">
                ${icon}
                <div class="ml-3">
                    <p class="font-semibold ${textColor}">${name}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${message}</p>
                </div>
            </div>
        `;
    };

    // Função assíncrona que executa uma única verificação.
    const runCheck = async ({ name, url, type }) => {
        try {
            // Para dependências externas, uma requisição HEAD é suficiente e mais rápida.
            if (type === 'external') {
                await fetch(url, { method: 'HEAD', mode: 'no-cors' });
            } else {
                // Para arquivos locais, fazemos uma requisição completa para garantir que o conteúdo é válido.
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Arquivo não encontrado ou inacessível (Status: ${response.status})`);
                }
                // Se for um JSON, tentamos decodificá-lo para garantir que não está corrompido.
                if (type === 'json') {
                    await response.json();
                }
            }
            renderResult(name, true, 'Componente operacional.');
        } catch (error) {
            criticalErrors++;
            renderResult(name, false, `Falha ao carregar ou processar: ${error.message}`);
        }
    };

    // Função principal que orquestra todas as verificações.
    const runAllChecks = async () => {
        summaryContainer.innerHTML = '<p class="text-center text-lg">Verificando sistemas...</p>';
        resultsContainer.innerHTML = '';

        // Executa cada verificação da lista em sequência.
        for (const check of checks) {
            await runCheck(check);
        }

        // Exibe o sumário final com base nos resultados.
        if (criticalErrors === 0) {
            summaryContainer.className = 'mb-8 p-4 rounded-md text-center bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            summaryContainer.innerHTML = '<h3 class="font-bold text-lg">✅ Todos os sistemas estão operacionais.</h3>';
        } else {
            summaryContainer.className = 'mb-8 p-4 rounded-md text-center bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            summaryContainer.innerHTML = `<h3 class="font-bold text-lg">❌ ${criticalErrors} erro(s) crítico(s) detectado(s).</h3>`;
        }
    };

    runAllChecks();
});
