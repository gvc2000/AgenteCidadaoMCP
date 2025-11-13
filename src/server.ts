#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { CamaraAPIClient } from './api/client.js';
import { caches } from './core/cache.js';
import { logger } from './core/logger.js';

// Importar tools de deputados
import { buscarDeputados, BuscarDeputadosParams } from './tools/deputados/buscar.js';
import { detalharDeputado, DetalharDeputadoParams } from './tools/deputados/detalhar.js';
import { despesasDeputado, DespesasDeputadoParams } from './tools/deputados/despesas.js';

// Importar tools de proposições
import { buscarProposicoes, BuscarProposicoesParams } from './tools/proposicoes/buscar.js';
import { detalharProposicao, DetalharProposicaoParams } from './tools/proposicoes/detalhar.js';
import { autoresProposicao, AutoresProposicaoParams } from './tools/proposicoes/autores.js';
import { tramitacoesProposicao, TramitacoesProposicaoParams } from './tools/proposicoes/tramitacoes.js';

// Inicializar clientes
const deputadosClient = new CamaraAPIClient(caches.deputados);
const proposicoesClient = new CamaraAPIClient(caches.proposicoes);

// Definir as tools disponíveis
const tools: Tool[] = [
  {
    name: 'buscar_deputados',
    description: 'Busca deputados da Câmara dos Deputados do Brasil com filtros opcionais. Permite filtrar por nome (mínimo 3 caracteres), UF, partido, sexo, legislatura e período de exercício. Retorna lista paginada de deputados.',
    inputSchema: {
      type: 'object',
      properties: {
        nome: {
          type: 'string',
          description: 'Nome do deputado (mínimo 3 caracteres)',
          minLength: 3,
        },
        uf: {
          type: 'string',
          description: 'Sigla da Unidade Federativa (UF)',
          enum: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
        },
        partido: {
          type: 'string',
          description: 'Sigla do partido político',
        },
        sexo: {
          type: 'string',
          description: 'Sexo do deputado',
          enum: ['M', 'F'],
        },
        idLegislatura: {
          type: 'number',
          description: 'ID da legislatura (1-57)',
          minimum: 1,
          maximum: 57,
        },
        dataInicio: {
          type: 'string',
          description: 'Data de início do período (formato YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        dataFim: {
          type: 'string',
          description: 'Data de fim do período (formato YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        pagina: {
          type: 'number',
          description: 'Número da página (padrão: 1)',
          minimum: 1,
          default: 1,
        },
        itens: {
          type: 'number',
          description: 'Quantidade de itens por página (1-100, padrão: 25)',
          minimum: 1,
          maximum: 100,
          default: 25,
        },
        ordem: {
          type: 'string',
          description: 'Ordem de classificação',
          enum: ['ASC', 'DESC'],
        },
        ordenarPor: {
          type: 'string',
          description: 'Campo para ordenação',
          enum: ['id', 'idLegislatura', 'nome'],
        },
      },
    },
  },
  {
    name: 'detalhar_deputado',
    description: 'Obtém informações detalhadas de um deputado específico pelo ID. Retorna dados completos incluindo nome civil, foto, partido, UF, email, telefone, gabinete, CPF, data de nascimento, escolaridade e redes sociais.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID do deputado',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'despesas_deputado',
    description: 'Lista as despesas de um deputado com a Cota Parlamentar. Permite filtrar por ano, mês, tipo de despesa e fornecedor. Retorna detalhes de cada despesa incluindo valor, documento, fornecedor e data.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID do deputado',
        },
        ano: {
          type: 'number',
          description: 'Ano da despesa (2008 até o ano atual)',
          minimum: 2008,
        },
        mes: {
          type: 'number',
          description: 'Mês da despesa (1-12)',
          minimum: 1,
          maximum: 12,
        },
        tipoDespesa: {
          type: 'string',
          description: 'Tipo de despesa',
        },
        fornecedor: {
          type: 'string',
          description: 'CNPJ/CPF do fornecedor',
        },
        pagina: {
          type: 'number',
          description: 'Número da página (padrão: 1)',
          minimum: 1,
          default: 1,
        },
        itens: {
          type: 'number',
          description: 'Quantidade de itens por página (1-100, padrão: 25)',
          minimum: 1,
          maximum: 100,
          default: 25,
        },
        ordem: {
          type: 'string',
          description: 'Ordem de classificação',
          enum: ['ASC', 'DESC'],
        },
        ordenarPor: {
          type: 'string',
          description: 'Campo para ordenação',
          enum: ['ano', 'mes', 'valor'],
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'buscar_proposicoes',
    description: 'Busca proposições legislativas (projetos de lei, PECs, MPs, etc.) com filtros diversos. Permite filtrar por tipo, número, ano, autor, partido, UF, palavras-chave, data de apresentação, situação e tema.',
    inputSchema: {
      type: 'object',
      properties: {
        siglaTipo: {
          type: 'string',
          description: 'Sigla do tipo de proposição (PL, PEC, MPV, etc.)',
        },
        numero: {
          type: 'number',
          description: 'Número da proposição',
        },
        ano: {
          type: 'number',
          description: 'Ano da proposição',
        },
        idAutor: {
          type: 'number',
          description: 'ID do deputado autor',
        },
        nomeAutor: {
          type: 'string',
          description: 'Nome do autor',
        },
        siglaPartidoAutor: {
          type: 'string',
          description: 'Sigla do partido do autor',
        },
        siglaUfAutor: {
          type: 'string',
          description: 'Sigla da UF do autor',
          enum: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
        },
        keywords: {
          type: 'string',
          description: 'Palavras-chave para busca no texto',
        },
        dataInicio: {
          type: 'string',
          description: 'Data de início do período (formato YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        dataFim: {
          type: 'string',
          description: 'Data de fim do período (formato YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        dataInicioApresentacao: {
          type: 'string',
          description: 'Data de início da apresentação (formato YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        dataFimApresentacao: {
          type: 'string',
          description: 'Data de fim da apresentação (formato YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        idSituacao: {
          type: 'number',
          description: 'ID da situação da proposição',
        },
        siglaSituacao: {
          type: 'string',
          description: 'Sigla da situação',
        },
        codTema: {
          type: 'number',
          description: 'Código do tema',
        },
        tramitacaoSenado: {
          type: 'boolean',
          description: 'Se está em tramitação no Senado',
        },
        pagina: {
          type: 'number',
          description: 'Número da página (padrão: 1)',
          minimum: 1,
          default: 1,
        },
        itens: {
          type: 'number',
          description: 'Quantidade de itens por página (1-100, padrão: 25)',
          minimum: 1,
          maximum: 100,
          default: 25,
        },
        ordem: {
          type: 'string',
          description: 'Ordem de classificação',
          enum: ['ASC', 'DESC'],
        },
        ordenarPor: {
          type: 'string',
          description: 'Campo para ordenação',
          enum: ['id', 'ano', 'dataApresentacao'],
        },
      },
    },
  },
  {
    name: 'detalhar_proposicao',
    description: 'Obtém informações detalhadas de uma proposição específica pelo ID. Retorna dados completos incluindo ementa, autores, status de tramitação, texto integral e justificativa.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID da proposição',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'autores_proposicao',
    description: 'Lista os autores de uma proposição específica. Retorna nome, tipo (deputado, senador, etc.) e ordem de assinatura de cada autor.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID da proposição',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'tramitacoes_proposicao',
    description: 'Lista o histórico de tramitação de uma proposição. Mostra todos os eventos, despachos, pareceres e movimentações da proposição ao longo do tempo.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID da proposição',
        },
        dataInicio: {
          type: 'string',
          description: 'Data de início do período (formato YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        dataFim: {
          type: 'string',
          description: 'Data de fim do período (formato YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        pagina: {
          type: 'number',
          description: 'Número da página (padrão: 1)',
          minimum: 1,
          default: 1,
        },
        itens: {
          type: 'number',
          description: 'Quantidade de itens por página (1-100, padrão: 25)',
          minimum: 1,
          maximum: 100,
          default: 25,
        },
      },
      required: ['id'],
    },
  },
];

