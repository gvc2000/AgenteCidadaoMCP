import { z } from 'zod';
import { metricsCollector } from '../../core/metrics.js';

const DiagnosticarConsultaSchema = z.object({
  objetivo: z.string().min(10).describe('Descrição do que o usuário quer descobrir')
});

export type DiagnosticarConsultaParams = z.infer<typeof DiagnosticarConsultaSchema>;

interface FluxoRecomendado {
  etapa: number;
  ferramenta: string;
  parametros: Record<string, unknown>;
  descricao: string;
}

interface DiagnosticoResult {
  objetivoIdentificado: string;
  categoria: string;
  fluxoRecomendado: FluxoRecomendado[];
  dicasImportantes: string[];
  errosComuns: string[];
}

/**
 * Analisa o objetivo e sugere o melhor fluxo de ferramentas
 */
export async function diagnosticarConsulta(
  params: DiagnosticarConsultaParams
): Promise<DiagnosticoResult> {
  const startTime = Date.now();

  try {
    const validated = DiagnosticarConsultaSchema.parse(params);
    const objetivo = validated.objetivo.toLowerCase();

    // Identificar categoria principal
    const categoria = identificarCategoria(objetivo);

    // Gerar fluxo recomendado
    const fluxoRecomendado = gerarFluxo(objetivo, categoria);

    // Dicas específicas
    const dicasImportantes = gerarDicas(categoria);

    // Erros comuns a evitar
    const errosComuns = gerarErrosComuns(categoria);

    metricsCollector.incrementToolCall('diagnosticar_consulta');
    metricsCollector.recordLatency('diagnosticar_consulta', Date.now() - startTime);

    return {
      objetivoIdentificado: resumirObjetivo(objetivo),
      categoria,
      fluxoRecomendado,
      dicasImportantes,
      errosComuns
    };
  } catch (error) {
    metricsCollector.incrementError('diagnosticar_consulta');
    throw error;
  }
}

function identificarCategoria(objetivo: string): string {
  const categorias = [
    { nome: 'deputados', keywords: ['deputado', 'parlamentar', 'congressista', 'político'] },
    { nome: 'despesas', keywords: ['gasto', 'despesa', 'cota', 'ceap', 'verba', 'dinheiro', 'custo'] },
    { nome: 'proposicoes', keywords: ['projeto', 'lei', 'pl', 'pec', 'proposição', 'proposta', 'tramitação'] },
    { nome: 'votacoes', keywords: ['votação', 'voto', 'votou', 'aprovado', 'rejeitado', 'orientação'] },
    { nome: 'eventos', keywords: ['evento', 'reunião', 'sessão', 'audiência', 'agenda', 'pauta'] },
    { nome: 'orgaos', keywords: ['comissão', 'órgão', 'ccjc', 'cfi', 'membros'] },
    { nome: 'partidos', keywords: ['partido', 'bancada', 'líder', 'pt', 'pl', 'mdb', 'psdb'] }
  ];

  for (const cat of categorias) {
    if (cat.keywords.some(k => objetivo.includes(k))) {
      return cat.nome;
    }
  }

  return 'geral';
}

function resumirObjetivo(objetivo: string): string {
  if (objetivo.includes('gasto') || objetivo.includes('despesa')) {
    return 'Consultar gastos/despesas parlamentares';
  }
  if (objetivo.includes('votou') || objetivo.includes('voto')) {
    return 'Analisar votações e posicionamentos';
  }
  if (objetivo.includes('projeto') || objetivo.includes('lei')) {
    return 'Acompanhar proposição legislativa';
  }
  if (objetivo.includes('deputado')) {
    return 'Buscar informações sobre deputado';
  }
  return 'Consulta geral sobre atividade legislativa';
}

