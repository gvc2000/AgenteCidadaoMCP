import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import nock from 'nock';
import { buscarDeputados } from '../src/tools/deputados/buscar.js';
import { detalharDeputado } from '../src/tools/deputados/detalhar.js';
import { despesasDeputado } from '../src/tools/deputados/despesas.js';
import { cacheManager } from '../src/core/cache.js';

const API_BASE = 'https://dadosabertos.camara.leg.br';

describe('Deputados Tools', () => {
  beforeEach(() => {
    // Limpar cache antes de cada teste
    cacheManager.clear('deputados');
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('buscarDeputados', () => {
    it('deve buscar deputados sem filtros', async () => {
      const mockResponse = {
        dados: [
          {
            id: 204554,
            nome: 'MARINA SILVA',
            siglaPartido: 'REDE',
            siglaUf: 'SP',
            idLegislatura: 57,
            urlFoto: 'https://example.com/foto.jpg',
            email: 'marina@camara.leg.br'
          },
          {
            id: 204555,
            nome: 'JOAO SILVA',
            siglaPartido: 'PT',
            siglaUf: 'RJ',
            idLegislatura: 57,
            urlFoto: 'https://example.com/foto2.jpg',
            email: 'joao@camara.leg.br'
          }
        ],
        links: []
      };

      nock(API_BASE)
        .get('/api/v2/deputados')
        .query(true)
        .reply(200, mockResponse);

      const result = await buscarDeputados({});

      expect(result).toBeDefined();
      expect(result.deputados).toBeDefined();
      expect(result.deputados.length).toBe(2);
      expect(result.deputados[0].nome).toBe('MARINA SILVA');
      expect(result._metadata).toBeDefined();
      expect(result._metadata.cache).toBe(false);
    });

    it('deve buscar deputados por UF', async () => {
      const mockResponse = {
        dados: [
          {
            id: 204554,
            nome: 'MARINA SILVA',
            siglaPartido: 'REDE',
            siglaUf: 'SP',
            idLegislatura: 57
          }
        ],
        links: []
      };

      nock(API_BASE)
        .get('/api/v2/deputados')
        .query({ siglaUf: 'SP' })
        .reply(200, mockResponse);

      const result = await buscarDeputados({ uf: 'SP' });

      expect(result.deputados.length).toBe(1);
      expect(result.deputados[0].siglaUf).toBe('SP');
    });

    it('deve buscar deputados por partido', async () => {
      const mockResponse = {
        dados: [
          {
            id: 204555,
            nome: 'JOAO SILVA',
            siglaPartido: 'PT',
            siglaUf: 'RJ',
            idLegislatura: 57
          }
        ],
        links: []
      };

      nock(API_BASE)
        .get('/api/v2/deputados')
        .query({ siglaPartido: 'PT' })
        .reply(200, mockResponse);

      const result = await buscarDeputados({ partido: 'PT' });

      expect(result.deputados.length).toBe(1);
      expect(result.deputados[0].siglaPartido).toBe('PT');
    });

    it('deve validar parâmetros inválidos', async () => {
      await expect(
        buscarDeputados({ nome: 'AB' }) // mínimo 3 caracteres
      ).rejects.toThrow();
    });

    it('deve validar UF inválida', async () => {
      await expect(
        buscarDeputados({ uf: 'XX' as any })
      ).rejects.toThrow();
    });

    it('deve usar cache quando disponível', async () => {
      const mockResponse = {
        dados: [
          {
            id: 204554,
            nome: 'MARINA SILVA',
            siglaPartido: 'REDE',
            siglaUf: 'SP',
            idLegislatura: 57
          }
        ],
        links: []
      };

      const scope = nock(API_BASE)
        .get('/api/v2/deputados')
        .query(true)
        .reply(200, mockResponse);

      // Primeira chamada - sem cache
      const result1 = await buscarDeputados({});
      expect(result1._metadata.cache).toBe(false);

      // Segunda chamada - com cache
      const result2 = await buscarDeputados({});
      expect(result2._metadata.cache).toBe(true);

      // Verificar que a API foi chamada apenas uma vez
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('detalharDeputado', () => {
    it('deve retornar detalhes de um deputado', async () => {
      const mockResponse = {
        dados: {
          id: 204554,
          nomeCivil: 'Maria Osmarina Marina da Silva Vaz de Lima',
          cpf: '123.456.789-00',
          sexo: 'F',
          urlWebsite: 'https://marina.leg.br',
          dataNascimento: '1958-02-08',
          ufNascimento: 'AC',
          municipioNascimento: 'Rio Branco',
          escolaridade: 'Superior',
          ultimoStatus: {
            id: 204554,
            nome: 'MARINA SILVA',
            siglaPartido: 'REDE',
            siglaUf: 'SP',
            idLegislatura: 57,
            situacao: 'Exercício',
            condicaoEleitoral: 'Titular'
          }
        }
      };

      nock(API_BASE)
        .get('/api/v2/deputados/204554')
        .reply(200, mockResponse);

      const result = await detalharDeputado({ id: 204554 });

      expect(result).toBeDefined();
      expect(result.deputado.id).toBe(204554);
      expect(result.deputado.nomeCivil).toBe('Maria Osmarina Marina da Silva Vaz de Lima');
      expect(result._metadata.cache).toBe(false);
    });

    it('deve validar ID inválido', async () => {
      await expect(
        detalharDeputado({ id: -1 })
      ).rejects.toThrow();
    });

    it('deve tratar erro 404', async () => {
      nock(API_BASE)
        .get('/api/v2/deputados/999999')
        .reply(404, { error: 'Not found' });

      await expect(
        detalharDeputado({ id: 999999 })
      ).rejects.toThrow();
    });
  });

  describe('despesasDeputado', () => {
    it('deve retornar despesas de um deputado', async () => {
      const mockResponse = {
        dados: [
          {
            ano: 2024,
            mes: 1,
            tipoDespesa: 'COMBUSTÍVEIS E LUBRIFICANTES',
            codDocumento: 123456,
            tipoDocumento: 'Nota Fiscal',
            dataDocumento: '2024-01-15',
            numDocumento: '123',
            valorDocumento: 500.00,
            urlDocumento: 'https://example.com/doc.pdf',
            nomeFornecedor: 'Posto de Gasolina',
            cnpjCpfFornecedor: '12.345.678/0001-90',
            valorLiquido: 450.00,
            valorGlosa: 50.00
          }
        ],
        links: []
      };

      nock(API_BASE)
        .get('/api/v2/deputados/204554/despesas')
        .query(true)
        .reply(200, mockResponse);

      const result = await despesasDeputado({ id: 204554, ano: 2024 });

      expect(result).toBeDefined();
      expect(result.despesas).toBeDefined();
      expect(result.despesas.length).toBe(1);
      expect(result.despesas[0].valorDocumento).toBe(500.00);
      expect(result._metadata.cache).toBe(false);
    });

    it('deve filtrar por mês', async () => {
      const mockResponse = {
        dados: [
          {
            ano: 2024,
            mes: 6,
            tipoDespesa: 'COMBUSTÍVEIS E LUBRIFICANTES',
            valorDocumento: 500.00
          }
        ],
        links: []
      };

      nock(API_BASE)
        .get('/api/v2/deputados/204554/despesas')
        .query({ ano: 2024, mes: 6 })
        .reply(200, mockResponse);

      const result = await despesasDeputado({ id: 204554, ano: 2024, mes: 6 });

      expect(result.despesas.length).toBe(1);
      expect(result.despesas[0].mes).toBe(6);
    });
  });
});
