# Bem-vindo à Documentação

Este é o primeiro documento do projeto **Super Proteção**, carregado dinamicamente a partir de um arquivo Markdown!

Nossa missão é oferecer segurança e tranquilidade através de tecnologia inovadora e fácil de usar. Este sistema de documentação foi criado para ser:
- **Simples:** Fácil de escrever e manter.
- **Flexível:** Permite a inclusão de textos, listas, imagens e códigos.
- **Integrado:** Funciona perfeitamente com o layout e as ferramentas que já construímos.

## Como Funciona

A página que você está vendo (`documento.html`) é um molde. O conteúdo que você lê aqui vem do arquivo `/docs/introducao.md`.

O script `doc-loader.js` é responsável por buscar este arquivo, convertê-lo para HTML e exibi-lo nesta área. Ele também gera o sumário na barra lateral esquerda automaticamente a partir dos títulos (como este "Como Funciona").

### Exemplo de Bloco de Código

Podemos facilmente exibir exemplos de código formatados:

```javascript
// Exemplo de código em JavaScript
function saudacao(nome) {
  console.log(`Olá, ${nome}! Bem-vindo à documentação.`);
}

saudacao('Usuário');
