// normalize-artigos.js
// Utilitário para normalizar os slugs (campo "pagina") do artigos.json

import fs from "fs";

// Função para normalizar texto em formato slug (sem acentos, espaços → hifens, minúsculo)
function slugify(text) {
  return text
    .normalize("NFD")                     // separa acentos
    .replace(/[\u0300-\u036f]/g, "")      // remove acentos
    .toLowerCase()
    .replace(/\s+/g, "-")                 // espaços → hifens
    .replace(/[^a-z0-9\-\.]/g, "");       // remove caracteres inválidos (exceto - e .)
}

try {
  // Lê o JSON
  const rawData = fs.readFileSync("artigos.json", "utf8");
  const artigos = JSON.parse(rawData);

  // Atualiza cada item
  const artigosNormalizados = artigos.map((artigo) => {
    // Mantém slug se já terminar com .html
    if (artigo.pagina.endsWith(".html")) {
      return artigo;
    }
    return {
      ...artigo,
      pagina: slugify(artigo.pagina),
    };
  });

  // Escreve de volta no arquivo
  fs.writeFileSync(
    "artigos.json",
    JSON.stringify(artigosNormalizados, null, 2),
    "utf8"
  );

  console.log("✅ artigos.json normalizado com sucesso!");
} catch (err) {
  console.error("❌ Erro ao processar artigos.json:", err);
}
