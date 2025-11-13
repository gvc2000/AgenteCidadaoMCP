import { describe, it, expect } from 'vitest';
import { buscarDeputados } from '../../src/tools/deputados/index.js';
import { buscarProposicoes } from '../../src/tools/proposicoes/index.js';

describe('Integration Tests', () => {
  it('should fetch deputados', async () => {
    const result = await buscarDeputados({
      uf: 'SP',
      pagina: 1,
      itens: 5,
    });

    expect(result).toHaveProperty('deputados');
    expect(result).toHaveProperty('paginacao');
    expect(Array.isArray(result.deputados)).toBe(true);
  }, 30000);

  it('should fetch proposicoes', async () => {
    const result = await buscarProposicoes({
      siglaTipo: 'PL',
      ano: 2024,
      pagina: 1,
      itens: 5,
    });

    expect(result).toHaveProperty('proposicoes');
    expect(result).toHaveProperty('paginacao');
    expect(Array.isArray(result.proposicoes)).toBe(true);
  }, 30000);
});
