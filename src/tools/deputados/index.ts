import { buscarDeputados, buscarDeputadosTool } from './buscar.js';
import { detalharDeputado, detalharDeputadoTool } from './detalhar.js';
import { obterPerfilCompleto, obterPerfilCompletoTool } from './perfil-completo.js';
import { despesasDeputado, despesasDeputadoTool } from './despesas.js';
import { resumoDespesasDeputado, resumoDespesasDeputadoTool } from './resumo-despesas.js';
import { discursosDeputado, discursosDeputadoTool } from './discursos.js';
import { resumoDiscursosDeputado, resumoDiscursosDeputadoTool } from './resumo-discursos.js';
import { eventosDeputado, eventosDeputadoTool } from './eventos.js';
import { frentesDeputado, frentesDeputadoTool } from './frentes.js';
import { ocupacoesDeputado, ocupacoesDeputadoTool } from './ocupacoes.js';
import { orgaosDeputado, orgaosDeputadoTool } from './orgaos.js';
import { profissoesDeputado, profissoesDeputadoTool } from './profissoes.js';
import { historicoVotosDeputado, historicoVotosDeputadoTool } from './historico-votos-deputado.js';

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
  resumoDiscursosDeputado,
  resumoDiscursosDeputadoTool,
  eventosDeputado,
  eventosDeputadoTool,
  frentesDeputado,
  frentesDeputadoTool,
  ocupacoesDeputado,
  ocupacoesDeputadoTool,
  orgaosDeputado,
  orgaosDeputadoTool,
  profissoesDeputado,
  profissoesDeputadoTool,
  historicoVotosDeputado,
  historicoVotosDeputadoTool
};

export const deputadosTools = [
  buscarDeputadosTool,
  detalharDeputadoTool,
  obterPerfilCompletoTool,
  despesasDeputadoTool,
  resumoDespesasDeputadoTool,
  discursosDeputadoTool,
  resumoDiscursosDeputadoTool,
  eventosDeputadoTool,
  frentesDeputadoTool,
  ocupacoesDeputadoTool,
  orgaosDeputadoTool,
  profissoesDeputadoTool,
  historicoVotosDeputadoTool
];
