import { buscarVotacoes, buscarVotacoesTool } from './buscar.js';
import { detalharVotacao, detalharVotacaoTool } from './detalhar.js';
import { votosVotacao, votosVotacaoTool } from './votos.js';
import { orientacoesVotacao, orientacoesVotacaoTool } from './orientacoes.js';
import { ultimasVotacoes, ultimasVotacoesTool } from './ultimas.js';

export {
  buscarVotacoes,
  buscarVotacoesTool,
  detalharVotacao,
  detalharVotacaoTool,
  votosVotacao,
  votosVotacaoTool,
  orientacoesVotacao,
  orientacoesVotacaoTool,
  ultimasVotacoes,
  ultimasVotacoesTool
};

export const votacoesTools = [
  buscarVotacoesTool,
  detalharVotacaoTool,
  votosVotacaoTool,
  orientacoesVotacaoTool,
  ultimasVotacoesTool
];
