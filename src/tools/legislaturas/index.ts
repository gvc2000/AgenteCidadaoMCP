import { buscarLegislaturas, buscarLegislaturasTool } from './buscar.js';
import { detalharLegislatura, detalharLegislaturaTool } from './detalhar.js';
import { mesaLegislatura, mesaLegislaturaTool } from './mesa.js';

export {
  buscarLegislaturas, buscarLegislaturasTool,
  detalharLegislatura, detalharLegislaturaTool,
  mesaLegislatura, mesaLegislaturaTool
};

export const legislaturasTools = [
  buscarLegislaturasTool,
  detalharLegislaturaTool,
  mesaLegislaturaTool
];
