import { buscarBlocos, buscarBlocosTool } from './buscar.js';
import { detalharBloco, detalharBlocoTool } from './detalhar.js';

export {
  buscarBlocos, buscarBlocosTool,
  detalharBloco, detalharBlocoTool
};

export const blocosTools = [
  buscarBlocosTool,
  detalharBlocoTool
];
