/**
 * Utilitários para resumo e análise de texto
 * Usado pelas ferramentas de resumo otimizadas (discursos, tramitações, etc.)
 */

/**
 * Opções para resumo de texto
 */
export interface ResumoTextoOptions {
  textoCompleto: string;
  maxPalavras?: number;
  preservarInicio?: boolean;
}

/**
 * Lista de stopwords em português
 * Palavras comuns que devem ser ignoradas na análise de palavras-chave
 */
const STOPWORDS = new Set([
  'a', 'o', 'e', 'de', 'da', 'do', 'em', 'um', 'uma', 'os', 'as', 'dos', 'das',
  'para', 'com', 'por', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'à', 'às',
  'é', 'são', 'foi', 'ser', 'tem', 'têm', 'ter', 'há', 'como', 'mais', 'mas',
  'seu', 'sua', 'seus', 'suas', 'ou', 'quando', 'muito', 'nos', 'já', 'eu',
  'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era',
  'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse',
  'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas',
  'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja',
  'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas',
  'este', 'fosse', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus', 'minhas',
  'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas', 'dela',
  'delas', 'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas',
  'isto', 'aquilo', 'estou', 'está', 'estamos', 'estão', 'estive', 'esteve',
  'estivemos', 'estiveram', 'estava', 'estávamos', 'estavam', 'estivera',
  'estivéramos', 'esteja', 'estejamos', 'estejam', 'estivesse', 'estivéssemos',
  'estivessem', 'estiver', 'estivermos', 'estiverem', 'hei', 'há', 'havemos',
  'hão', 'houve', 'houvemos', 'houveram', 'houvera', 'houvéramos', 'haja',
  'hajamos', 'hajam', 'houvesse', 'houvéssemos', 'houvessem', 'houver',
  'houvermos', 'houverem', 'houverei', 'houverá', 'houveremos', 'houverão',
  'houveria', 'houveríamos', 'houveriam', 'sou', 'somos', 'são', 'era',
  'éramos', 'eram', 'fui', 'foi', 'fomos', 'foram', 'fora', 'fôramos',
  'seja', 'sejamos', 'sejam', 'fosse', 'fôssemos', 'fossem', 'for', 'formos',
  'forem', 'serei', 'será', 'seremos', 'serão', 'seria', 'seríamos', 'seriam'
]);

/**
 * Remove stopwords de um array de palavras
 */
function removerStopwords(palavras: string[]): string[] {
  return palavras.filter(p => !STOPWORDS.has(p.toLowerCase()));
}

/**
 * Normaliza texto: lowercase, remove pontuação, etc.
 */
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
}

/**
 * Trunca texto de forma inteligente, preservando frases completas
 */
export function resumirTexto(options: ResumoTextoOptions): string {
  const { textoCompleto, maxPalavras = 150 } = options;

  if (!textoCompleto || textoCompleto.trim().length === 0) {
    return '';
  }

  const palavras = textoCompleto.split(/\s+/);

  // Se o texto já é curto o suficiente, retornar completo
  if (palavras.length <= maxPalavras) {
    return textoCompleto.trim();
  }

  // Truncar no limite de palavras
  const textoTruncado = palavras.slice(0, maxPalavras).join(' ');

  // Tentar encontrar um ponto final próximo ao final
  const ultimoPonto = textoTruncado.lastIndexOf('.');
  const ultimaExclamacao = textoTruncado.lastIndexOf('!');
  const ultimaInterrogacao = textoTruncado.lastIndexOf('?');

  const ultimaPontuacao = Math.max(ultimoPonto, ultimaExclamacao, ultimaInterrogacao);

  // Se encontrou pontuação nos últimos 20% do texto, cortar lá
  if (ultimaPontuacao > textoTruncado.length * 0.8) {
    return textoTruncado.substring(0, ultimaPontuacao + 1).trim();
  }

  // Caso contrário, adicionar reticências
  return textoTruncado.trim() + '...';
}

/**
 * Extrai palavras-chave mais relevantes de um texto
 * Usando análise de frequência simples (sem TF-IDF completo para manter leve)
 */
