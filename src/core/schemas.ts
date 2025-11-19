import { z } from 'zod';

// Enums validados
export const UFEnum = z.enum([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]);

export type UF = z.infer<typeof UFEnum>;

export const TipoProposicaoEnum = z.enum([
  'PL', 'PLP', 'PLC', 'PLN', 'PLS', 'PEC', 'PFC', 'PRC',
  'PDC', 'PDL', 'PDN', 'PDS', 'REC', 'REP', 'REQ', 'RIC',
  'RCP', 'MSC', 'INC', 'IND', 'PET', 'RDF', 'MPV'
]);

export type TipoProposicao = z.infer<typeof TipoProposicaoEnum>;

export const SexoEnum = z.enum(['M', 'F']);
export type Sexo = z.infer<typeof SexoEnum>;

export const OrdemEnum = z.enum(['ASC', 'DESC']);
export type Ordem = z.infer<typeof OrdemEnum>;

// Validadores de data
export const DateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Data deve estar no formato YYYY-MM-DD'
).refine(
  (date) => {
    const [year, month, day] = date.split('-').map(Number);

    // Validar mês
    if (month < 1 || month > 12) return false;

    // Validar dia
    if (day < 1 || day > 31) return false;

    // Validar dias por mês
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Verificar ano bissexto
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (isLeapYear) daysInMonth[1] = 29;

    if (day > daysInMonth[month - 1]) return false;

    // Validar que a data pode ser criada
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  },
  'Data inválida'
);

// Validador de hora
export const HoraSchema = z.string().regex(
  /^\d{2}:\d{2}$/,
  'Hora deve estar no formato HH:MM'
).refine(
  (hora) => {
    const [hours, minutes] = hora.split(':').map(Number);

    // Validar hora (0-23)
    if (hours < 0 || hours > 23) return false;

    // Validar minutos (0-59)
    if (minutes < 0 || minutes > 59) return false;

    return true;
  },
  'Hora inválida (hora deve ser 00-23, minutos 00-59)'
);

export const DateRangeSchema = z.object({
  dataInicio: DateSchema,
  dataFim: DateSchema
}).refine(
  data => new Date(data.dataInicio) <= new Date(data.dataFim),
  'dataInicio deve ser anterior ou igual a dataFim'
);

// Paginação
export const PaginationSchema = z.object({
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(15).optional() // Reduzido de 25 para 15
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Ordenação - SEM defaults para evitar erros
export const OrdenacaoSchema = z.object({
  ordem: OrdemEnum.optional(), // Removido default para evitar erros
  ordenarPor: z.string().optional()
});

export type Ordenacao = z.infer<typeof OrdenacaoSchema>;

// Sanitização de texto
export const SafeTextSchema = z.string()
  .min(2, 'Texto deve ter no mínimo 2 caracteres')
  .max(100, 'Texto deve ter no máximo 100 caracteres')
  .transform(text => text
    .replace(/[^\w\s\u00C0-\u00FF-]/g, '') // Remove caracteres especiais
    .trim()
  );

// Schema para nome de busca
export const NomeBuscaSchema = z.string()
  .min(3, 'Nome deve ter no mínimo 3 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .transform(text => text.trim());

// Schema para ano
export const AnoSchema = z.number()
  .int()
  .min(2008, 'Ano deve ser maior ou igual a 2008')
  .max(new Date().getFullYear(), `Ano deve ser menor ou igual a ${new Date().getFullYear()}`);

// Schema para mês
export const MesSchema = z.number()
  .int()
  .min(1, 'Mês deve ser entre 1 e 12')
  .max(12, 'Mês deve ser entre 1 e 12');

// Schema para legislatura
export const LegislaturaSchema = z.number()
  .int()
  .min(1, 'ID da legislatura deve ser maior que 0')
  .max(57, 'ID da legislatura deve ser menor ou igual a 57');

// Schema para ID
export const IdSchema = z.number()
  .int()
  .positive('ID deve ser um número positivo');

// Schema para ID string (usado em votações)
export const IdStringSchema = z.string()
  .min(1, 'ID não pode ser vazio');

// Metadados de resposta
export const MetadataSchema = z.object({
  cache: z.boolean().optional(),
  latencyMs: z.number().optional(),
  apiVersion: z.string().default('v2'),
  fetchedAt: z.string().optional(),
  normalized: z.boolean().default(true)
});

export type Metadata = z.infer<typeof MetadataSchema>;

// Paginação de resposta
export const PaginacaoRespostaSchema = z.object({
  pagina: z.number().int().positive(),
  itens: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPaginas: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
});

export type PaginacaoResposta = z.infer<typeof PaginacaoRespostaSchema>;

// Helper para criar resposta paginada
export function createPaginacaoResposta(
  pagina: number,
  itens: number,
  total: number
): PaginacaoResposta {
  const totalPaginas = Math.ceil(total / itens);
  return {
    pagina,
    itens,
    total,
    totalPaginas,
    hasNext: pagina < totalPaginas,
    hasPrev: pagina > 1
  };
}
