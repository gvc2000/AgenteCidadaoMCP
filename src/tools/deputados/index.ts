import { buscarDeputados, buscarDeputadosTool } from './buscar.js';
import { detalharDeputado, detalharDeputadoTool } from './detalhar.js';
import { obterPerfilCompleto, obterPerfilCompletoTool } from './perfil-completo.js';
import { despesasDeputado, despesasDeputadoTool } from './despesas.js';
import { resumoDespesasDeputado, resumoDespesasDeputadoTool } from './resumo-despesas.js';
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
  obterPerfilCompleto,
  obterPerfilCompletoTool,
  despesasDeputado,
  despesasDeputadoTool,
  resumoDespesasDeputado,
  resumoDespesasDeputadoTool,
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
  obterPerfilCompletoTool,
  despesasDeputadoTool,
  resumoDespesasDeputadoTool,
  discursosDeputadoTool,
  eventosDeputadoTool,
  frentesDeputadoTool,
  ocupacoesDeputadoTool,
  orgaosDeputadoTool,
  profissoesDeputadoTool
];
