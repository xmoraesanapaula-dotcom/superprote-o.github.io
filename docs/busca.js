// ARQUIVO: busca.js
// RESPONSABILIDADE: Controlar a lógica da página de busca (filtros, ordenação, renderização).
// VERSÃO: 3.0.0

document.addEventListener('DOMContentLoaded', () => {
    // Seletores dos elementos da página (simplificado para o layout 3.0.0)
    const resultsContainer = document.getElementById('results-container');
    const mainSearchInput = document.getElementById('main-search-input');
    
    let allData = []; // Variável para armazenar todos os dados carregados

    // Função para renderizar os resultados na tela
    const renderResults = (results) => {
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="text-[var(--text-secondary)] text-center py-8">Nenhum resultado encontrado.</p>';
            return;
        }

        const resultsWrapper = document.createElement('div');
        resultsWrapper.className = 'space-y-6';

        results.forEach(item => {
            const resultCardHTML = `
                <div class="card bg-[var(--background-primary)] p-6 rounded-md shadow-sm border border-[var(--secondary-color)] hover:shadow-md transition-shadow">
                    <a class="block" href="documento.html?pagina=${item.page}#${item.anchor}">
                        <h3 class="text-lg font-semibold text-[var(--text-primary)] hover:text-blue-600">${item.title}</h3>
                        <p class="text-[var(--text-secondary)] mt-2 text-sm">${item.description}</p>
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
                item.description.toLowerCase().includes(searchTerm)
            );
        }
        
        renderResults(filteredData);
    };

    // Função para carregar os dados e iniciar a página
    async function initializeSearch() {
        // Garante que o input de busca exista antes de continuar
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
            console.log("Sistema de busca v3.0.0 inicializado com sucesso.");

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
