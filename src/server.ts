#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const API_BASE = 'https://dadosabertos.camara.leg.br/api/v2';

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

// Listar tools disponíveis
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'buscar_deputados',
        description: 'Busca deputados por nome, UF, partido ou outros filtros. Retorna lista paginada de deputados.',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Nome do deputado para buscar (mínimo 3 caracteres)',
            },
            uf: {
              type: 'string',
              description: 'Sigla do estado (ex: SP, RJ, MG, RS, BA)',
              pattern: '^[A-Z]{2}$',
            },
            partido: {
              type: 'string',
              description: 'Sigla do partido (ex: PT, PSDB, MDB, PL, UNIÃO)',
            },
            pagina: {
              type: 'number',
              description: 'Número da página para paginação (padrão: 1)',
              default: 1,
            },
            itens: {
              type: 'number',
              description: 'Quantidade de itens por página, de 1 a 100 (padrão: 15)',
              default: 15,
            },
          },
        },
      },
      {
        name: 'detalhar_deputado',
        description: 'Obtém informações completas e detalhadas de um deputado específico pelo ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID único do deputado na Câmara',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'despesas_deputado',
        description: 'Lista as despesas realizadas por um deputado usando a cota parlamentar (CEAP)',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID do deputado',
            },
            ano: {
              type: 'number',
              description: 'Ano das despesas (ex: 2024, 2023)',
            },
            mes: {
              type: 'number',
              description: 'Mês das despesas (1 a 12)',
              minimum: 1,
              maximum: 12,
            },
            pagina: {
              type: 'number',
              description: 'Número da página (padrão: 1)',
              default: 1,
            },
            itens: {
              type: 'number',
              description: 'Itens por página (padrão: 100)',
              default: 100,
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'buscar_proposicoes',
        description: 'Busca proposições legislativas (PL, PEC, MPV, etc) com diversos filtros disponíveis',
        inputSchema: {
          type: 'object',
          properties: {
            siglaTipo: {
              type: 'string',
              description: 'Tipo da proposição: PL (Projeto de Lei), PEC (Emenda Constitucional), MPV (Medida Provisória), PLP (Projeto de Lei Complementar)',
            },
            numero: {
              type: 'number',
              description: 'Número da proposição',
            },
            ano: {
              type: 'number',
              description: 'Ano da proposição',
            },
            keywords: {
              type: 'string',
              description: 'Palavras-chave para buscar no texto da proposição',
            },
            idAutor: {
              type: 'number',
              description: 'ID do autor da proposição',
            },
            pagina: {
              type: 'number',
              description: 'Número da página (padrão: 1)',
              default: 1,
            },
            itens: {
              type: 'number',
              description: 'Itens por página (padrão: 15)',
              default: 15,
            },
          },
        },
      },
      {
        name: 'detalhar_proposicao',
        description: 'Obtém informações completas de uma proposição específica',
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
        name: 'votacoes_proposicao',
        description: 'Lista as votações ocorridas sobre uma proposição',
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
    ],
  };
});

