// ARQUIVO: busca.js
// RESPONSABILIDADE: Controlar a lógica da página de busca (filtros, ordenação, renderização).
// VERSÃO: 3.1.0 (Com busca no conteúdo e highlight)

document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    const mainSearchInput = document.getElementById('main-search-input');
    
    let allData = []; // Variável para armazenar todos os dados carregados

    // Função para destacar o termo de busca nos resultados
    const highlightTerm = (text, term) => {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-700 rounded">$1</mark>');
    };

    // Função para renderizar os resultados na tela
    const renderResults = (results, searchTerm) => {
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="text-[var(--text-secondary)] text-center py-8">Nenhum resultado encontrado.</p>';
            return;
        }

        const resultsWrapper = document.createElement('div');
        resultsWrapper.className = 'space-y-6';

        results.forEach(item => {
            const highlightedTitle = highlightTerm(item.title, searchTerm);
            const highlightedDescription = highlightTerm(item.description, searchTerm);
            
            // NOVO: Adiciona um trecho do conteúdo se a busca for encontrada lá
            let contentSnippet = '';
            if (searchTerm && item.content.toLowerCase().includes(searchTerm)) {
                const index = item.content.toLowerCase().indexOf(searchTerm);
                const start = Math.max(0, index - 50);
                const end = Math.min(item.content.length, index + 50);
                const snippet = item.content.substring(start, end);
                contentSnippet = `
                    <p class="text-xs text-gray-500 mt-2">
                        ...${highlightTerm(snippet, searchTerm)}...
                    </p>
                `;
            }

            const resultCardHTML = `
                <div class="card bg-[var(--background-primary)] p-6 rounded-md shadow-sm border border-[var(--secondary-color)] hover:shadow-md transition-shadow">
                    <a class="block" href="documento.html?pagina=${item.page}#${item.anchor}">
                        <h3 class="text-lg font-semibold text-[var(--text-primary)] hover:text-blue-600">${highlightedTitle}</h3>
                        <p class="text-[var(--text-secondary)] mt-2 text-sm">${highlightedDescription}</p>
                        ${contentSnippet}
                    </a>
                </div>
            `;
            resultsWrapper.innerHTML += resultCardHTML;
        });
        resultsContainer.appendChild(resultsWrapper);
    };

    // Função principal que filtra e renderiza os resultados
    const updateResults = () => {
        let filteredData = [...allData];
        const searchTerm = mainSearchInput.value.toLowerCase().trim();

        if (searchTerm) {
            filteredData = filteredData.filter(item => 
                item.title.toLowerCase().includes(searchTerm) || 
                item.description.toLowerCase().includes(searchTerm) ||
                (item.content && item.content.toLowerCase().includes(searchTerm)) // <-- BUSCA NO CONTEÚDO
            );
        }
        
        renderResults(filteredData, mainSearchInput.value.trim());
    };

    // Função para carregar os dados e iniciar a página
    async function initializeSearch() {
        if (!mainSearchInput) {
            console.error("Elemento 'main-search-input' não encontrado. A busca não funcionará.");
            return;
        }
        
        try {
            const response = await fetch('busca-data.json');
            if (!response.ok) {
                throw new Error('Falha ao carregar o arquivo de dados da busca (busca-data.json). Verifique se o arquivo existe e está no lugar correto.');
            }
            allData = await response.json();
            
            mainSearchInput.addEventListener('input', updateResults);

            const urlParams = new URLSearchParams(window.location.search);
            const queryFromUrl = urlParams.get('q');
            if (queryFromUrl) {
                mainSearchInput.value = queryFromUrl;
            }

            updateResults();
            console.log("Sistema de busca v3.1.0 inicializado com sucesso.");

        } catch (error) {
            console.error(error);
            if (resultsContainer) {
                resultsContainer.innerHTML = `<p class="text-red-500 text-center py-8">${error.message}</p>`;
            }
        }
    }

    // Inicia todo o processo
    initializeSearch();
});
