import { buscarDeputados, buscarDeputadosTool } from './buscar.js';
import { detalharDeputado, detalharDeputadoTool } from './detalhar.js';
import { despesasDeputado, despesasDeputadoTool } from './despesas.js';
import { discursosDeputado, discursosDeputadoTool } from './discursos.js';
import { eventosDeputado, eventosDeputadoTool } from './eventos.js';
import { frentesDeputado, frentesDeputadoTool } from './frentes.js';
import { ocupacoesDeputado, ocupacoesDeputadoTool } from './ocupacoes.js';
import { orgaosDeputado, orgaosDeputadoTool } from './orgaos.js';
import { profissoesDeputado, profissoesDeputadoTool } from './profissoes.js';

export {
  buscarDeputados,
  buscarDeputadosTool,
  detalharDeputado,
  detalharDeputadoTool,
  despesasDeputado,
  despesasDeputadoTool,
  discursosDeputado,
  discursosDeputadoTool,
  eventosDeputado,
  eventosDeputadoTool,
  frentesDeputado,
  frentesDeputadoTool,
  ocupacoesDeputado,
  ocupacoesDeputadoTool,
  orgaosDeputado,
  orgaosDeputadoTool,
  profissoesDeputado,
  profissoesDeputadoTool
};

export const deputadosTools = [
  buscarDeputadosTool,
  detalharDeputadoTool,
  despesasDeputadoTool,
  discursosDeputadoTool,
  eventosDeputadoTool,
  frentesDeputadoTool,
  ocupacoesDeputadoTool,
  orgaosDeputadoTool,
  profissoesDeputadoTool
];
