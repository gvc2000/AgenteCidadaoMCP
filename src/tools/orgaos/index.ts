import { buscarOrgaos, buscarOrgaosTool } from './buscar.js';
import { detalharOrgao, detalharOrgaoTool } from './detalhar.js';
import { membrosOrgao, membrosOrgaoTool } from './membros.js';
import { eventosOrgao, eventosOrgaoTool } from './eventos.js';
import { votacoesOrgao, votacoesOrgaoTool } from './votacoes.js';

export {
  buscarOrgaos,
  buscarOrgaosTool,
  detalharOrgao,
  detalharOrgaoTool,
  membrosOrgao,
  membrosOrgaoTool,
  eventosOrgao,
  eventosOrgaoTool,
  votacoesOrgao,
  votacoesOrgaoTool
};

export const orgaosTools = [
  buscarOrgaosTool,
  detalharOrgaoTool,
  membrosOrgaoTool,
  eventosOrgaoTool,
  votacoesOrgaoTool
];
