// Análises e Agregações - Ferramentas compostas para análise de dados

export { analisePresencaDeputado, analisePresencaTool } from './analise-presenca.js';
export { rankingProposicoesAutor, rankingProposicoesTool } from './ranking-proposicoes.js';
export { analiseDespesasPartido, analiseDespesasPartidoTool } from './analise-despesas-partido.js';
export { comparativoVotacoesBancadas, comparativoVotacoesTool } from './comparativo-votacoes.js';
export { timelineTramitacao, timelineTramitacaoTool } from './timeline-tramitacao.js';
export { exportarDados, exportarDadosTool } from './exportar-dados.js';

import { analisePresencaTool } from './analise-presenca.js';
import { rankingProposicoesTool } from './ranking-proposicoes.js';
import { analiseDespesasPartidoTool } from './analise-despesas-partido.js';
import { comparativoVotacoesTool } from './comparativo-votacoes.js';
import { timelineTramitacaoTool } from './timeline-tramitacao.js';
import { exportarDadosTool } from './exportar-dados.js';

export const analisesTools = [
  analisePresencaTool,
  rankingProposicoesTool,
  analiseDespesasPartidoTool,
  comparativoVotacoesTool,
  timelineTramitacaoTool,
  exportarDadosTool
];
