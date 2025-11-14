import { buscarVotacoes, buscarVotacoesTool } from './buscar.js';
import { detalharVotacao, detalharVotacaoTool } from './detalhar.js';
import { votosVotacao, votosVotacaoTool } from './votos.js';

export {
  buscarVotacoes,
  buscarVotacoesTool,
  detalharVotacao,
  detalharVotacaoTool,
  votosVotacao,
  votosVotacaoTool
};

export const votacoesTools = [
  buscarVotacoesTool,
  detalharVotacaoTool,
  votosVotacaoTool
];
