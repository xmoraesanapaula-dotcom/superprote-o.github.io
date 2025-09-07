// Aguarda o conteúdo da página ser totalmente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    
    console.log("Super Proteção - Script de Monitoramento Ativado.");

    const versionInfo = document.getElementById('version-info');
    const statusIndicator = document.getElementById('status-indicator');
    
    // --- INICIALIZAÇÃO ---
    // Define a versão do projeto
    versionInfo.textContent = 'Nascemos como a versão 1.0';
    // Define o status inicial como 'OK' (verde)
    statusIndicator.classList.add('ok');
    statusIndicator.title = 'Todos os scripts foram carregados com sucesso.';

    // --- FERRAMENTA 1: Monitor Global de Erros (Error Catcher) ---
    // Esta função será chamada automaticamente se qualquer erro de JavaScript ocorrer na página.
    window.onerror = function(message, source, lineno, colno, error) {
        console.error("ERRO DETECTADO:", { message, source, lineno, error });
        
        // Mostra uma notificação visual na tela
        showErrorToast(`Erro detectado: ${message}`);

        // Muda o status para 'Erro' (vermelho)
        statusIndicator.classList.remove('ok');
        statusIndicator.classList.add('error');
        statusIndicator.title = `Erro no script! Veja o console (F12) para detalhes.`;

        return true; // Impede que o erro padrão apareça no console do navegador
    };

    // --- FERRAMENTA 2: Detector de Anomalias (Verificador de Links) ---
    // Procura por links que ainda são placeholders (href="#") e avisa o desenvolvedor no console.
    function checkLinkAnomalies() {
        const allLinks = document.querySelectorAll('a');
        let anomalyFound = false;
        
        allLinks.forEach((link, index) => {
            if (link.getAttribute('href') === '#') {
                console.warn(`ANOMALIA ${index + 1}: Link com href="#" encontrado.`, link);
                anomalyFound = true;
            }
        });

        if (!anomalyFound) {
            console.log("Verificação de links concluída. Nenhuma anomalia encontrada.");
        }
    }

    // Executa o verificador de links
    checkLinkAnomalies();


    // --- FUNÇÃO AUXILIAR: Mostrar Notificação de Erro (Toast) ---
    function showErrorToast(message) {
        const toast = document.getElementById('error-toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');

            // Esconde a notificação após 5 segundos
            setTimeout(() => {
                toast.classList.remove('show');
            }, 5000);
        }
    }

    // Para testar o detector de erros, remova o comentário da linha abaixo:
    // testeDeErro(); 
});
