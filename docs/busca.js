// ARQUIVO: busca.js
// RESPONSABILIDADE: Controlar a lógica da página de busca (filtros, ordenação, renderização).

document.addEventListener('DOMContentLoaded', () => {
    // Seletores dos elementos da página
    const resultsContainer = document.getElementById('results-container');
    const resultsCountElement = document.getElementById('results-count');
    const topicFilters = document.getElementById('topic-filters');
    const difficultyFilters = document.getElementById('difficulty-filters');
    const sortByElement = document.getElementById('sort-by');
    
    let allData = []; // Variável para armazenar todos os dados carregados

    // Função para renderizar os resultados na tela
    const renderResults = (results) => {
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="text-[var(--text-secondary)]">Nenhum resultado encontrado para os filtros selecionados.</p>';
            return;
        }

        results.forEach(item => {
            // O 'href' agora usa os anchors gerados a partir do conteúdo
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
        let filteredData = [...allData];

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

    // Função para carregar os dados e iniciar a página
    async function initializeSearch() {
        try {
            const response = await fetch('busca-data.json');
            if (!response.ok) {
                throw new Error('Falha ao carregar o arquivo de dados da busca.');
            }
            allData = await response.json();
            
            // Adiciona os listeners de eventos APÓS os dados serem carregados
            topicFilters.addEventListener('change', updateResults);
            difficultyFilters.addEventListener('change', updateResults);
            sortByElement.addEventListener('change', updateResults);

            // Renderiza os resultados iniciais
            updateResults();
            console.log("Sistema de busca inicializado com sucesso.");

        } catch (error) {
            console.error(error);
            if (resultsContainer) {
                resultsContainer.innerHTML = '<p class="text-red-500">Ocorreu um erro ao carregar os dados da busca. Tente recarregar a página.</p>';
            }
        }
    }

    // Inicia todo o processo
    initializeSearch();
});
