import { buscarFrentes, buscarFrentesTool } from './buscar.js';
import { detalharFrente, detalharFrenteTool } from './detalhar.js';
import { membrosFrente, membrosFrenteTool } from './membros.js';

export {
  buscarFrentes, buscarFrentesTool,
  detalharFrente, detalharFrenteTool,
  membrosFrente, membrosFrenteTool
};

export const frentesTools = [
  buscarFrentesTool,
  detalharFrenteTool,
  membrosFrenteTool
];