export function extrairPalavrasChave(texto: string, limite = 10): string[] {
  if (!texto || texto.trim().length === 0) {
    return [];
  }

  const normalizado = normalizarTexto(texto);
  const palavras = normalizado.split(/\s+/).filter(p => p.length > 3); // Mínimo 4 caracteres
  const palavrasSemStop = removerStopwords(palavras);

  // Contar frequências
  const frequencias = new Map<string, number>();
  for (const palavra of palavrasSemStop) {
    frequencias.set(palavra, (frequencias.get(palavra) || 0) + 1);
  }

  // Ordenar por frequência e retornar top N
  return Array.from(frequencias.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
    .map(([palavra]) => palavra);
}

/**
 * Categoriza textos por tema detectado
 * Retorna mapa de tema → contagem
 */
export function categorizarPorTema(textos: Array<{ texto: string; tema?: string }>): Map<string, number> {
  const temas = new Map<string, number>();

  for (const item of textos) {
    // Se tema já fornecido, usar
    if (item.tema) {
      temas.set(item.tema, (temas.get(item.tema) || 0) + 1);
      continue;
    }

    // Caso contrário, tentar detectar por palavras-chave
    const palavrasChave = extrairPalavrasChave(item.texto, 3);
    const temaDetectado = palavrasChave.length > 0 ? palavrasChave[0] : 'Outros';
    temas.set(temaDetectado, (temas.get(temaDetectado) || 0) + 1);
  }

  return temas;
}

/**
 * Identifica temas principais em um conjunto de textos
 * Retorna array ordenado por relevância
 */
export function identificarTemasprincipais(
  textos: string[],
  limiteResultados = 10
): Array<{ tema: string; frequencia: number; percentual: number }> {
  if (textos.length === 0) {
    return [];
  }

  // Combinar todos os textos
  const textoCompleto = textos.join(' ');
  const palavrasChave = extrairPalavrasChave(textoCompleto, limiteResultados * 2);

  // Contar em quantos textos cada palavra aparece
  const frequenciaPorTexto = new Map<string, number>();

  for (const palavra of palavrasChave) {
    let count = 0;
    for (const texto of textos) {
      if (normalizarTexto(texto).includes(palavra)) {
        count++;
      }
    }
    frequenciaPorTexto.set(palavra, count);
  }

  const total = textos.length;

  return Array.from(frequenciaPorTexto.entries())
    .map(([tema, freq]) => ({
      tema,
      frequencia: freq,
      percentual: Math.round((freq / total) * 100)
    }))
    .sort((a, b) => b.frequencia - a.frequencia)
    .slice(0, limiteResultados);
}

/**
 * Detecta o tema principal de um texto baseado em palavras-chave
 */
export function detectarTemaPrincipal(texto: string): string {
  const palavrasChave = extrairPalavrasChave(texto, 3);
  return palavrasChave.length > 0 ? palavrasChave[0] : 'Não especificado';
}

/**
 * Agrupa textos similares por tema
 */
export function agruparPorTema(
  items: Array<{ id: string | number; texto: string }>,
  limiteTemasTop = 5
): Map<string, Array<{ id: string | number; texto: string }>> {
  const grupos = new Map<string, Array<{ id: string | number; texto: string }>>();

  for (const item of items) {
    const tema = detectarTemaPrincipal(item.texto);
    if (!grupos.has(tema)) {
      grupos.set(tema, []);
    }
    grupos.get(tema)!.push(item);
  }

  // Manter apenas os N temas com mais items
  const temasOrdenados = Array.from(grupos.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, limiteTemasTop);

  // Agrupar resto em "Outros"
  const temasTop = new Map(temasOrdenados);
  const outros: Array<{ id: string | number; texto: string }> = [];

  for (const [tema, items] of grupos.entries()) {
    if (!temasTop.has(tema)) {
      outros.push(...items);
    }
  }

  if (outros.length > 0) {
    temasTop.set('Outros', outros);
  }

  return temasTop;
}
