export class CamaraAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public details?: unknown,
    public invalidParams?: string[],
    public suggestion?: string
  ) {
    super(message);
    this.name = 'CamaraAPIError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: true,
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      endpoint: this.endpoint,
      invalidParams: this.invalidParams,
      suggestion: this.suggestion,
      details: this.details
    };
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown,
    public invalidParams?: string[],
    public suggestion?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: true,
      name: this.name,
      message: this.message,
      field: this.field,
      invalidParams: this.invalidParams,
      suggestion: this.suggestion,
      value: this.value
    };
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(
    message: string = 'Circuit breaker is open',
    public endpoint?: string
  ) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TimeoutError extends Error {
  constructor(
    message: string = 'Request timeout',
    public timeoutMs?: number
  ) {
    super(message);
    this.name = 'TimeoutError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof CamaraAPIError) {
    // Retry em erros 5xx e alguns 4xx
    return (
      (error.statusCode !== undefined && error.statusCode >= 500) ||
      error.statusCode === 429 ||
      error.statusCode === 408
    );
  }

  if (error instanceof TimeoutError) {
    return true;
  }

  // Erros de rede são retryable
  if (error instanceof Error) {
    const networkErrors = [
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'EHOSTUNREACH'
    ];
    return networkErrors.some(code => error.message.includes(code));
  }

  return false;
}

export function handleError(error: unknown): never {
  if (error instanceof CamaraAPIError) {
    throw error;
  }

  if (error instanceof ValidationError) {
    throw error;
  }

  if (error instanceof RateLimitError) {
    throw error;
  }

  if (error instanceof CircuitBreakerOpenError) {
    throw error;
  }

  if (error instanceof TimeoutError) {
    throw error;
  }

  // Erro desconhecido
  if (error instanceof Error) {
    throw new CamaraAPIError(
      `Erro inesperado: ${error.message}`,
      undefined,
      undefined,
      error
    );
  }

  throw new CamaraAPIError(
    'Erro desconhecido',
    undefined,
    undefined,
    error
  );
}

// Utilitários para formatação de erros informativos

import { ZodError } from 'zod';

/**
 * Formata erros do Zod em mensagens mais amigáveis
 */
export function formatZodError(error: ZodError): ValidationError {
  const issues = error.issues;
  const invalidParams = issues.map(issue => issue.path.join('.'));

  const messages = issues.map(issue => {
    const field = issue.path.join('.');
    switch (issue.code) {
      case 'invalid_type':
        return `${field}: esperado ${issue.expected}, recebido ${issue.received}`;
      case 'too_small':
        if (issue.type === 'string') {
          return `${field}: mínimo de ${issue.minimum} caracteres`;
        }
        return `${field}: valor mínimo é ${issue.minimum}`;
      case 'too_big':
        if (issue.type === 'string') {
          return `${field}: máximo de ${issue.maximum} caracteres`;
        }
        return `${field}: valor máximo é ${issue.maximum}`;
      case 'invalid_enum_value':
        return `${field}: valor inválido. Opções válidas: ${issue.options.join(', ')}`;
      case 'invalid_string':
        if (issue.validation === 'regex') {
          return `${field}: formato inválido`;
        }
        return `${field}: ${issue.message}`;
      default:
        return `${field}: ${issue.message}`;
    }
  });

  const suggestion = generateValidationSuggestion(invalidParams);

  return new ValidationError(
    `Parâmetros inválidos: ${messages.join('; ')}`,
    invalidParams[0],
    undefined,
    invalidParams,
    suggestion
  );
}

/**
 * Gera sugestões baseadas nos parâmetros inválidos
 */
