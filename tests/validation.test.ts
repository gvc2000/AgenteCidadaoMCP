import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { cacheManager, createCacheKey } from '../src/core/cache.js';

describe('Validação e Cache', () => {
  describe('Cache Manager', () => {
    it('deve criar chave de cache corretamente', () => {
      const params = { id: 123, ano: 2024 };
      const key = createCacheKey(params);

      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
    });

    it('deve gerar chaves diferentes para parâmetros diferentes', () => {
      const key1 = createCacheKey({ id: 123 });
      const key2 = createCacheKey({ id: 456 });

      expect(key1).not.toBe(key2);
    });

    it('deve armazenar e recuperar dados do cache', () => {
      const testData = { test: 'data', value: 123 };
      const key = 'test-key-' + Date.now();

      cacheManager.set('deputados', key, testData);
      const cached = cacheManager.get<typeof testData>('deputados', key);

      expect(cached).toEqual(testData);
    });

    it('deve retornar undefined para chave inexistente', () => {
      const result = cacheManager.get('deputados', 'non-existent-key-' + Date.now());
      expect(result).toBeUndefined();
    });
  });

  describe('Validação de Schemas', () => {
    describe('Deputados', () => {
      const BuscarDeputadosSchema = z.object({
        nome: z.string().min(3).optional(),
        uf: z.enum(['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
                   'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
                   'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']).optional(),
        partido: z.string().optional(),
        sexo: z.enum(['M', 'F']).optional(),
        idLegislatura: z.number().int().min(1).max(57).optional(),
        pagina: z.number().int().positive().default(1).optional(),
        itens: z.number().int().min(1).max(100).default(25).optional()
      });

      it('deve validar parâmetros válidos', () => {
        const params = { uf: 'SP', partido: 'PT', itens: 10 };
        const result = BuscarDeputadosSchema.parse(params);

        expect(result.uf).toBe('SP');
        expect(result.partido).toBe('PT');
        expect(result.itens).toBe(10);
      });

      it('deve rejeitar nome muito curto', () => {
        const params = { nome: 'AB' }; // mínimo 3 caracteres

        expect(() => BuscarDeputadosSchema.parse(params)).toThrow();
      });

      it('deve rejeitar UF inválida', () => {
        const params = { uf: 'XX' as any };

        expect(() => BuscarDeputadosSchema.parse(params)).toThrow();
      });

      it('deve rejeitar sexo inválido', () => {
        const params = { sexo: 'X' as any };

        expect(() => BuscarDeputadosSchema.parse(params)).toThrow();
      });

      it('deve rejeitar legislatura fora do range', () => {
        const params = { idLegislatura: 100 }; // max é 57

        expect(() => BuscarDeputadosSchema.parse(params)).toThrow();
      });

      it('deve rejeitar itens fora do limite', () => {
        const params = { itens: 200 }; // max é 100

        expect(() => BuscarDeputadosSchema.parse(params)).toThrow();
      });
    });

    describe('Proposições', () => {
      const BuscarProposicoesSchema = z.object({
        siglaTipo: z.string().optional(),
        numero: z.number().int().positive().optional(),
        ano: z.number().int().min(1900).max(2100).optional(),
        keywords: z.string().optional(),
        pagina: z.number().int().positive().default(1).optional(),
        itens: z.number().int().min(1).max(100).default(25).optional()
      });

      it('deve validar busca por tipo e ano', () => {
        const params = { siglaTipo: 'PL', ano: 2024 };
        const result = BuscarProposicoesSchema.parse(params);

        expect(result.siglaTipo).toBe('PL');
        expect(result.ano).toBe(2024);
      });

      it('deve validar busca por keywords como string', () => {
        const params = { keywords: 'meio ambiente' };
        const result = BuscarProposicoesSchema.parse(params);

        expect(result.keywords).toBe('meio ambiente');
      });

      it('deve rejeitar ano inválido', () => {
        const params = { ano: 1800 }; // min é 1900

        expect(() => BuscarProposicoesSchema.parse(params)).toThrow();
      });

      it('deve rejeitar número negativo', () => {
        const params = { numero: -1 };

        expect(() => BuscarProposicoesSchema.parse(params)).toThrow();
      });
    });

    describe('IDs', () => {
      const IdSchema = z.object({
        id: z.number().int().positive()
      });

      it('deve validar ID positivo', () => {
        const result = IdSchema.parse({ id: 204554 });
        expect(result.id).toBe(204554);
      });

      it('deve rejeitar ID zero', () => {
        expect(() => IdSchema.parse({ id: 0 })).toThrow();
      });

      it('deve rejeitar ID negativo', () => {
        expect(() => IdSchema.parse({ id: -1 })).toThrow();
      });

      it('deve rejeitar ID não inteiro', () => {
        expect(() => IdSchema.parse({ id: 1.5 })).toThrow();
      });
    });

    describe('Datas', () => {
      const DateSchema = z.object({
        dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
      });

      it('deve validar formato de data correto', () => {
        const result = DateSchema.parse({
          dataInicio: '2024-01-01',
          dataFim: '2024-12-31'
        });

        expect(result.dataInicio).toBe('2024-01-01');
        expect(result.dataFim).toBe('2024-12-31');
      });

      it('deve rejeitar formato de data inválido', () => {
        expect(() => DateSchema.parse({ dataInicio: '01/01/2024' })).toThrow();
        expect(() => DateSchema.parse({ dataInicio: '2024-1-1' })).toThrow();
        expect(() => DateSchema.parse({ dataInicio: '2024/01/01' })).toThrow();
      });
    });

    describe('Paginação', () => {
      const PaginacaoSchema = z.object({
        pagina: z.number().int().positive().default(1),
        itens: z.number().int().min(1).max(100).default(25),
        ordem: z.enum(['ASC', 'DESC']).default('ASC')
      });

      it('deve usar valores padrão', () => {
        const result = PaginacaoSchema.parse({});

        expect(result.pagina).toBe(1);
        expect(result.itens).toBe(25);
        expect(result.ordem).toBe('ASC');
      });

      it('deve aceitar valores personalizados', () => {
        const result = PaginacaoSchema.parse({
          pagina: 5,
          itens: 50,
          ordem: 'DESC'
        });

        expect(result.pagina).toBe(5);
        expect(result.itens).toBe(50);
        expect(result.ordem).toBe('DESC');
      });

      it('deve rejeitar página zero ou negativa', () => {
        expect(() => PaginacaoSchema.parse({ pagina: 0 })).toThrow();
        expect(() => PaginacaoSchema.parse({ pagina: -1 })).toThrow();
      });

      it('deve rejeitar ordem inválida', () => {
        expect(() => PaginacaoSchema.parse({ ordem: 'INVALID' as any })).toThrow();
      });
    });
  });
});