function gerarFluxo(_objetivo: string, categoria: string): FluxoRecomendado[] {
  const fluxos: Record<string, FluxoRecomendado[]> = {
    deputados: [
      {
        etapa: 1,
        ferramenta: 'buscar_deputados',
        parametros: { nome: '<nome>', itens: 10 },
        descricao: 'Buscar deputado pelo nome para obter o ID'
      },
      {
        etapa: 2,
        ferramenta: 'detalhar_deputado',
        parametros: { id: '<id_encontrado>' },
        descricao: 'Obter dados completos do deputado'
      }
    ],
    despesas: [
      {
        etapa: 1,
        ferramenta: 'buscar_deputados',
        parametros: { nome: '<nome>', itens: 10 },
        descricao: 'Primeiro, encontrar o ID do deputado'
      },
      {
        etapa: 2,
        ferramenta: 'despesas_deputado',
        parametros: { id: '<id>', ano: new Date().getFullYear(), itens: 15 },
        descricao: 'Consultar despesas do deputado'
      }
    ],
    proposicoes: [
      {
        etapa: 1,
        ferramenta: 'buscar_proposicoes',
        parametros: { siglaTipo: 'PL', ano: new Date().getFullYear(), itens: 15 },
        descricao: 'Buscar proposição por tipo e ano (mais seguro que keywords)'
      },
      {
        etapa: 2,
        ferramenta: 'detalhar_proposicao',
        parametros: { id: '<id_encontrado>' },
        descricao: 'Ver detalhes completos da proposição'
      },
      {
        etapa: 3,
        ferramenta: 'tramitacoes_proposicao',
        parametros: { id: '<id>' },
        descricao: 'Ver histórico de tramitação'
      }
    ],
    votacoes: [
      {
        etapa: 1,
        ferramenta: 'buscar_votacoes',
        parametros: { dataInicio: '<YYYY-MM-DD>', dataFim: '<YYYY-MM-DD>', itens: 15 },
        descricao: 'Buscar votações em um período'
      },
      {
        etapa: 2,
        ferramenta: 'detalhar_votacao',
        parametros: { id: '<id_votacao>' },
        descricao: 'Ver resultado geral da votação'
      },
      {
        etapa: 3,
        ferramenta: 'votos_votacao',
        parametros: { id: '<id_votacao>' },
        descricao: 'Ver voto individual de cada deputado'
      }
    ],
    eventos: [
      {
        etapa: 1,
        ferramenta: 'buscar_eventos',
        parametros: { dataInicio: '<YYYY-MM-DD>', dataFim: '<YYYY-MM-DD>', itens: 15 },
        descricao: 'Buscar eventos no período'
      },
      {
        etapa: 2,
        ferramenta: 'detalhar_evento',
        parametros: { id: '<id_evento>' },
        descricao: 'Ver detalhes do evento'
      },
      {
        etapa: 3,
        ferramenta: 'pauta_evento',
        parametros: { id: '<id_evento>' },
        descricao: 'Ver pauta do evento'
      }
    ],
    orgaos: [
      {
        etapa: 1,
        ferramenta: 'buscar_orgaos',
        parametros: { sigla: '<sigla>', itens: 10 },
        descricao: 'Buscar órgão pela sigla'
      },
      {
        etapa: 2,
        ferramenta: 'membros_orgao',
        parametros: { id: '<id_orgao>' },
        descricao: 'Ver membros do órgão'
      }
    ],
    partidos: [
      {
        etapa: 1,
        ferramenta: 'buscar_partidos',
        parametros: { sigla: '<sigla>', itens: 10 },
        descricao: 'Buscar partido pela sigla'
      },
      {
        etapa: 2,
        ferramenta: 'membros_partido',
        parametros: { id: '<id_partido>' },
        descricao: 'Ver deputados do partido'
      }
    ],
    geral: [
      {
        etapa: 1,
        ferramenta: 'ultimas_votacoes',
        parametros: { itens: 10 },
        descricao: 'Ver votações recentes'
      }
    ]
  };

  return fluxos[categoria] || fluxos.geral;
}

function gerarDicas(categoria: string): string[] {
  const dicasGerais = [
    'Use itens: 15 para resultados iniciais (padrão conservador)',
    'Sempre obtenha o ID antes de chamar ferramentas que requerem ID',
    'Datas devem estar no formato YYYY-MM-DD'
  ];

  const dicasEspecificas: Record<string, string[]> = {
    deputados: [
      'Nome deve ter pelo menos 3 caracteres',
      'A legislatura atual é 57 (2023-2027)',
      'Combine uf + partido para filtros mais precisos'
    ],
    despesas: [
      'Despesas são da cota parlamentar (CEAP)',
      'Filtre por ano para reduzir volume de dados',
      'Use ordenarPor: "valorLiquido" para ver maiores gastos'
    ],
    proposicoes: [
      'NÃO use keywords com ordem ou ordenarPor',
      'Comece com siglaTipo + ano (mais estável)',
      'Se keywords falhar, tente sem outros filtros'
    ],
    votacoes: [
      'IDs de votação são strings, não números',
      'Use dataInicio + dataFim para período',
      'votos_votacao mostra voto individual'
    ],
    eventos: [
      'Filtre sempre por dataInicio e dataFim',
      'pauta_evento mostra o que será discutido'
    ],
    orgaos: [
      'CCJC, CFT, CDHM são siglas comuns',
      'membros_orgao lista a composição atual'
    ],
    partidos: [
      'Siglas: PT, PL, MDB, PSDB, PP, UNIÃO, etc.',
      'lideres_partido mostra a liderança'
    ]
  };

  return [...dicasGerais, ...(dicasEspecificas[categoria] || [])];
}

function gerarErrosComuns(categoria: string): string[] {
  const errosGerais = [
    'NÃO use ordem/ordenarPor sem necessidade - podem causar erro 400',
    'NÃO passe ID inválido - sempre busque o ID primeiro',
    'NÃO use mais de 5-6 parâmetros na mesma chamada'
  ];

  const errosEspecificos: Record<string, string[]> = {
    proposicoes: [
      'EVITE: keywords + ordenarPor juntos',
      'EVITE: 4 filtros de data simultaneamente',
      'EVITE: keywords muito longos (>100 chars)'
    ],
    deputados: [
      'EVITE: nome com menos de 3 caracteres',
      'EVITE: nome + ordenarPor juntos'
    ],
    votacoes: [
      'EVITE: múltiplos IDs (proposicao + evento + orgao)',
      'EVITE: ID numérico - votações usam string'
    ],
    despesas: [
      'EVITE: chamar sem id do deputado',
      'EVITE: período muito longo sem filtro de ano'
    ]
  };

  return [...errosGerais, ...(errosEspecificos[categoria] || [])];
}

export const diagnosticarConsultaTool = {
  name: 'diagnosticar_consulta',
  description: 'Analisa o objetivo do usuário e sugere o melhor fluxo de ferramentas a usar. Use esta ferramenta quando não souber qual ferramenta escolher ou quiser evitar erros.',
  inputSchema: {
    type: 'object',
    properties: {
      objetivo: {
        type: 'string',
        description: 'Descrição do que o usuário quer descobrir. Ex: "quero saber os gastos do deputado X com passagens em 2024"',
        examples: [
          'encontrar gastos do deputado Silva com passagens',
          'ver como o deputado X votou na reforma tributária',
          'acompanhar tramitação do PL 1234/2024'
        ]
      }
    },
    required: ['objetivo']
  },
  handler: diagnosticarConsulta
};
