// ARQUIVO: status-checker.js
// RESPONSABILIDADE: Realizar diagnóstico, carregar históricos e atualizar a página de status.
// VERSÃO: 5.3.0 (Unificado A + B, adaptado para arquivos locais)

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÕES ---
    const REFRESH_INTERVAL_SECONDS = 60; // Atualiza a cada 60 segundos

    // --- ELEMENTOS DO DOM ---
    const resultsContainer = document.getElementById('status-results');
    const summaryContainer = document.getElementById('status-summary');
    const uptimeGrid = document.getElementById('uptime-grid');
    const incidentsFeed = document.getElementById('incidents-feed');
    const lastUpdatedSpan = document.getElementById('last-updated');

    // --- MAPAS DE TEXTO ---
    const statusTextMap = {
        operacional: 'Operacional',
        degradacao: 'Degradação de Performance',
        interrupcao: 'Interrupção',
        manutencao: 'Em Manutenção',
        resolvido: 'Resolvido',
        concluido: 'Concluído'
    };

    const httpStatusTextMap = { 200: "OK", 404: "Não Encontrado", 500: "Erro Interno" };
    const STATUS_LEVEL = { SUCCESS: 'SUCCESS', WARNING: 'WARNING', CRITICAL: 'CRITICAL' };

    // --- LÓGICA PRINCIPAL ---
    async function updateAllStatusData() {
        console.log(`[Status v5.3.0] Verificando todos os sistemas... ${new Date().toLocaleTimeString()}`);

        // 1. Roda os checks de componentes
        const { criticalErrors, warnings } = await runAllChecks();

        // 2. Carrega dados históricos
        loadUptimeHistory();
        loadIncidents();

        // 3. Atualiza resumo simplificado com base nos erros/avisos
        if (summaryContainer) {
            if (criticalErrors > 0) {
                summaryContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-critical';
                summaryContainer.innerHTML = `<p>Alguns componentes estão com interrupções.</p>`;
            } else if (warnings > 0) {
                summaryContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-warning';
                summaryContainer.innerHTML = `<p>Alguns componentes apresentam degradação de performance.</p>`;
            } else {
                summaryContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-success';
                summaryContainer.innerHTML = `<p>Todos os componentes estão operacionais.</p>`;
            }
        }

        // 4. Atualiza timestamp
        if (lastUpdatedSpan) {
            const now = new Date();
            lastUpdatedSpan.textContent = `Última verificação: ${now.toLocaleTimeString('pt-BR')}`;
        }
    }

    // --- CHECKS ---
    async function runAllChecks() {
        const checks = [
            { name: 'Dados da Home (conteudo-index.json)', url: 'conteudo-index.json', type: 'json' },
            { name: 'Dados da Busca (busca-data.json)', url: 'busca-data.json', type: 'json' },
            { name: 'Artigo: Introdução', url: 'artigos/introducao.md', type: 'content' },
            { name: 'Script Principal (main.js)', url: 'main.js', type: 'script' },
            { name: 'Folha de Estilos (style.css)', url: 'style.css', type: 'content' },
            { name: 'Dependência Externa (Tailwind)', url: 'https://cdn.tailwindcss.com', type: 'external_script' }
        ];

        let criticalErrors = 0, warnings = 0;
        resultsContainer.innerHTML = '';

        const checkPromises = checks.map(async (check) => {
            const result = await performCheck(check);
            if (result.status === STATUS_LEVEL.CRITICAL) criticalErrors++;
            if (result.status === STATUS_LEVEL.WARNING) warnings++;
            renderResult(result);
        });

        await Promise.all(checkPromises);
        return { criticalErrors, warnings };
    }

    async function performCheck({ name, url, type }) {
        if (type === 'external_script') {
            const found = document.querySelector(`script[src^="${url}"]`);
            return found
                ? { name, status: STATUS_LEVEL.SUCCESS, detail: 'Dependência externa carregada.' }
                : { name, status: STATUS_LEVEL.CRITICAL, detail: 'Tag de script não encontrada.', solution: `Verifique se a tag <script src="${url}..."> está no HTML.` };
        }
        try {
            const response = await fetch(url, { cache: "no-store" });
            const detail = `Status HTTP: ${response.status} (${httpStatusTextMap[response.status] || response.statusText})`;
            if (!response.ok) return { name, status: STATUS_LEVEL.CRITICAL, detail, solution: `Verifique se o caminho "${url}" está correto.` };

            const content = await response.text();
            if (content.trim() === '') return { name, status: STATUS_LEVEL.WARNING, detail, solution: `O arquivo está vazio e pode causar falhas.` };

            if (type === 'json') JSON.parse(content);
            return { name, status: STATUS_LEVEL.SUCCESS, detail };
        } catch (e) {
            return { name, status: STATUS_LEVEL.CRITICAL, detail: `Erro de formatação ou rede: ${e.message}`, solution: `Verifique o formato do arquivo ou sua conexão.` };
        }
    }

    function renderResult({ name, status, detail, solution }) {
        let dotClass, blockClass;
        switch (status) {
            case STATUS_LEVEL.SUCCESS: dotClass = 'status-dot-green'; blockClass = 'result-block'; break;
            case STATUS_LEVEL.WARNING: dotClass = 'status-dot-yellow'; blockClass = 'result-block result-warning'; break;
            case STATUS_LEVEL.CRITICAL: dotClass = 'status-dot-red'; blockClass = 'result-block result-critical'; break;
        }
        const solutionHTML = solution ? `<div class="mt-2 pt-2 border-t border-dashed border-gray-500/20"><p class="text-sm"><strong class="font-semibold text-blue-600 dark:text-blue-400">Solução:</strong> ${solution}</p></div>` : '';
        resultsContainer.innerHTML += `<div class="p-4 rounded-md ${blockClass}"><div class="flex items-center gap-4"><span class="status-dot ${dotClass}"></span><div class="flex-grow"><p class="font-semibold text-[var(--text-primary)]">${name}</p><p class="text-sm text-[var(--text-secondary)] font-mono">${detail}</p></div></div>${solutionHTML}</div>`;
    }

    // --- HISTÓRICO E INCIDENTES ---
    async function loadUptimeHistory() {
        try {
            const response = await fetch('status-history.json');
            const data = await response.json();
            const history = data.uptime_history.slice(0, 90);
            uptimeGrid.innerHTML = history.map(day => {
                const date = new Date(day.date + 'T12:00:00');
                const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                const statusText = statusTextMap[day.status] || day.status;
                return `<div class="uptime-day status-${day.status}" title="${formattedDate}: ${statusText}"></div>`;
            }).join('');
        } catch (error) {
            uptimeGrid.innerHTML = `<p class="col-span-15 text-red-500">Não foi possível carregar o histórico de uptime.</p>`;
        }
    }

    async function loadIncidents() {
        try {
            const response = await fetch('status-history.json');
            const data = await response.json();
            if (data.incidents.length === 0) {
                incidentsFeed.innerHTML = '<p class="text-[var(--text-secondary)]">Nenhum incidente recente.</p>';
                return;
            }
            incidentsFeed.innerHTML = data.incidents.map(incident => {
                const icon = incident.status === 'concluido' ? 'build' : 'check';
                return `<article class="incident-post">
                    <span class="incident-icon incident-status-${incident.status}"><span class="material-symbols-outlined text-sm">${icon}</span></span>
                    <p class="text-sm text-[var(--text-secondary)]">${new Date(incident.date + 'T12:00:00').toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
                    <h3 class="text-lg font-bold mt-1 text-[var(--text-primary)]">${incident.title}</h3>
                    <div class="mt-3 space-y-4">
                        ${incident.updates.map(update => {
                            return `<div class="incident-update">
                                <p class="text-xs font-semibold text-[var(--text-secondary)]">${update.timestamp}</p>
                                <p class="text-sm mt-0.5">${update.description}</p>
                            </div>`;
                        }).join('')}
                    </div>
                </article>`;
            }).join('');
        } catch (error) {
            incidentsFeed.innerHTML = '<p class="text-red-500">Não foi possível carregar o feed de incidentes.</p>';
        }
    }

    // --- INICIALIZAÇÃO ---
    updateAllStatusData();
    setInterval(updateAllStatusData, REFRESH_INTERVAL_SECONDS * 1000);
});
