// ARQUIVO: build-search.js
// RESPONSABILIDADE: Gerar o arquivo busca-data.json a partir dos arquivos .md

import fs from 'fs';
import path from 'path';
import fm from 'front-matter';

// Caminho para a pasta de artigos (relativo à raiz do projeto)
const articlesPath = path.join(process.cwd(), 'docs', 'artigos');
// Caminho de saída do arquivo JSON
const outputPath = path.join(process.cwd(), 'docs', 'busca-data.json');

console.log('Iniciando a geração do índice de busca...');

try {
  // Lê todos os arquivos do diretório de artigos que terminam com .md
  const files = fs.readdirSync(articlesPath).filter(file => file.endsWith('.md'));

  const searchData = files.map(file => {
    console.log(`Processando: ${file}`);
    const filePath = path.join(articlesPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extrai os metadados (front-matter) e o conteúdo do corpo do arquivo
    const { attributes, body } = fm(content);

    // Validação para garantir que os metadados essenciais existem no arquivo
    if (!attributes.id || !attributes.title || !attributes.description) {
      console.warn(`AVISO: Arquivo ${file} não possui metadados essenciais (id, title, description). Pulando.`);
      return null;
    }
    
    // Constrói o objeto de busca para este artigo
    return {
      id: attributes.id,
      title: attributes.title,
      description: attributes.description,
      category: attributes.category || 'geral',
      difficulty: attributes.difficulty || 'iniciante',
      date: attributes.date,
      page: attributes.page,
      anchor: attributes.anchor,
      // O campo 'content' recebe o corpo do Markdown, sem os metadados
      content: body 
    };
  }).filter(Boolean); // Remove quaisquer itens nulos que falharam na validação

  // Escreve o array de dados formatado no arquivo de saída
  fs.writeFileSync(outputPath, JSON.stringify(searchData, null, 2), 'utf8');

  console.log(`Índice de busca gerado com sucesso em ${outputPath}! Total de ${searchData.length} itens.`);

} catch (error) {
  console.error('Erro ao gerar o índice de busca:', error);
}
