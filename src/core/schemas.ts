import { z } from 'zod';

// Enums validados
export const UFEnum = z.enum([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]);

export type UF = z.infer<typeof UFEnum>;

export const SexoEnum = z.enum(['M', 'F']);
export const OrdemEnum = z.enum(['ASC', 'DESC']);

// Validadores de data
export const DateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Data deve estar no formato YYYY-MM-DD'
);

export const DateRangeSchema = z.object({
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional()
}).refine(
  data => {
    if (data.dataInicio && data.dataFim) {
      return new Date(data.dataInicio) <= new Date(data.dataFim);
    }
    return true;
  },
  'dataInicio deve ser anterior ou igual a dataFim'
);

// Paginação
export const PaginationSchema = z.object({
  pagina: z.number().int().positive().default(1),
  itens: z.number().int().min(1).max(100).default(25)
});

// Schemas para Deputados
export const BuscarDeputadosSchema = z.object({
  nome: z.string().min(3).max(100).optional(),
  uf: UFEnum.optional(),
  partido: z.string().max(20).optional(),
  sexo: SexoEnum.optional(),
  idLegislatura: z.number().int().min(1).max(57).optional(),
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  pagina: z.number().int().positive().default(1),
  itens: z.number().int().min(1).max(100).default(25),
  ordem: OrdemEnum.optional(),
  ordenarPor: z.enum(['id', 'idLegislatura', 'nome']).optional(),
});

export const DetalharDeputadoSchema = z.object({
  id: z.number().int().positive(),
});

export const DespesasDeputadoSchema = z.object({
  id: z.number().int().positive(),
  ano: z.number().int().min(2008).max(new Date().getFullYear()).optional(),
  mes: z.number().int().min(1).max(12).optional(),
  tipoDespesa: z.string().optional(),
  fornecedor: z.string().optional(),
  pagina: z.number().int().positive().default(1),
  itens: z.number().int().min(1).max(100).default(25),
  ordem: OrdemEnum.optional(),
  ordenarPor: z.enum(['ano', 'mes', 'valor']).optional(),
});

// Schemas para Proposições
export const BuscarProposicoesSchema = z.object({
  siglaTipo: z.string().max(10).optional(),
  numero: z.number().int().positive().optional(),
  ano: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  idAutor: z.number().int().positive().optional(),
  nomeAutor: z.string().max(100).optional(),
  siglaPartidoAutor: z.string().max(20).optional(),
  siglaUfAutor: UFEnum.optional(),
  keywords: z.string().max(200).optional(),
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  dataInicioApresentacao: DateSchema.optional(),
  dataFimApresentacao: DateSchema.optional(),
  idSituacao: z.number().int().optional(),
  siglaSituacao: z.string().optional(),
  codTema: z.number().int().optional(),
  tramitacaoSenado: z.boolean().optional(),
  pagina: z.number().int().positive().default(1),
  itens: z.number().int().min(1).max(100).default(25),
  ordem: OrdemEnum.optional(),
  ordenarPor: z.enum(['id', 'ano', 'dataApresentacao']).optional(),
});

export const DetalharProposicaoSchema = z.object({
  id: z.number().int().positive(),
});

export const AutoresProposicaoSchema = z.object({
  id: z.number().int().positive(),
});

export const TramitacoesProposicaoSchema = z.object({
  id: z.number().int().positive(),
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  pagina: z.number().int().positive().default(1),
  itens: z.number().int().min(1).max(100).default(25),
});

export const VotacoesProposicaoSchema = z.object({
  id: z.number().int().positive(),
  ordem: OrdemEnum.optional(),
  ordenarPor: z.enum(['dataHoraRegistro']).optional(),
});
