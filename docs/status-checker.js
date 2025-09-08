// ARQUIVO: status-checker.js
// RESPONSABILIDADE: Realizar um diagnóstico detalhado dos componentes do site.
// VERSÃO: 2.0.0 (Diagnóstico Avançado)

document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('status-results');
    const summaryContainer = document.getElementById('status-summary');

    if (!resultsContainer || !summaryContainer) {
        console.error("Elementos para exibir o status não foram encontrados na página.");
        return;
    }

    const STATUS = {
        SUCCESS: 'SUCCESS',
        WARNING: 'WARNING',
        CRITICAL: 'CRITICAL'
    };

    // Lista de componentes a serem verificados com o tipo de verificação.
    const checks = [
        { name: 'Dados da Home (conteudo-index.json)', url: 'conteudo-index.json', type: 'json' },
        { name: 'Dados da Busca (busca-data.json)', url: 'busca-data.json', type: 'json' },
        { name: 'Artigo: Introdução', url: 'artigos/introducao.md', type: 'content' },
        { name: 'Artigo: Alertas', url: 'artigos/alertas.md', type: 'content' },
        { name: 'Artigo: Relatórios', url: 'artigos/relatorios.md', type: 'content' },
        { name: 'Script Principal (main.js)', url: 'main.js', type: 'script' },
        { name: 'Script da Busca (busca.js)', url: 'busca.js', type: 'script' },
        { name: 'Folha de Estilos (style.css)', url: 'style.css', type: 'content' },
        { name: 'Dependência Externa (Tailwind)', url: 'https://cdn.tailwindcss.com?plugins=forms,container-queries', type: 'external' }
    ];

    let criticalErrors = 0;
    let warnings = 0;

    // Função para renderizar o resultado de cada verificação na tela.
    const renderResult = ({ name, status, detail, solution }) => {
        let dotClass, borderColor, bgColor;

        switch (status) {
            case STATUS.SUCCESS:
                dotClass = 'status-dot-green';
                borderColor = 'border-gray-200 dark:border-gray-700';
                bgColor = 'bg-white dark:bg-gray-800';
                break;
            case STATUS.WARNING:
                dotClass = 'status-dot-yellow';
                borderColor = 'border-yellow-400/50 dark:border-yellow-600/50';
                bgColor = 'bg-yellow-50/50 dark:bg-yellow-900/20';
                break;
            case STATUS.CRITICAL:
                dotClass = 'status-dot-red';
                borderColor = 'border-red-400/50 dark:border-red-600/50';
                bgColor = 'bg-red-50/50 dark:bg-red-900/20';
                break;
        }

        const solutionHTML = solution ? `<div class="mt-2 pt-2 border-t border-dashed ${borderColor}">
            <p class="text-sm"><strong class="font-semibold text-blue-600 dark:text-blue-400">Solução Sugerida:</strong> ${solution}</p>
        </div>` : '';

        resultsContainer.innerHTML += `
            <div class="p-4 rounded-md border ${borderColor} ${bgColor}">
                <div class="flex items-center gap-4">
                    <span class="status-dot ${dotClass}"></span>
                    <div class="flex-grow">
                        <p class="font-semibold text-[var(--text-primary)]">${name}</p>
                        <p class="text-sm text-[var(--text-secondary)] font-mono">${detail}</p>
                    </div>
                </div>
                ${solutionHTML}
            </div>
        `;
    };
    
    // Função principal que executa uma verificação detalhada.
    const runCheck = async ({ name, url, type }) => {
        try {
            const response = await fetch(url);
            const detail = `Status HTTP: ${response.status} (${response.statusText})`;

            if (!response.ok) {
                criticalErrors++;
                renderResult({
                    name,
                    status: STATUS.CRITICAL,
                    detail,
                    solution: `O arquivo não foi encontrado ou o servidor retornou um erro. Verifique se o caminho do arquivo está correto e se ele foi enviado para o servidor.`
                });
                return;
            }

            const content = await response.text();
            if (content.trim() === '') {
                warnings++;
                renderResult({
                    name,
                    status: STATUS.WARNING,
                    detail,
                    solution: `O arquivo está vazio. Embora acessível, ele não contém dados e pode causar falhas em partes do site. Adicione o conteúdo necessário.`
                });
                return;
            }

            if (type === 'json') {
                try {
                    JSON.parse(content);
                } catch (e) {
                    criticalErrors++;
                    renderResult({
                        name,
                        status: STATUS.CRITICAL,
                        detail: 'Erro de formatação JSON.',
                        solution: `O arquivo não é um JSON válido. Verifique a sintaxe em busca de erros como vírgulas faltantes, chaves ou aspas incorretas.`
                    });
                    return;
                }
            }

            // Se tudo estiver certo
            renderResult({ name, status: STATUS.SUCCESS, detail, solution: null });

        } catch (error) {
            // Erros de rede (CORS, offline, etc.)
            criticalErrors++;
            renderResult({
                name,
                status: STATUS.CRITICAL,
                detail: `Erro de rede: ${error.message}`,
                solution: `Não foi possível acessar o arquivo. Verifique sua conexão com a internet ou possíveis bloqueios de CORS no console do navegador.`
            });
        }
    };

    // Função que orquestra todas as verificações.
    const runAllChecks = async () => {
        summaryContainer.innerHTML = '<p class="text-center text-lg text-[var(--text-secondary)]">Analisando componentes...</p>';
        resultsContainer.innerHTML = '';

        for (const check of checks) {
            await runCheck(check);
        }

        // Exibe o sumário final com base nos resultados.
        if (criticalErrors > 0) {
            summaryContainer.className = 'mb-8 p-4 rounded-md text-center bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            summaryContainer.innerHTML = `<h3 class="font-bold text-lg">Diagnóstico Concluído: ${criticalErrors} erro(s) crítico(s) e ${warnings} aviso(s) encontrado(s).</h3>`;
        } else if (warnings > 0) {
            summaryContainer.className = 'mb-8 p-4 rounded-md text-center bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            summaryContainer.innerHTML = `<h3 class="font-bold text-lg">Diagnóstico Concluído: Nenhum erro crítico, mas ${warnings} aviso(s) requerem atenção.</h3>`;
        } else {
            summaryContainer.className = 'mb-8 p-4 rounded-md text-center bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            summaryContainer.innerHTML = '<h3 class="font-bold text-lg">Diagnóstico Concluído: Todos os sistemas estão operacionais.</h3>';
        }
    };

    runAllChecks();
});
