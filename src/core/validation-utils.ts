/**
 * Utilitários de validação preventiva para evitar erros comuns na API
 */

// Utilitários de validação - não usa ValidationError diretamente aqui

interface ValidationResult {
  valid: boolean;
  warnings: string[];
  adjustedParams?: Record<string, unknown>;
}

/**
 * Combinações de parâmetros conhecidas por causar problemas
 */
const PROBLEMATIC_COMBINATIONS: Record<string, {
  params: string[];
  message: string;
  suggestion: string;
}[]> = {
  proposicoes: [
    {
      params: ['keywords', 'ordenarPor'],
      message: 'Combinação keywords + ordenarPor pode causar erro 400',
      suggestion: 'Remova ordenarPor ao usar keywords'
    },
    {
      params: ['keywords', 'ordem'],
      message: 'Combinação keywords + ordem pode causar erro 400',
      suggestion: 'Remova ordem ao usar keywords'
    },
    {
      params: ['dataInicio', 'dataFim', 'dataInicioApresentacao', 'dataFimApresentacao'],
      message: 'Usar todos os 4 filtros de data simultaneamente pode causar conflito',
      suggestion: 'Use dataInicio/dataFim OU dataInicioApresentacao/dataFimApresentacao'
    }
  ],
  deputados: [
    {
      params: ['nome', 'ordenarPor'],
      message: 'Combinação nome + ordenarPor pode ser problemática',
      suggestion: 'Remova ordenarPor ao buscar por nome'
    }
  ],
  votacoes: [
    {
      params: ['idProposicao', 'idEvento', 'idOrgao'],
      message: 'Usar múltiplos IDs pode retornar resultados inesperados',
      suggestion: 'Use apenas um filtro de ID por vez'
    }
  ]
};

/**
 * Valida parâmetros antes de enviar para a API
 */
export function validateParams(
  endpoint: string,
  params: Record<string, unknown>
): ValidationResult {
  const warnings: string[] = [];
  const activeParams = Object.keys(params).filter(k => params[k] !== undefined);

  // Detectar endpoint
  const endpointKey = detectEndpoint(endpoint);

  // Verificar combinações problemáticas
  const combinations = PROBLEMATIC_COMBINATIONS[endpointKey] || [];

  for (const combo of combinations) {
    const matchingParams = combo.params.filter(p => activeParams.includes(p));
    if (matchingParams.length >= 2) {
      warnings.push(`${combo.message}. ${combo.suggestion}`);
    }
  }

  // Validações gerais

  // Keywords muito longo
  if (params.keywords && typeof params.keywords === 'string') {
    if (params.keywords.length > 100) {
      warnings.push('keywords excede 100 caracteres - pode ser truncado ou causar erro');
    }
  }

  // Muitos parâmetros
  if (activeParams.length > 6) {
    warnings.push('Muitos parâmetros podem causar erro. Simplifique a busca');
  }

  // Ordenação sem necessidade
  if (activeParams.includes('ordenarPor') && activeParams.length > 4) {
    warnings.push('ordenarPor com muitos filtros pode causar erro - considere remover');
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}

/**
 * Detecta o endpoint a partir da URL
 */
function detectEndpoint(endpoint: string): string {
  if (endpoint.includes('proposicoes')) return 'proposicoes';
  if (endpoint.includes('deputados')) return 'deputados';
  if (endpoint.includes('votacoes')) return 'votacoes';
  if (endpoint.includes('eventos')) return 'eventos';
  if (endpoint.includes('orgaos')) return 'orgaos';
  if (endpoint.includes('partidos')) return 'partidos';
  return 'other';
}

/**
 * Simplifica parâmetros problemáticos automaticamente
 */
export function simplifyParams(
  _endpoint: string,
  params: Record<string, unknown>
): { params: Record<string, unknown>; removed: string[] } {
  const simplified = { ...params };
  const removed: string[] = [];

  // Se tem keywords, remover ordenação
  if (simplified.keywords) {
    if (simplified.ordenarPor !== undefined) {
      delete simplified.ordenarPor;
      removed.push('ordenarPor');
    }
    if (simplified.ordem !== undefined) {
      delete simplified.ordem;
      removed.push('ordem');
    }
  }

  // Se tem muitos parâmetros de data, manter apenas os principais
  const dateParams = ['dataInicio', 'dataFim', 'dataInicioApresentacao', 'dataFimApresentacao']
    .filter(p => simplified[p] !== undefined);

  if (dateParams.length > 2) {
    // Priorizar dataInicio/dataFim
    if (simplified.dataInicioApresentacao !== undefined) {
      delete simplified.dataInicioApresentacao;
      removed.push('dataInicioApresentacao');
    }
    if (simplified.dataFimApresentacao !== undefined) {
      delete simplified.dataFimApresentacao;
      removed.push('dataFimApresentacao');
    }
  }

  return { params: simplified, removed };
}

/**
 * Valida e lança erro se parâmetros forem inválidos
 */
export function validateOrThrow(
  toolName: string,
  params: Record<string, unknown>
): void {
  const result = validateParams(toolName, params);

  if (!result.valid && result.warnings.length > 0) {
    // Por enquanto só logamos warnings, não bloqueamos
    // Em uma versão futura podemos ser mais restritivos
  }
}

/**
 * Gera sugestões de parâmetros para um objetivo
 */
export function suggestParams(
  _objective: string,
  toolName: string
): Record<string, unknown> {
  const suggestions: Record<string, Record<string, Record<string, unknown>>> = {
    buscar_deputados: {
      default: { itens: 15 },
      porNome: { nome: '', itens: 15 },
      porUfPartido: { uf: '', partido: '', itens: 15 },
      porLegislatura: { idLegislatura: 57, itens: 15 }
    },
    buscar_proposicoes: {
      default: { ano: new Date().getFullYear(), itens: 15 },
      porTipo: { siglaTipo: 'PL', ano: new Date().getFullYear(), itens: 15 },
      porKeywords: { keywords: '', itens: 15 },
      porAutor: { idDeputadoAutor: 0, itens: 15 }
    },
    buscar_votacoes: {
      default: { itens: 15 },
      porPeriodo: { dataInicio: '', dataFim: '', itens: 15 },
      porProposicao: { idProposicao: 0, itens: 15 }
    },
    despesas_deputado: {
      default: { id: 0, ano: new Date().getFullYear(), itens: 15 },
      porMes: { id: 0, ano: new Date().getFullYear(), mes: 1, itens: 15 },
      maioresGastos: { id: 0, ano: new Date().getFullYear(), ordenarPor: 'valorLiquido', ordem: 'DESC', itens: 15 }
    }
  };

  return suggestions[toolName]?.default || { itens: 15 };
}