// Executar tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ erro: 'Argumentos não fornecidos' }, null, 2),
        },
      ],
      isError: true,
    };
  }

  try {
    const params_any = args as any;

    switch (name) {
      case 'buscar_deputados': {
        const params = new URLSearchParams();
        if (params_any.nome) params.append('nome', params_any.nome);
        if (params_any.uf) params.append('siglaUf', params_any.uf);
        if (params_any.partido) params.append('siglaPartido', params_any.partido);
        params.append('pagina', String(params_any.pagina || 1));
        params.append('itens', String(params_any.itens || 15));
        params.append('ordem', 'ASC');
        params.append('ordenarPor', 'nome');

        const response = await axios.get(
          `${API_BASE}/deputados?${params.toString()}`,
          { timeout: 15000 }
        );

        const { dados, links } = response.data;

        const resumo = {
          total: dados.length,
          pagina: params_any.pagina || 1,
          deputados: dados.map((d: any) => ({
            id: d.id,
            nome: d.nome,
            siglaPartido: d.siglaPartido,
            siglaUf: d.siglaUf,
            email: d.email,
            urlFoto: d.urlFoto,
          })),
          links: links,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(resumo, null, 2),
            },
          ],
        };
      }

      case 'detalhar_deputado': {
        const response = await axios.get(
          `${API_BASE}/deputados/${params_any.id}`,
          { timeout: 15000 }
        );

        const { dados } = response.data;

        const detalhes = {
          id: dados.id,
          nome: dados.ultimoStatus?.nomeEleitoral || dados.nomeCivil,
          nomeCivil: dados.nomeCivil,
          cpf: dados.cpf,
          sexo: dados.sexo,
          dataNascimento: dados.dataNascimento,
          municipioNascimento: dados.municipioNascimento,
          ufNascimento: dados.ufNascimento,
          escolaridade: dados.escolaridade,
          partido: dados.ultimoStatus?.siglaPartido,
          uf: dados.ultimoStatus?.siglaUf,
          situacao: dados.ultimoStatus?.situacao,
          condicaoEleitoral: dados.ultimoStatus?.condicaoEleitoral,
          email: dados.ultimoStatus?.email,
          gabinete: dados.ultimoStatus?.gabinete,
          urlFoto: dados.ultimoStatus?.urlFoto,
          redesSociais: dados.redesSociais,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(detalhes, null, 2),
            },
          ],
        };
      }

      case 'despesas_deputado': {
        const params = new URLSearchParams();
        if (params_any.ano) params.append('ano', String(params_any.ano));
        if (params_any.mes) params.append('mes', String(params_any.mes));
        params.append('pagina', String(params_any.pagina || 1));
        params.append('itens', String(params_any.itens || 100));
        params.append('ordem', 'DESC');
        params.append('ordenarPor', 'dataDocumento');

        const response = await axios.get(
          `${API_BASE}/deputados/${params_any.id}/despesas?${params.toString()}`,
          { timeout: 15000 }
        );

        const { dados, links } = response.data;

        const totalGasto = dados.reduce((sum: number, d: any) =>
          sum + (d.valorDocumento || 0), 0
        );

        const resumo = {
          deputadoId: params_any.id,
          ano: params_any.ano,
          mes: params_any.mes,
          totalDespesas: dados.length,
          valorTotal: totalGasto,
          valorTotalFormatado: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(totalGasto),
          despesas: dados.slice(0, 20).map((d: any) => ({
            tipo: d.tipoDespesa,
            fornecedor: d.nomeFornecedor,
            valor: d.valorDocumento,
            valorFormatado: new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(d.valorDocumento),
            data: d.dataDocumento,
            numeroDocumento: d.numeroDocumento,
          })),
          links: links,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(resumo, null, 2),
            },
          ],
        };
      }

      case 'buscar_proposicoes': {
        const params = new URLSearchParams();
        if (params_any.siglaTipo) params.append('siglaTipo', params_any.siglaTipo);
        if (params_any.numero) params.append('numero', String(params_any.numero));
        if (params_any.ano) params.append('ano', String(params_any.ano));
        if (params_any.keywords) params.append('keywords', params_any.keywords);
        if (params_any.idAutor) params.append('idDeputadoAutor', String(params_any.idAutor));
        params.append('pagina', String(params_any.pagina || 1));
        params.append('itens', String(params_any.itens || 15));
        params.append('ordem', 'DESC');
        params.append('ordenarPor', 'id');

        const response = await axios.get(
          `${API_BASE}/proposicoes?${params.toString()}`,
          { timeout: 15000 }
        );

        const { dados, links } = response.data;

        const resumo = {
          total: dados.length,
          proposicoes: dados.map((p: any) => ({
            id: p.id,
            tipo: p.siglaTipo,
            numero: p.numero,
            ano: p.ano,
            ementa: p.ementa,
            dataApresentacao: p.dataApresentacao,
            uri: p.uri,
          })),
          links: links,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(resumo, null, 2),
            },
          ],
        };
      }

      case 'detalhar_proposicao': {
        const response = await axios.get(
          `${API_BASE}/proposicoes/${params_any.id}`,
          { timeout: 15000 }
        );

        const { dados } = response.data;

        const detalhes = {
          id: dados.id,
          tipo: dados.siglaTipo,
          numero: dados.numero,
          ano: dados.ano,
          ementa: dados.ementa,
          ementaDetalhada: dados.ementaDetalhada,
          keywords: dados.keywords,
          dataApresentacao: dados.dataApresentacao,
          statusProposicao: dados.statusProposicao,
          uriAutores: dados.uriAutores,
          uriOrgaoNumerador: dados.uriOrgaoNumerador,
          urlInteiroTeor: dados.urlInteiroTeor,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(detalhes, null, 2),
            },
          ],
        };
      }

      case 'votacoes_proposicao': {
        const response = await axios.get(
          `${API_BASE}/proposicoes/${params_any.id}/votacoes`,
          { timeout: 15000 }
        );

        const { dados } = response.data;

        const resumo = {
          proposicaoId: params_any.id,
          totalVotacoes: dados.length,
          votacoes: dados.map((v: any) => ({
            id: v.id,
            data: v.dataHoraRegistro,
            descricao: v.descricao,
            aprovacao: v.aprovacao,
            siglaOrgao: v.siglaOrgao,
            uri: v.uri,
          })),
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(resumo, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Tool desconhecida: ${name}`);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    const statusCode = error.response?.status;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            erro: `Erro ao executar ${name}`,
            mensagem: errorMessage,
            statusCode: statusCode,
            parametros: args,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Servidor MCP Câmara BR iniciado com sucesso!');
  console.error('📡 Aguardando conexão do cliente MCP...');
}

main().catch((error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});
