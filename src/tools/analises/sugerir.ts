import { z } from 'zod';

const SugerirFerramentasSchema = z.object({
  consulta: z.string().min(3).describe('Descrição do que você quer consultar ou saber')
});

export type SugerirFerramentasParams = z.infer<typeof SugerirFerramentasSchema>;

interface Sugestao {
  tool: string;
  descricao: string;
  exemplo: string;
  prioridade: number;
}

export async function sugerirFerramentas(params: SugerirFerramentasParams) {
  const validated = SugerirFerramentasSchema.parse(params);
  const consulta = validated.consulta.toLowerCase();

  const sugestoes: Sugestao[] = [];

  // Análise por palavras-chave

  // DEPUTADOS
  if (consulta.includes('deputado') || consulta.includes('parlamentar') ||
      consulta.includes('congressista') || consulta.includes('representante')) {

    if (consulta.includes('gasto') || consulta.includes('despesa') ||
        consulta.includes('cota') || consulta.includes('ceap') || consulta.includes('dinheiro')) {
      sugestoes.push({
        tool: 'despesas_deputado',
        descricao: 'Consultar gastos da cota parlamentar',
        exemplo: 'despesas_deputado({ id: 204554, ano: 2024, ordenarPor: "valorDocumento", ordem: "DESC" })',
        prioridade: 1
      });
    }

    if (consulta.includes('discurso') || consulta.includes('fal') || consulta.includes('pronuncia')) {
      sugestoes.push({
        tool: 'discursos_deputado',
        descricao: 'Buscar pronunciamentos em plenário',
        exemplo: 'discursos_deputado({ id: 204554, ano: 2024 })',
        prioridade: 1
      });
    }

    if (consulta.includes('comiss') || consulta.includes('orgao') || consulta.includes('participa')) {
      sugestoes.push({
        tool: 'orgaos_deputado',
        descricao: 'Ver comissões que o deputado participa',
        exemplo: 'orgaos_deputado({ id: 204554 })',
        prioridade: 1
      });
    }

    if (consulta.includes('frente')) {
      sugestoes.push({
        tool: 'frentes_deputado',
        descricao: 'Ver frentes parlamentares que integra',
        exemplo: 'frentes_deputado({ id: 204554 })',
        prioridade: 1
      });
    }

    // Busca geral de deputado
    sugestoes.push({
      tool: 'buscar_deputados',
      descricao: 'Buscar e listar deputados por nome, UF ou partido',
      exemplo: 'buscar_deputados({ nome: "Silva", uf: "SP", partido: "PT" })',
      prioridade: sugestoes.length === 0 ? 1 : 2
    });

    sugestoes.push({
      tool: 'detalhar_deputado',
      descricao: 'Obter informações completas de um deputado',
      exemplo: 'detalhar_deputado({ id: 204554 })',
      prioridade: 2
    });
  }

  // PROPOSIÇÕES
  if (consulta.includes('projeto') || consulta.includes('pl') || consulta.includes('pec') ||
      consulta.includes('proposi') || consulta.includes('lei') || consulta.includes('legisla')) {

    if (consulta.includes('tramit') || consulta.includes('andamento') || consulta.includes('status')) {
      sugestoes.push({
        tool: 'tramitacoes_proposicao',
        descricao: 'Ver histórico de tramitação',
        exemplo: 'tramitacoes_proposicao({ id: 2456789, ordem: "DESC" })',
        prioridade: 1
      });
    }

    if (consulta.includes('autor') || consulta.includes('quem')) {
      sugestoes.push({
        tool: 'autores_proposicao',
        descricao: 'Ver quem apresentou a proposição',
        exemplo: 'autores_proposicao({ id: 2456789 })',
        prioridade: 1
      });
    }

    if (consulta.includes('vota') || consulta.includes('aprova') || consulta.includes('rejeit')) {
      sugestoes.push({
        tool: 'votacoes_proposicao',
        descricao: 'Ver votações da proposição',
        exemplo: 'votacoes_proposicao({ id: 2456789 })',
        prioridade: 1
      });
    }

    sugestoes.push({
      tool: 'buscar_proposicoes',
      descricao: 'Buscar proposições por tipo, ano ou tema',
      exemplo: 'buscar_proposicoes({ siglaTipo: "PL", ano: 2024, keywords: "educação" })',
      prioridade: sugestoes.length === 0 ? 1 : 2
    });

    sugestoes.push({
      tool: 'detalhar_proposicao',
      descricao: 'Obter detalhes completos de uma proposição',
      exemplo: 'detalhar_proposicao({ id: 2456789 })',
      prioridade: 2
    });
  }

  // VOTAÇÕES
  if (consulta.includes('vota') || consulta.includes('voto') || consulta.includes('aprova') ||
      consulta.includes('rejeit') || consulta.includes('placar')) {

    if (consulta.includes('recent') || consulta.includes('ultim') || consulta.includes('hoje')) {
      sugestoes.push({
        tool: 'ultimas_votacoes',
        descricao: 'Ver votações mais recentes',
        exemplo: 'ultimas_votacoes({ itens: 10 })',
        prioridade: 1
      });
    }

    if (consulta.includes('orient') || consulta.includes('partido') || consulta.includes('bancada')) {
      sugestoes.push({
        tool: 'orientacoes_votacao',
        descricao: 'Ver orientação dos partidos na votação',
        exemplo: 'orientacoes_votacao({ id: "2456789-123" })',
        prioridade: 1
      });
    }

    if (consulta.includes('individual') || consulta.includes('cada') || consulta.includes('deputado')) {
      sugestoes.push({
        tool: 'votos_votacao',
        descricao: 'Ver voto de cada deputado',
        exemplo: 'votos_votacao({ id: "2456789-123" })',
        prioridade: 1
      });
    }

    sugestoes.push({
      tool: 'buscar_votacoes',
      descricao: 'Buscar votações por período',
      exemplo: 'buscar_votacoes({ dataInicio: "2024-11-01", dataFim: "2024-11-30" })',
      prioridade: 2
    });

    sugestoes.push({
      tool: 'detalhar_votacao',
      descricao: 'Ver detalhes de uma votação específica',
      exemplo: 'detalhar_votacao({ id: "2456789-123" })',
      prioridade: 2
    });
  }

  // EVENTOS
  if (consulta.includes('evento') || consulta.includes('reunia') || consulta.includes('audiencia') ||
      consulta.includes('sessao') || consulta.includes('agenda') || consulta.includes('pauta')) {

    sugestoes.push({
      tool: 'buscar_eventos',
      descricao: 'Buscar eventos por período',
      exemplo: 'buscar_eventos({ dataInicio: "2024-11-18", dataFim: "2024-11-22" })',
      prioridade: 1
    });

    if (consulta.includes('pauta') || consulta.includes('discuss')) {
      sugestoes.push({
        tool: 'pauta_evento',
        descricao: 'Ver pauta de um evento',
        exemplo: 'pauta_evento({ id: 70123 })',
        prioridade: 1
      });
    }

    sugestoes.push({
      tool: 'detalhar_evento',
      descricao: 'Ver detalhes de um evento',
      exemplo: 'detalhar_evento({ id: 70123 })',
      prioridade: 2
    });
  }

  // PARTIDOS
  if (consulta.includes('partido') || consulta.includes('sigla') ||
      consulta.includes('pt') || consulta.includes('pl') || consulta.includes('mdb')) {

    if (consulta.includes('membro') || consulta.includes('deputado')) {
      sugestoes.push({
        tool: 'membros_partido',
        descricao: 'Listar deputados de um partido',
        exemplo: 'membros_partido({ id: 36769 })',
        prioridade: 1
      });
    }

    if (consulta.includes('lider') || consulta.includes('lideranca')) {
      sugestoes.push({
        tool: 'lideres_partido',
        descricao: 'Ver liderança do partido',
        exemplo: 'lideres_partido({ id: 36769 })',
        prioridade: 1
      });
    }

    sugestoes.push({
      tool: 'buscar_partidos',
      descricao: 'Buscar partidos',
      exemplo: 'buscar_partidos({ sigla: "PT" })',
      prioridade: 2
    });
  }

  // COMISSÕES / ÓRGÃOS
  if (consulta.includes('comiss') || consulta.includes('ccj') || consulta.includes('cft') ||
      consulta.includes('orgao') || consulta.includes('plenario')) {

    sugestoes.push({
      tool: 'buscar_orgaos',
      descricao: 'Buscar comissões e órgãos',
      exemplo: 'buscar_orgaos({ sigla: "CCJC" })',
      prioridade: 1
    });

    if (consulta.includes('membro') || consulta.includes('compos')) {
      sugestoes.push({
        tool: 'membros_orgao',
        descricao: 'Ver composição do órgão',
        exemplo: 'membros_orgao({ id: 2003 })',
        prioridade: 1
      });
    }
  }

  // FRENTES PARLAMENTARES
  if (consulta.includes('frente')) {
    sugestoes.push({
      tool: 'buscar_frentes',
      descricao: 'Buscar frentes parlamentares',
      exemplo: 'buscar_frentes({ idLegislatura: 57 })',
      prioridade: 1
    });

    sugestoes.push({
      tool: 'membros_frente',
      descricao: 'Ver membros de uma frente',
      exemplo: 'membros_frente({ id: 54789 })',
      prioridade: 2
    });
  }

  // LEGISLATURA / MESA
  if (consulta.includes('legislatura') || consulta.includes('mesa') ||
      consulta.includes('presidente') || consulta.includes('diretora')) {

    sugestoes.push({
      tool: 'mesa_legislatura',
      descricao: 'Ver composição da Mesa Diretora',
      exemplo: 'mesa_legislatura({ idLegislatura: 57 })',
      prioridade: 1
    });

    sugestoes.push({
      tool: 'buscar_legislaturas',
      descricao: 'Informações sobre legislaturas',
      exemplo: 'buscar_legislaturas({ itens: 5 })',
      prioridade: 2
    });
  }

  // DADOS DE REFERÊNCIA
  if (consulta.includes('tipo') || consulta.includes('lista') ||
      consulta.includes('referencia') || consulta.includes('codigo')) {

    if (consulta.includes('proposic') || consulta.includes('pl') || consulta.includes('pec')) {
      sugestoes.push({
        tool: 'tipos_proposicao',
        descricao: 'Listar todos os tipos de proposição',
        exemplo: 'tipos_proposicao({})',
        prioridade: 1
      });

      sugestoes.push({
        tool: 'situacoes_proposicao',
        descricao: 'Listar situações possíveis de proposição',
        exemplo: 'situacoes_proposicao({})',
        prioridade: 2
      });
    }

    if (consulta.includes('estado') || consulta.includes('uf')) {
      sugestoes.push({
        tool: 'ufs',
        descricao: 'Listar unidades federativas',
        exemplo: 'ufs({})',
        prioridade: 1
      });
    }
  }

  // Se não encontrou nada específico, sugerir ferramentas gerais
  if (sugestoes.length === 0) {
    sugestoes.push(
      {
        tool: 'buscar_deputados',
        descricao: 'Buscar deputados',
        exemplo: 'buscar_deputados({ uf: "SP", itens: 10 })',
        prioridade: 1
      },
      {
        tool: 'buscar_proposicoes',
        descricao: 'Buscar proposições',
        exemplo: 'buscar_proposicoes({ ano: 2024, itens: 10 })',
        prioridade: 1
      },
      {
        tool: 'ultimas_votacoes',
        descricao: 'Ver votações recentes',
        exemplo: 'ultimas_votacoes({ itens: 10 })',
        prioridade: 1
      },
      {
        tool: 'buscar_eventos',
        descricao: 'Buscar eventos',
        exemplo: 'buscar_eventos({ dataInicio: "2024-11-01", dataFim: "2024-11-30" })',
        prioridade: 2
      }
    );
  }

  // Ordenar por prioridade e remover duplicatas
  const seen = new Set<string>();
  const resultado = sugestoes
    .sort((a, b) => a.prioridade - b.prioridade)
    .filter(s => {
      if (seen.has(s.tool)) return false;
      seen.add(s.tool);
      return true;
    })
    .slice(0, 6);

  return {
    consulta: validated.consulta,
    sugestoes: resultado,
    dica: resultado.length > 0
      ? `Comece pela ferramenta "${resultado[0].tool}" para sua consulta.`
      : 'Refine sua consulta para obter sugestões mais específicas.',
    _metadata: {
      totalSugestoes: resultado.length
    }
  };
}

export const sugerirFerramentasDefinition = {
  name: 'sugerir_ferramentas',
  description: 'Sugere quais ferramentas usar para uma determinada consulta sobre a Câmara dos Deputados. Use antes de fazer consultas complexas para entender o melhor caminho.',
  inputSchema: {
    type: 'object',
    properties: {
      consulta: {
        type: 'string',
        description: 'Descrição do que você quer consultar ou saber. Ex: "gastos do deputado X", "tramitação do PL 1234", "votações recentes"'
      }
    },
    required: ['consulta']
  },
  handler: sugerirFerramentas
};
