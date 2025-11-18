import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { buscarProposicoes } from '../src/tools/proposicoes/buscar.js';
import { detalharProposicao } from '../src/tools/proposicoes/detalhar.js';
import { tramitacoesProposicao } from '../src/tools/proposicoes/tramitacoes.js';
import { autoresProposicao } from '../src/tools/proposicoes/autores.js';
import { cacheManager } from '../src/core/cache.js';

const API_BASE = 'https://dadosabertos.camara.leg.br';

describe('Proposicoes Tools', () => {
  beforeEach(() => {
    cacheManager.clear('proposicoes');
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('buscarProposicoes', () => {
    it('deve buscar proposições por tipo e ano', async () => {
      const mockResponse = {
        dados: [
          {
            id: 2440539,
            uri: 'https://dadosabertos.camara.leg.br/api/v2/proposicoes/2440539',
            siglaTipo: 'PL',
            codTipo: 139,
            numero: 1234,
            ano: 2024,
            ementa: 'Altera a legislação tributária'
          },
          {
            id: 2440540,
            uri: 'https://dadosabertos.camara.leg.br/api/v2/proposicoes/2440540',
            siglaTipo: 'PL',
            codTipo: 139,
            numero: 1235,
            ano: 2024,
            ementa: 'Dispõe sobre educação'
          }
        ],
        links: []
      };

      nock(API_BASE)
        .get('/api/v2/proposicoes')
        .query(true)
        .reply(200, mockResponse);

      const result = await buscarProposicoes({ siglaTipo: 'PL', ano: 2024, itens: 5 });

      expect(result).toBeDefined();
      expect(result.proposicoes).toBeDefined();
      expect(result.proposicoes.length).toBe(2);
      expect(result.proposicoes[0].siglaTipo).toBe('PL');
      expect(result.proposicoes[0].ano).toBe(2024);
    });

    it('deve buscar PECs', async () => {
      const mockResponse = {
        dados: [
          {
            id: 2440600,
            siglaTipo: 'PEC',
            numero: 45,
            ano: 2024,
            ementa: 'Reforma tributária'
          }
        ],
        links: []
      };

      nock(API_BASE)
        .get('/api/v2/proposicoes')
        .query(true)
        .reply(200, mockResponse);

      const result = await buscarProposicoes({ siglaTipo: 'PEC' });

      expect(result.proposicoes.length).toBe(1);
      expect(result.proposicoes[0].siglaTipo).toBe('PEC');
    });

    it('deve buscar por palavras-chave', async () => {
      const mockResponse = {
        dados: [
          {
            id: 2440700,
            siglaTipo: 'PL',
            numero: 100,
            ano: 2024,
            ementa: 'Dispõe sobre meio ambiente e sustentabilidade'
          }
        ],
        links: []
      };

      nock(API_BASE)
        .get('/api/v2/proposicoes')
        .query(true)
        .reply(200, mockResponse);

      const result = await buscarProposicoes({ keywords: ['meio ambiente'] });

      expect(result.proposicoes.length).toBe(1);
    });
  });

  describe('detalharProposicao', () => {
    it('deve retornar detalhes de uma proposição', async () => {
      const mockResponse = {
        dados: {
          id: 2440539,
          uri: 'https://dadosabertos.camara.leg.br/api/v2/proposicoes/2440539',
          siglaTipo: 'PL',
          codTipo: 139,
          numero: 1234,
          ano: 2024,
          ementa: 'Altera a legislação tributária',
          dataApresentacao: '2024-03-15',
          urlInteiroTeor: 'https://example.com/inteiro-teor.pdf',
          statusProposicao: {
            dataHora: '2024-03-20T14:30:00',
            sequencia: 1,
            siglaOrgao: 'CCJC',
            regime: 'Urgência',
            descricaoTramitacao: 'Aguardando designação de relator',
            descricaoSituacao: 'Pronta para pauta'
          }
        }
      };

      nock(API_BASE)
        .get('/api/v2/proposicoes/2440539')
        .reply(200, mockResponse);

      const result = await detalharProposicao({ id: 2440539 });

      expect(result).toBeDefined();
      expect(result.proposicao.id).toBe(2440539);
      expect(result.proposicao.siglaTipo).toBe('PL');
      expect(result.proposicao.statusProposicao).toBeDefined();
    });

    it('deve validar ID inválido', async () => {
      await expect(
        detalharProposicao({ id: 0 })
      ).rejects.toThrow();
    });
  });

  describe('tramitacoesProposicao', () => {
    it('deve retornar tramitações de uma proposição', async () => {
      const mockResponse = {
        dados: [
          {
            dataHora: '2024-03-15T10:00:00',
            sequencia: 1,
            siglaOrgao: 'MESA',
            regime: 'Ordinário',
            descricaoTramitacao: 'Apresentação',
            descricaoSituacao: 'Aguardando leitura',
            despacho: 'Encaminhe-se à CCJC'
          },
          {
            dataHora: '2024-03-20T14:30:00',
            sequencia: 2,
            siglaOrgao: 'CCJC',
            regime: 'Ordinário',
            descricaoTramitacao: 'Recebimento',
            descricaoSituacao: 'Aguardando designação de relator'
          }
        ],
        links: []
      };

      nock(API_BASE)
        .get('/api/v2/proposicoes/2440539/tramitacoes')
        .query(true)
        .reply(200, mockResponse);

      const result = await tramitacoesProposicao({ id: 2440539 });

      expect(result).toBeDefined();
      expect(result.tramitacoes).toBeDefined();
      expect(result.tramitacoes.length).toBe(2);
      expect(result.tramitacoes[0].sequencia).toBe(1);
    });
  });

  describe('autoresProposicao', () => {
    it('deve retornar autores de uma proposição', async () => {
      const mockResponse = {
        dados: [
          {
            uri: 'https://dadosabertos.camara.leg.br/api/v2/deputados/204554',
            nome: 'Marina Silva',
            codTipo: 10000,
            tipo: 'Deputado',
            ordemAssinatura: 1,
            proponente: 1
          }
        ],
        links: []
      };

      nock(API_BASE)
        .get('/api/v2/proposicoes/2440539/autores')
        .reply(200, mockResponse);

      const result = await autoresProposicao({ id: 2440539 });

      expect(result).toBeDefined();
      expect(result.autores).toBeDefined();
      expect(result.autores.length).toBe(1);
      expect(result.autores[0].nome).toBe('Marina Silva');
    });
  });
});
