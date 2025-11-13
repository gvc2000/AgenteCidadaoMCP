import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createLogger } from './core/logging.js';

// Import all tool handlers
import * as deputadosTools from './tools/deputados/index.js';
import * as proposicoesTools from './tools/proposicoes/index.js';
import * as votacoesTools from './tools/votacoes/index.js';
import * as eventosTools from './tools/eventos/index.js';
import * as orgaosTools from './tools/orgaos/index.js';
import * as outrosTools from './tools/outros/index.js';

const logger = createLogger('mcp-server');

// Definir todas as tools disponíveis
const TOOLS = [
  // Deputados
  deputadosTools.buscarDeputadosTool,
  deputadosTools.detalharDeputadoTool,
  deputadosTools.despesasDeputadoTool,
  deputadosTools.discursosDeputadoTool,
  deputadosTools.eventosDeputadoTool,
  deputadosTools.frentesDeputadoTool,
  deputadosTools.ocupacoesDeputadoTool,
  deputadosTools.orgaosDeputadoTool,
  deputadosTools.profissoesDeputadoTool,

  // Proposições
  proposicoesTools.buscarProposicoesTool,
  proposicoesTools.detalharProposicaoTool,
  proposicoesTools.autoresProposicaoTool,
  proposicoesTools.tramitacoesProposicaoTool,
  proposicoesTools.votacoesProposicaoTool,
  proposicoesTools.relacionadasProposicaoTool,
  proposicoesTools.temasProposicaoTool,

  // Votações
  votacoesTools.buscarVotacoesTool,
  votacoesTools.detalharVotacaoTool,
  votacoesTools.votosVotacaoTool,
  votacoesTools.orientacoesVotacaoTool,
  votacoesTools.ultimasVotacoesTool,

  // Eventos
  eventosTools.buscarEventosTool,
  eventosTools.detalharEventoTool,
  eventosTools.deputadosEventoTool,
  eventosTools.pautaEventoTool,
  eventosTools.votacoesEventoTool,
  eventosTools.orgaosEventoTool,

  // Órgãos
  orgaosTools.buscarOrgaosTool,
  orgaosTools.detalharOrgaoTool,
  orgaosTools.membrosOrgaoTool,
  orgaosTools.eventosOrgaoTool,
  orgaosTools.votacoesOrgaoTool,

  // Frentes, Blocos, Partidos, Legislaturas
  outrosTools.buscarFrentesTool,
  outrosTools.detalharFrenteTool,
  outrosTools.membrosFrenteTool,
  outrosTools.buscarBlocosTool,
  outrosTools.detalharBlocoTool,
  outrosTools.buscarPartidosTool,
  outrosTools.detalharPartidoTool,
  outrosTools.membrosPartidoTool,
  outrosTools.lideresPartidoTool,
  outrosTools.buscarLegislaturasTool,
  outrosTools.detalharLegislaturaTool,
  outrosTools.mesaLegislaturaTool,

  // Referências
  outrosTools.situacoesProposicaoTool,
  outrosTools.temasReferenciaTool,
  outrosTools.tiposProposicaoTool,
  outrosTools.tiposOrgaoTool,
  outrosTools.tiposEventoTool,
  outrosTools.listarUFsTool,
];

// Mapa de handlers
const TOOL_HANDLERS: Record<string, (args: any) => Promise<any>> = {
  // Deputados
  buscar_deputados: deputadosTools.buscarDeputados,
  detalhar_deputado: deputadosTools.detalharDeputado,
  despesas_deputado: deputadosTools.despesasDeputado,
  discursos_deputado: deputadosTools.discursosDeputado,
  eventos_deputado: deputadosTools.eventosDeputado,
  frentes_deputado: deputadosTools.frentesDeputado,
  ocupacoes_deputado: deputadosTools.ocupacoesDeputado,
  orgaos_deputado: deputadosTools.orgaosDeputado,
  profissoes_deputado: deputadosTools.profissoesDeputado,

  // Proposições
  buscar_proposicoes: proposicoesTools.buscarProposicoes,
  detalhar_proposicao: proposicoesTools.detalharProposicao,
  autores_proposicao: proposicoesTools.autoresProposicao,
  tramitacoes_proposicao: proposicoesTools.tramitacoesProposicao,
  votacoes_proposicao: proposicoesTools.votacoesProposicao,
  relacionadas_proposicao: proposicoesTools.relacionadasProposicao,
  temas_proposicao: proposicoesTools.temasProposicao,

  // Votações
  buscar_votacoes: votacoesTools.buscarVotacoes,
  detalhar_votacao: votacoesTools.detalharVotacao,
  votos_votacao: votacoesTools.votosVotacao,
  orientacoes_votacao: votacoesTools.orientacoesVotacao,
  ultimas_votacoes: votacoesTools.ultimasVotacoes,

  // Eventos
  buscar_eventos: eventosTools.buscarEventos,
  detalhar_evento: eventosTools.detalharEvento,
  deputados_evento: eventosTools.deputadosEvento,
  pauta_evento: eventosTools.pautaEvento,
  votacoes_evento: eventosTools.votacoesEvento,
  orgaos_evento: eventosTools.orgaosEvento,

  // Órgãos
  buscar_orgaos: orgaosTools.buscarOrgaos,
  detalhar_orgao: orgaosTools.detalharOrgao,
  membros_orgao: orgaosTools.membrosOrgao,
  eventos_orgao: orgaosTools.eventosOrgao,
  votacoes_orgao: orgaosTools.votacoesOrgao,

  // Frentes, Blocos, Partidos, Legislaturas
  buscar_frentes: outrosTools.buscarFrentes,
  detalhar_frente: outrosTools.detalharFrente,
  membros_frente: outrosTools.membrosFrente,
  buscar_blocos: outrosTools.buscarBlocos,
  detalhar_bloco: outrosTools.detalharBloco,
  buscar_partidos: outrosTools.buscarPartidos,
  detalhar_partido: outrosTools.detalharPartido,
  membros_partido: outrosTools.membrosPartido,
  lideres_partido: outrosTools.lideresPartido,
  buscar_legislaturas: outrosTools.buscarLegislaturas,
  detalhar_legislatura: outrosTools.detalharLegislatura,
  mesa_legislatura: outrosTools.mesaLegislatura,

  // Referências
  situacoes_proposicao: outrosTools.situacoesProposicao,
  temas_referencia: outrosTools.temasReferencia,
  tipos_proposicao: outrosTools.tiposProposicao,
  tipos_orgao: outrosTools.tiposOrgao,
  tipos_evento: outrosTools.tiposEvento,
  listar_ufs: outrosTools.listarUFs,
};

export class CamaraBRMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
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

    this.setupHandlers();
    logger.info('MCP Server initialized');
  }

  private setupHandlers() {
    // Handler para listar tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('Listing available tools');
      return {
        tools: TOOLS,
      };
    });

    // Handler para executar tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      logger.info({ tool: name, args }, 'Tool called');

      const handler = TOOL_HANDLERS[name];

      if (!handler) {
        logger.error({ tool: name }, 'Tool not found');
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await handler(args || {});

        logger.info({ tool: name }, 'Tool executed successfully');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error({ tool: name, error }, 'Tool execution failed');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: error instanceof Error ? error.message : 'Unknown error',
                  tool: name,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info(
      {
        toolsCount: TOOLS.length,
        tools: TOOLS.map((t) => t.name),
      },
      'MCP Server started'
    );

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down...');
      await this.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Shutting down...');
      await this.server.close();
      process.exit(0);
    });
  }
}
