import { buscarDeputados, buscarDeputadosTool } from './buscar.js';
import { detalharDeputado, detalharDeputadoTool } from './detalhar.js';
import { despesasDeputado, despesasDeputadoTool } from './despesas.js';
import { discursosDeputado, discursosDeputadoTool } from './discursos.js';
import { eventosDeputado, eventosDeputadoTool } from './eventos.js';
import { frentesDeputado, frentesDeputadoTool } from './frentes.js';
import { orgaosDeputado, orgaosDeputadoTool } from './orgaos.js';

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
  orgaosDeputado,
  orgaosDeputadoTool
};

export const deputadosTools = [
  buscarDeputadosTool,
  detalharDeputadoTool,
  despesasDeputadoTool,
  discursosDeputadoTool,
  eventosDeputadoTool,
  frentesDeputadoTool,
  orgaosDeputadoTool
];
