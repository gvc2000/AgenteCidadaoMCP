import { buscarPartidos, buscarPartidosTool } from './buscar.js';
import { detalharPartido, detalharPartidoTool } from './detalhar.js';
import { membrosPartido, membrosPartidoTool } from './membros.js';
import { lideresPartido, lideresPartidoTool } from './lideres.js';

export {
  buscarPartidos, buscarPartidosTool,
  detalharPartido, detalharPartidoTool,
  membrosPartido, membrosPartidoTool,
  lideresPartido, lideresPartidoTool
};

export const partidosTools = [
  buscarPartidosTool,
  detalharPartidoTool,
  membrosPartidoTool,
  lideresPartidoTool
];
