// ARQUIVO: status-checker.js
// RESPONSABILIDADE: Diagnóstico de componentes, carregamento de históricos e atualização da página de status.
// VERSÃO: 5.1.0

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÕES ---
    const REFRESH_INTERVAL_SECONDS = 60; // Atualiza a cada 60 segundos

    // --- ELEMENTOS DO DOM ---
    const resultsContainer = document.getElementById('status-results');
    const summaryContainer = document.getElementById('status-summary');
    const bannerContainer = document.getElementById('overall-status-banner');
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

    // --- FUNÇÃO PRINCIPAL ---
    async function updateAllStatusData() {
        console.log(`[Status v5.1.0] Verificando sistemas... ${new Date().toLocaleTimeString()}`);

        // 1. Roda os checks
        const componentResults = await runAllChecks();

        // 2. Carrega históricos
        loadUptimeHistory();
        loadIncidents();

        // 3. Atualiza banner geral
        updateOverallBanner(componentResults);

        // 4. Timestamp
        if (lastUpdatedSpan) {
            const now = new Date();
            lastUpdatedSpan.textContent = `Última verificação: ${now.toLocaleTimeString('pt-BR')}`;
        }
    }

    // --- VERIFICAÇÃO DE COMPONENTES ---
    async function runAllChecks() {
        if (!resultsContainer || !summaryContainer) return { criticalErrors: 0, warnings: 0 };

        // Checks fixos
        const checks = [
            { name: 'Dados da Home (conteudo-index.json)', url: 'conteudo-index.json', type: 'json' },
            { name: 'Script Principal (main.js)', url: 'main.js', type: 'script' },
            { name: 'Dependência Externa (Tailwind)', url: 'https://cdn.tailwindcss.com', type: 'external_script' }
        ];

        // Checks dinâmicos de artigos
        try {
            const response = await fetch('artigos.json', { cache: "no-store" });
            if (response.ok) {
                const artigos = await response.json();
                artigos.forEach(article => {
                    if (!article.pagina.endsWith('.html')) {
                        checks.push({
                            name: `Artigo: ${article.titulo}`,
                            url: `artigos/${article.pagina}.md`,
                            type: 'content'
                        });
                    }
                });
            }
        } catch (e) {
            console.warn("Não foi possível carregar artigos para validação dinâmica:", e);
        }

        let criticalErrors = 0, warnings = 0;
        resultsContainer.innerHTML = '';

        const checkPromises = checks.map(async (check) => {
            const result = await performCheck(check);
            if (result.status === STATUS_LEVEL.CRITICAL) criticalErrors++;
            if (result.status === STATUS_LEVEL.WARNING) warnings++;
            renderResult(result);
        });

        await Promise.all(checkPromises);

        if (criticalErrors > 0) {
            summaryContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-critical';
            summaryContainer.innerHTML = `<h3>Diagnóstico Concluído: ${criticalErrors} erro(s) crítico(s) encontrado(s).</h3>`;
        } else if (warnings > 0) {
            summaryContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-warning';
            summaryContainer.innerHTML = `<h3>Diagnóstico Concluído: Nenhum erro crítico, mas ${warnings} aviso(s) requerem atenção.</h3>`;
        } else {
            summaryContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-success';
            summaryContainer.innerHTML = '<h3>Diagnóstico Concluído: Todos os componentes estão operacionais.</h3>';
        }

        return { criticalErrors, warnings };
    }

    // --- CHECK INDIVIDUAL ---
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

            if (type === 'json') {
                try {
                    JSON.parse(content);
                } catch (e) {
                    return { name, status: STATUS_LEVEL.CRITICAL, detail: 'Erro de formatação JSON.', solution: `O arquivo não é um JSON válido. Verifique a sintaxe.` };
                }
            }
            return { name, status: STATUS_LEVEL.SUCCESS, detail };
        } catch (e) {
            return { name, status: STATUS_LEVEL.CRITICAL, detail: `Erro de rede ou parsing: ${e.message}`, solution: `Verifique o formato do arquivo ou sua conexão.` };
        }
    }

    // --- RENDERIZAÇÃO ---
    function renderResult({ name, status, detail, solution }) {
        let dotClass, blockClass;
        switch (status) {
            case STATUS_LEVEL.SUCCESS: dotClass = 'status-dot-green'; blockClass = 'result-block'; break;
            case STATUS_LEVEL.WARNING: dotClass = 'status-dot-yellow'; blockClass = 'result-block result-warning'; break;
            case STATUS_LEVEL.CRITICAL: dotClass = 'status-dot-red'; blockClass = 'result-block result-critical'; break;
        }
        const solutionHTML = solution ? `<div class="mt-2 pt-2 border-t border-dashed border-gray-500/20"><p class="text-sm"><strong class="font-semibold text-blue-600 dark:text-blue-400">Solução Sugerida:</strong> ${solution}</p></div>` : '';
        resultsContainer.innerHTML += `<div class="p-4 rounded-md ${blockClass}"><div class="flex items-center gap-4"><span class="status-dot ${dotClass}"></span><div class="flex-grow"><p class="font-semibold text-[var(--text-primary)]">${name}</p><p class="text-sm text-[var(--text-secondary)] font-mono">${detail}</p></div></div>${solutionHTML}</div>`;
    }

    // --- HISTÓRICO DE UPTIME ---
    async function loadUptimeHistory() {
        if (!uptimeGrid) return;
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

    // --- INCIDENTES ---
    async function loadIncidents() {
        if (!incidentsFeed) return;
        try {
            const response = await fetch('status-history.json');
            const data = await response.json();
            if (data.incidents.length === 0) {
                incidentsFeed.innerHTML = '<p class="text-[var(--text-secondary)]">Nenhum incidente recente. Tudo em ordem!</p>';
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
                            const [time] = update.timestamp.split(' ');
                            const [hour, minute] = time.split(':');
                            const incidentDate = new Date(incident.date);
                            const localTime = new Date(incidentDate.getFullYear(), incidentDate.getMonth(), incidentDate.getDate(), hour, minute);
                            const formattedTime = localTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
                            return `<div class="incident-update">
                                <p class="text-xs font-semibold text-[var(--text-secondary)]" title="Horário original: ${update.timestamp}">${formattedTime}</p>
                                <p class="text-sm mt-0.5">${update.description}</p>
                            </div>`
                        }).join('')}
                    </div>
                </article>`;
            }).join('');
        } catch (error) {
            incidentsFeed.innerHTML = '<p class="text-red-500">Não foi possível carregar o feed de incidentes.</p>';
        }
    }

    // --- BANNER ---
    function updateOverallBanner({ criticalErrors, warnings }) {
        if (!bannerContainer) return;
        if (criticalErrors > 0) {
            bannerContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-critical';
            bannerContainer.innerHTML = '🔴 Alguns sistemas estão com interrupção no serviço.';
        } else if (warnings > 0) {
            bannerContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-warning';
            bannerContainer.innerHTML = '🟡 Alguns sistemas apresentam degradação de performance.';
        } else {
            bannerContainer.className = 'mb-8 p-4 rounded-md text-center font-bold summary-success';
            bannerContainer.innerHTML = '🟢 Todos os sistemas estão operacionais.';
        }
    }

    // --- INICIALIZAÇÃO ---
    updateAllStatusData();
    setInterval(updateAllStatusData, REFRESH_INTERVAL_SECONDS * 1000);
});