function generateValidationSuggestion(params: string[]): string {
  const suggestions: string[] = [];

  if (params.some(p => p.includes('data') || p.includes('Data'))) {
    suggestions.push('Datas devem estar no formato YYYY-MM-DD (ex: 2024-01-15)');
  }

  if (params.includes('itens')) {
    suggestions.push('O parâmetro "itens" deve estar entre 1 e 100');
  }

  if (params.includes('nome')) {
    suggestions.push('O parâmetro "nome" deve ter no mínimo 3 caracteres');
  }

  if (params.some(p => p === 'ordem' || p === 'ordenarPor')) {
    suggestions.push('Os parâmetros "ordem" e "ordenarPor" podem causar erros em alguns endpoints. Tente remover esses parâmetros se a busca falhar');
  }

  return suggestions.length > 0
    ? suggestions.join('. ')
    : 'Verifique os parâmetros e tente novamente';
}

/**
 * Cria um erro de API com contexto informativo
 */
export function createInformativeAPIError(
  statusCode: number,
  endpoint: string,
  params: Record<string, unknown>,
  details?: unknown
): CamaraAPIError {
  const usedParams = Object.keys(params).filter(k => params[k] !== undefined);

  let message: string;
  let suggestion: string;
  let invalidParams: string[] = [];

  switch (statusCode) {
    case 400:
      message = 'Requisição inválida - combinação de parâmetros não suportada pela API';
      invalidParams = detectProblematicParams(usedParams, endpoint);
      suggestion = generateAPIErrorSuggestion(statusCode, usedParams, endpoint);
      break;
    case 404:
      message = 'Recurso não encontrado';
      suggestion = 'Verifique se o ID fornecido existe. Use as ferramentas de busca para encontrar IDs válidos';
      break;
    case 429:
      message = 'Limite de requisições excedido';
      suggestion = 'Aguarde alguns segundos antes de tentar novamente';
      break;
    case 500:
    case 502:
    case 503:
      message = 'Erro interno da API da Câmara';
      suggestion = 'A API externa está com problemas. Tente novamente em alguns minutos';
      break;
    default:
      message = `Erro da API: ${statusCode}`;
      suggestion = 'Verifique os parâmetros e tente novamente';
  }

  return new CamaraAPIError(
    message,
    statusCode,
    endpoint,
    details,
    invalidParams.length > 0 ? invalidParams : usedParams,
    suggestion
  );
}

/**
 * Detecta parâmetros que frequentemente causam problemas
 */
function detectProblematicParams(params: string[], _endpoint: string): string[] {
  const problematic: string[] = [];

  // Combinação ordem + ordenarPor é problemática em vários endpoints
  if (params.includes('ordem') && params.includes('ordenarPor')) {
    problematic.push('ordem', 'ordenarPor');
  }

  // Keywords muito longos
  if (params.includes('keywords')) {
    problematic.push('keywords');
  }

  // Múltiplos filtros de data podem conflitar
  const dateParams = params.filter(p =>
    p.includes('data') || p.includes('Data')
  );
  if (dateParams.length > 2) {
    problematic.push(...dateParams);
  }

  return problematic;
}

/**
 * Gera sugestões específicas para erros da API
 */
function generateAPIErrorSuggestion(
  statusCode: number,
  params: string[],
  endpoint: string
): string {
  const suggestions: string[] = [];

  if (statusCode === 400) {
    // Sugestões para Bad Request
    if (params.includes('ordem') || params.includes('ordenarPor')) {
      suggestions.push('Remova os parâmetros "ordem" e "ordenarPor" - eles podem causar erros em alguns endpoints');
    }

    if (params.includes('keywords') && params.length > 1) {
      suggestions.push('Tente usar apenas o parâmetro "keywords" sem outros filtros');
    }

    if (params.length > 5) {
      suggestions.push('Reduza o número de parâmetros. Comece com filtros básicos e adicione mais gradualmente');
    }

    // Sugestões específicas por endpoint
    if (endpoint.includes('proposicoes')) {
      suggestions.push('Para proposições, comece com: siglaTipo + ano, ou apenas keywords');
    } else if (endpoint.includes('deputados')) {
      suggestions.push('Para deputados, comece com: nome, ou uf + partido');
    } else if (endpoint.includes('votacoes')) {
      suggestions.push('Para votações, comece com: dataInicio + dataFim');
    }
  }

  return suggestions.length > 0
    ? suggestions.join('. ')
    : 'Simplifique a busca removendo alguns parâmetros e tente novamente';
}
