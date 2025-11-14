import { buscarEventos, buscarEventosTool } from './buscar.js';
import { detalharEvento, detalharEventoTool } from './detalhar.js';
import { deputadosEvento, deputadosEventoTool } from './deputados.js';
import { pautaEvento, pautaEventoTool } from './pauta.js';
import { votacoesEvento, votacoesEventoTool } from './votacoes.js';
import { orgaosEvento, orgaosEventoTool } from './orgaos.js';

export {
  buscarEventos,
  buscarEventosTool,
  detalharEvento,
  detalharEventoTool,
  deputadosEvento,
  deputadosEventoTool,
  pautaEvento,
  pautaEventoTool,
  votacoesEvento,
  votacoesEventoTool,
  orgaosEvento,
  orgaosEventoTool
};

export const eventosTools = [
  buscarEventosTool,
  detalharEventoTool,
  deputadosEventoTool,
  pautaEventoTool,
  votacoesEventoTool,
  orgaosEventoTool
];
