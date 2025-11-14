import { situacoesProposicao, situacoesProposicaoTool } from './situacoes.js';
import { tiposProposicao, tiposProposicaoTool } from './tipos-proposicao.js';
import { tiposOrgao, tiposOrgaoTool } from './tipos-orgao.js';
import { tiposEvento, tiposEventoTool } from './tipos-evento.js';
import { ufs, ufsTool } from './ufs.js';

export {
  situacoesProposicao, situacoesProposicaoTool,
  tiposProposicao, tiposProposicaoTool,
  tiposOrgao, tiposOrgaoTool,
  tiposEvento, tiposEventoTool,
  ufs, ufsTool
};

export const referenciasTools = [
  situacoesProposicaoTool,
  tiposProposicaoTool,
  tiposOrgaoTool,
  tiposEventoTool,
  ufsTool
];
