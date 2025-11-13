import { buscarProposicoes, buscarProposicoesTool } from './buscar.js';
import { detalharProposicao, detalharProposicaoTool } from './detalhar.js';
import { autoresProposicao, autoresProposicaoTool } from './autores.js';

export {
  buscarProposicoes,
  buscarProposicoesTool,
  detalharProposicao,
  detalharProposicaoTool,
  autoresProposicao,
  autoresProposicaoTool
};

export const proposicoesTools = [
  buscarProposicoesTool,
  detalharProposicaoTool,
  autoresProposicaoTool
];
