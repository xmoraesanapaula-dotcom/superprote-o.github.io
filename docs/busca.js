// ARQUIVO: busca.js
// RESPONSABILIDADE: Controlar a lógica da página de busca (filtros, ordenação, renderização).

document.addEventListener('DOMContentLoaded', () => {
    // Seletores dos elementos da página
    const mainSearchInput = document.getElementById('main-search-input');
    const resultsContainer = document.getElementById('results-container');
    const noResultsMessage = document.getElementById('no-results-message');
    const categoryGroups = document.querySelectorAll('.search-results-group');
    
    let allData = []; // Variável para armazenar todos os dados carregados

    // Objeto para mapear categorias a ícones e cores, para o novo design
    const categoryStyles = {
        webhook: { icon: 'webhook', color: 'search-icon-bg-red' },
        seguranca: { icon: 'security', color: 'search-icon-bg-orange' },
        integracao: { icon: 'integration_instructions', color: 'search-icon-bg-teal' },
        api: { icon: 'code', color: 'search-icon-bg-purple' }
    };

    // Função para renderizar os resultados na tela
    const renderResults = (results) => {
        // 1. Limpa o conteúdo de todos os grupos
        categoryGroups.forEach(group => {
            const grid = group.querySelector('.grid');
            if (grid) grid.innerHTML = '';
        });

        // 2. Preenche os grupos com os cards correspondentes
        results.forEach(item => {
            const style = categoryStyles[item.category] || { icon: 'article', color: 'search-icon-bg-blue' };
            const groupContainer = document.querySelector(`#group-${item.category} .grid`);
            
            if (groupContainer) {
                // ATUALIZADO: A estrutura interna do card foi ajustada com um 'div' flex-grow
                const resultCard = `
                    <a href="documento.html?pagina=${item.page}#${item.anchor}" class="search-card">
                        <div class="search-card-content">
                            <div class="search-card-header">
                                <div class="search-card-icon ${style.color}">
                                    <span class="material-symbols-outlined">${style.icon}</span>
                                </div>
                                <h3 class="search-card-title">${item.title}</h3>
                            </div>
                            <p class="search-card-description">${item.description}</p>
                        </div>
                        <div class="search-card-footer">
                            <span>Leia o artigo</span>
                            <span class="material-symbols-outlined ml-2">arrow_forward</span>
                        </div>
                    </a>
                `;
                groupContainer.innerHTML += resultCard;
            }
        });

        // 3. Mostra ou esconde os grupos e a mensagem de "nenhum resultado"
        let totalVisibleCards = 0;
        categoryGroups.forEach(group => {
            const grid = group.querySelector('.grid');
            if (grid && grid.children.length > 0) {
                group.style.display = 'block';
                totalVisibleCards += grid.children.length;
            } else {
                group.style.display = 'none';
            }
        });

        if (totalVisibleCards === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }
    };

    // Função que filtra os dados e chama a renderização
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
        try {
            const response = await fetch('busca-data.json');
            if (!response.ok) {
                throw new Error('Falha ao carregar o arquivo de dados da busca.');
            }
            allData = await response.json();
            
            mainSearchInput.addEventListener('input', updateResults);

            const urlParams = new URLSearchParams(window.location.search);
            const queryFromUrl = urlParams.get('q');
            if (queryFromUrl) {
                mainSearchInput.value = queryFromUrl;
            }

            updateResults();
            console.log("Sistema de busca (novo design) inicializado com sucesso.");

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
