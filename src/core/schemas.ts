import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const UFEnum = z.enum([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]);

export const SexoEnum = z.enum(['M', 'F']);

export const OrdemEnum = z.enum(['ASC', 'DESC']);

// ============================================================================
// Validadores de Data
// ============================================================================

export const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD');

export const TimeSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM');

export const DateRangeSchema = z
  .object({
    dataInicio: DateSchema,
    dataFim: DateSchema,
  })
  .refine((data) => new Date(data.dataInicio) <= new Date(data.dataFim), {
    message: 'dataInicio deve ser anterior ou igual a dataFim',
  });

// ============================================================================
// Paginação
// ============================================================================

export const PaginationSchema = z.object({
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional(),
});

export const PaginationResponseSchema = z.object({
  pagina: z.number(),
  itens: z.number(),
  total: z.number(),
  totalPaginas: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// ============================================================================
// Sanitização de Texto
// ============================================================================

export const SafeTextSchema = z
  .string()
  .min(2)
  .max(200)
  .transform((text) =>
    text
      .replace(/[^\w\s\u00C0-\u00FF\-]/g, '') // Remove caracteres especiais exceto letras, números, espaços e hífen
      .trim()
  );

export const KeywordsSchema = z
  .string()
  .min(3)
  .max(500)
  .transform((text) => text.trim());

// ============================================================================
// Tipos Base
// ============================================================================

export const IdSchema = z.number().int().positive();

export const IdStringSchema = z.string().min(1);

export const SiglaSchema = z.string().min(2).max(20).toUpperCase();

export const AnoSchema = z
  .number()
  .int()
  .min(2000)
  .max(new Date().getFullYear() + 1);

export const MesSchema = z.number().int().min(1).max(12);

export const LegislaturaSchema = z.number().int().min(1).max(57);

// ============================================================================
// Metadata
// ============================================================================

export const MetadataSchema = z.object({
  cache: z.boolean().optional(),
  latencyMs: z.number().optional(),
  apiVersion: z.string().optional(),
  fetchedAt: z.string().optional(),
});

// ============================================================================
// Response Wrapper
// ============================================================================

export function createResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    dados: z.array(dataSchema),
    links: z
      .array(
        z.object({
          rel: z.string(),
          href: z.string(),
        })
      )
      .optional(),
  });
}

export function createPaginatedResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    dados: z.array(dataSchema),
    links: z
      .array(
        z.object({
          rel: z.string(),
          href: z.string(),
        })
      )
      .optional(),
  });
}

// ============================================================================
// Export Types
// ============================================================================

export type UF = z.infer<typeof UFEnum>;
export type Sexo = z.infer<typeof SexoEnum>;
export type Ordem = z.infer<typeof OrdemEnum>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
