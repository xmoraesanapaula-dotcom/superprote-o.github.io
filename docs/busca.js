// ARQUIVO: busca.js
// RESPONSABILIDADE: Controlar a lógica da página de busca (filtros, ordenação, renderização).

document.addEventListener('DOMContentLoaded', () => {
    // Seletores dos elementos da página
    const resultsContainer = document.getElementById('results-container');
    const resultsCountElement = document.getElementById('results-count');
    const topicFilters = document.getElementById('topic-filters');
    const difficultyFilters = document.getElementById('difficulty-filters');
    const sortByElement = document.getElementById('sort-by');

    // Dados de exemplo (simulando um banco de dados)
    // ATUALIZADO: Adicionado 'page' e 'anchor' para criar links funcionais
    const mockData = [
        {
            id: 1,
            title: 'Introdução aos Webhooks',
            description: 'Aprenda o básico sobre como os webhooks funcionam e como podem notificar seus sistemas em tempo real.',
            category: 'webhook',
            difficulty: 'iniciante',
            date: '2025-09-01',
            page: 'introducao',
            anchor: 'heading-1-H2' // ID da seção 'Webhooks'
        },
        {
            id: 2,
            title: 'Boas Práticas de Segurança para APIs',
            description: 'Proteja seus endpoints com as melhores práticas de segurança do mercado, incluindo autenticação e autorização.',
            category: 'seguranca',
            difficulty: 'avancado',
            date: '2025-08-15',
            page: 'introducao',
            anchor: 'heading-6-H2' // ID da seção 'Boas Práticas de Segurança Digital'
        },
        {
            id: 3,
            title: 'Integrando com a API do Telegram',
            description: 'Um guia passo a passo para configurar notificações e alertas automáticos diretamente no Telegram.',
            category: 'integracao',
            difficulty: 'intermediario',
            date: '2025-07-20',
            page: 'introducao',
            anchor: 'heading-3-H3' // ID da subseção 'Integração com Telegram'
        },
        {
            id: 4,
            title: 'Validando Payloads de Webhooks com Assinaturas',
            description: 'Um tutorial avançado sobre como garantir que as requisições de webhooks são autênticas e seguras.',
            category: 'webhook',
            difficulty: 'avancado',
            date: '2025-09-05',
            page: 'introducao',
            anchor: 'heading-8-H3' // ID da subseção 'Uso Correto de Webhooks'
        },
        {
            id: 5,
            title: 'Referência Completa da API REST',
            description: 'Documentação detalhada de todos os endpoints disponíveis na nossa API, com exemplos de requisição e resposta.',
            category: 'api',
            difficulty: 'intermediario',
            date: '2025-06-30',
            page: 'relatorios', // Exemplo apontando para outra página
            anchor: 'heading-0-H1'
        },
        {
            id: 6,
            title: 'Conceitos Fundamentais de Segurança Digital',
            description: 'Entenda os princípios de confidencialidade, integridade e disponibilidade para criar sistemas mais robustos.',
            category: 'seguranca',
            difficulty: 'iniciante',
            date: '2025-08-25',
            page: 'introducao',
            anchor: 'heading-6-H2' // ID da seção 'Boas Práticas de Segurança Digital'
        }
    ];

    // Função para renderizar os resultados na tela
    const renderResults = (results) => {
        resultsContainer.innerHTML = '';

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="text-[var(--text-secondary)]">Nenhum resultado encontrado para os filtros selecionados.</p>';
            return;
        }

        results.forEach(item => {
            // ATUALIZADO: O 'href' agora é construído dinamicamente
            const resultCard = `
                <div class="card bg-[var(--background-primary)] p-6 rounded-md shadow-sm border border-[var(--secondary-color)] hover:shadow-md transition-shadow">
                    <a class="block" href="documento.html?pagina=${item.page}#${item.anchor}">
                        <h3 class="text-lg font-semibold text-[var(--text-primary)] hover:text-blue-600">${item.title}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Categoria: <span class="font-medium text-[var(--text-secondary)]">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                            <span class="mx-2">|</span>
                            Nível: <span class="font-medium text-[var(--text-secondary)]">${item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}</span>
                        </p>
                        <p class="text-[var(--text-secondary)] mt-2 text-sm">${item.description}</p>
                    </a>
                </div>
            `;
            resultsContainer.innerHTML += resultCard;
        });
    };

    // Função principal que filtra, ordena e renderiza os resultados
    const updateResults = () => {
        let filteredData = [...mockData];

        const checkedTopics = [...topicFilters.querySelectorAll('input:checked')].map(input => input.value);
        if (checkedTopics.length > 0) {
            filteredData = filteredData.filter(item => checkedTopics.includes(item.category));
        }

        const checkedDifficulty = difficultyFilters.querySelector('input:checked');
        if (checkedDifficulty) {
            filteredData = filteredData.filter(item => item.difficulty === checkedDifficulty.value);
        }

        const sortBy = sortByElement.value;
        if (sortBy === 'date') {
            filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        resultsCountElement.innerHTML = `Mostrando <span class="font-bold text-[var(--text-primary)]">${filteredData.length} resultados</span>`;
        
        renderResults(filteredData);
    };

    topicFilters.addEventListener('change', updateResults);
    difficultyFilters.addEventListener('change', updateResults);
    sortByElement.addEventListener('change', updateResults);

    updateResults();
});