// Criar servidor MCP
const server = new Server(
  {
    name: 'mcp-camara-br',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler para listar tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info('Listing available tools');
  return { tools };
});

// Handler para executar tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.info('Calling tool', { name, args });

  try {
    switch (name) {
      case 'buscar_deputados': {
        const params = args as BuscarDeputadosParams;
        const result = await buscarDeputados(deputadosClient, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'detalhar_deputado': {
        const params = args as DetalharDeputadoParams;
        const result = await detalharDeputado(deputadosClient, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'despesas_deputado': {
        const params = args as DespesasDeputadoParams;
        const result = await despesasDeputado(deputadosClient, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'buscar_proposicoes': {
        const params = args as BuscarProposicoesParams;
        const result = await buscarProposicoes(proposicoesClient, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'detalhar_proposicao': {
        const params = args as DetalharProposicaoParams;
        const result = await detalharProposicao(proposicoesClient, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'autores_proposicao': {
        const params = args as AutoresProposicaoParams;
        const result = await autoresProposicao(proposicoesClient, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'tramitacoes_proposicao': {
        const params = args as TramitacoesProposicaoParams;
        const result = await tramitacoesProposicao(proposicoesClient, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error('Error calling tool', { name, error });

    if (error instanceof Error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: 'Unknown error occurred',
        },
      ],
      isError: true,
    };
  }
});

// Iniciar servidor
async function main() {
  logger.info('Starting MCP Câmara BR server');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('Server started successfully');
}

main().catch((error) => {
  logger.error('Fatal error', error);
  process.exit(1);
});
