import { buscarProposicoes, buscarProposicoesTool } from './buscar.js';
import { detalharProposicao, detalharProposicaoTool } from './detalhar.js';
import { autoresProposicao, autoresProposicaoTool } from './autores.js';
import { tramitacoesProposicao, tramitacoesProposicaoTool } from './tramitacoes.js';
import { votacoesProposicao, votacoesProposicaoTool } from './votacoes.js';
import { relacionadasProposicao, relacionadasProposicaoTool } from './relacionadas.js';
import { temasProposicao, temasProposicaoTool } from './temas.js';

export {
  buscarProposicoes,
  buscarProposicoesTool,
  detalharProposicao,
  detalharProposicaoTool,
  autoresProposicao,
  autoresProposicaoTool,
  tramitacoesProposicao,
  tramitacoesProposicaoTool,
  votacoesProposicao,
  votacoesProposicaoTool,
  relacionadasProposicao,
  relacionadasProposicaoTool,
  temasProposicao,
  temasProposicaoTool
};

export const proposicoesTools = [
  buscarProposicoesTool,
  detalharProposicaoTool,
  autoresProposicaoTool,
  tramitacoesProposicaoTool,
  votacoesProposicaoTool,
  relacionadasProposicaoTool,
  temasProposicaoTool
];
