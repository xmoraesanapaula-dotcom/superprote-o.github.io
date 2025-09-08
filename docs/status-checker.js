// ARQUIVO: status-checker.js
// RESPONSABILIDADE: Realizar um diagnóstico detalhado dos componentes do site.
// VERSÃO: 2.2.0 (Correção definitiva de Cores e Verificação Externa)

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
    
    const statusTextMap = {
        200: "OK",
        404: "Not Found",
        500: "Internal Server Error"
    };

    const checks = [
        { name: 'Dados da Home (conteudo-index.json)', url: 'conteudo-index.json', type: 'json' },
        { name: 'Dados da Busca (busca-data.json)', url: 'busca-data.json', type: 'json' },
        { name: 'Artigo: Introdução', url: 'artigos/introducao.md', type: 'content' },
        { name: 'Artigo: Alertas', url: 'artigos/alertas.md', type: 'content' },
        { name: 'Artigo: Relatórios', url: 'artigos/relatorios.md', type: 'content' },
        { name: 'Script Principal (main.js)', url: 'main.js', type: 'script' },
        { name: 'Script da Busca (busca.js)', url: 'busca.js', type: 'script' },
        { name: 'Folha de Estilos (style.css)', url: 'style.css', type: 'content' },
        { name: 'Dependência Externa (Tailwind)', url: 'https://cdn.tailwindcss.com', type: 'external_script' }
    ];

    let criticalErrors = 0;
    let warnings = 0;

    const renderResult = ({ name, status, detail, solution }) => {
        let dotClass, blockClass;

        switch (status) {
            case STATUS.SUCCESS:
                dotClass = 'status-dot-green';
                blockClass = 'result-block';
                break;
            case STATUS.WARNING:
                dotClass = 'status-dot-yellow';
                blockClass = 'result-block result-warning';
                break;
            case STATUS.CRITICAL:
                dotClass = 'status-dot-red';
                blockClass = 'result-block result-critical';
                break;
        }

        const solutionHTML = solution ? `<div class="mt-2 pt-2 border-t border-dashed border-gray-500/20">
            <p class="text-sm"><strong class="font-semibold text-blue-600 dark:text-blue-400">Solução Sugerida:</strong> ${solution}</p>
        </div>` : '';

        resultsContainer.innerHTML += `
            <div class="p-4 rounded-md ${blockClass}">
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
    
    // Função que verifica se um SCRIPT externo foi carregado.
    const checkExternalScript = ({ name, url }) => {
        const found = document.querySelector(`script[src^="${url}"]`);
        if (found) {
            renderResult({
                name,
                status: STATUS.SUCCESS,
                detail: 'Script de dependência encontrado no HTML.',
                solution: null
            });
        } else {
            criticalErrors++;
            renderResult({
                name,
                status: STATUS.CRITICAL,
                detail: 'Tag de script não encontrada no documento.',
                solution: `Verifique se a tag <script src="${url}..."> está presente no <head> do HTML.`
            });
        }
    };
    
    const runCheck = async ({ name, url, type }) => {
        if (type === 'external_script') {
            checkExternalScript({ name, url });
            return;
        }

        try {
            const response = await fetch(url);
            const statusText = statusTextMap[response.status] || response.statusText || 'OK';
            const detail = `Status HTTP: ${response.status} (${statusText})`;

            if (!response.ok) {
                criticalErrors++;
                renderResult({
                    name,
                    status: STATUS.CRITICAL,
                    detail,
                    solution: `O arquivo não foi encontrado ou o servidor retornou um erro. Verifique se o caminho do arquivo ("${url}") está correto.`
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
                    solution: `O arquivo está vazio. Embora acessível, ele não contém dados e pode causar falhas. Adicione o conteúdo necessário.`
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
                        solution: `O arquivo não é um JSON válido. Verifique a sintaxe em busca de erros (vírgulas, chaves, aspas).`
                    });
                    return;
                }
            }

            renderResult({ name, status: STATUS.SUCCESS, detail, solution: null });

        } catch (error) {
            criticalErrors++;
            renderResult({
                name,
                status: STATUS.CRITICAL,
                detail: `Erro de rede: ${error.message}`,
                solution: `Não foi possível acessar o arquivo. Verifique sua conexão com a internet ou possíveis bloqueios no console do navegador.`
            });
        }
    };

    const runAllChecks = async () => {
        summaryContainer.innerHTML = '<p class="text-center text-lg text-[var(--text-secondary)]">Analisando componentes...</p>';
        resultsContainer.innerHTML = '';

        for (const check of checks) {
            await runCheck(check);
        }

        if (criticalErrors > 0) {
            summaryContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-critical';
            summaryContainer.innerHTML = `<h3>Diagnóstico Concluído: ${criticalErrors} erro(s) crítico(s) e ${warnings} aviso(s) encontrado(s).</h3>`;
        } else if (warnings > 0) {
            summaryContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-warning';
            summaryContainer.innerHTML = `<h3>Diagnóstico Concluído: Nenhum erro crítico, mas ${warnings} aviso(s) requerem atenção.</h3>`;
        } else {
            summaryContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-success';
            summaryContainer.innerHTML = '<h3>Diagnóstico Concluído: Todos os sistemas estão operacionais.</h3>';
        }
    };

    runAllChecks();
});
