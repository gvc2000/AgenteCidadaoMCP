import { PaginationResponse } from '../core/schemas.js';

export class DataNormalizer {
  /**
   * Normaliza informações de paginação da API
   */
  static normalizePagination(links: any[]): PaginationResponse {
    const currentPage = links?.find((l) => l.rel === 'self');
    const nextPage = links?.find((l) => l.rel === 'next');
    const prevPage = links?.find((l) => l.rel === 'previous');
    const firstPage = links?.find((l) => l.rel === 'first');
    const lastPage = links?.find((l) => l.rel === 'last');

    // Extrai número de página da URL
    const extractPage = (href: string | undefined): number => {
      if (!href) return 0;
      const match = href.match(/[?&]pagina=(\d+)/);
      return match ? parseInt(match[1], 10) : 1;
    };

    // Extrai número de itens da URL
    const extractItens = (href: string | undefined): number => {
      if (!href) return 25;
      const match = href.match(/[?&]itens=(\d+)/);
      return match ? parseInt(match[1], 10) : 25;
    };

    const pagina = extractPage(currentPage?.href) || 1;
    const itens = extractItens(currentPage?.href);
    const ultimaPagina = extractPage(lastPage?.href) || pagina;

    return {
      pagina,
      itens,
      total: ultimaPagina * itens, // Estimativa
      totalPaginas: ultimaPagina,
      hasNext: !!nextPage,
      hasPrev: !!prevPage,
    };
  }

  /**
   * Normaliza dados de deputado
   */
  static normalizeDeputado(raw: any) {
    return {
      id: raw.id,
      uri: raw.uri,
      nome: raw.nome,
      siglaPartido: raw.siglaPartido,
      uriPartido: raw.uriPartido,
      siglaUf: raw.siglaUf,
      idLegislatura: raw.idLegislatura,
      urlFoto: raw.urlFoto,
      email: raw.email,
    };
  }

  /**
   * Normaliza dados detalhados de deputado
   */
  static normalizeDeputadoDetalhado(raw: any) {
    const ultimoStatus = raw.ultimoStatus || {};
    return {
      id: raw.id,
      uri: raw.uri,
      nomeCivil: raw.nomeCivil,
      nome: ultimoStatus.nome || raw.nome,
      cpf: raw.cpf,
      sexo: raw.sexo,
      dataNascimento: raw.dataNascimento,
      dataFalecimento: raw.dataFalecimento,
      ufNascimento: raw.ufNascimento,
      municipioNascimento: raw.municipioNascimento,
      escolaridade: raw.escolaridade,
      ultimoStatus: {
        id: ultimoStatus.id,
        uri: ultimoStatus.uri,
        nome: ultimoStatus.nome,
        siglaPartido: ultimoStatus.siglaPartido,
        uriPartido: ultimoStatus.uriPartido,
        siglaUf: ultimoStatus.siglaUf,
        idLegislatura: ultimoStatus.idLegislatura,
        urlFoto: ultimoStatus.urlFoto,
        email: ultimoStatus.email,
        data: ultimoStatus.data,
        nomeEleitoral: ultimoStatus.nomeEleitoral,
        gabinete: ultimoStatus.gabinete,
        situacao: ultimoStatus.situacao,
        condicaoEleitoral: ultimoStatus.condicaoEleitoral,
        descricaoStatus: ultimoStatus.descricaoStatus,
      },
      redeSocial: raw.redeSocial || [],
    };
  }

  /**
   * Normaliza proposição
   */
  static normalizeProposicao(raw: any) {
    return {
      id: raw.id,
      uri: raw.uri,
      siglaTipo: raw.siglaTipo,
      codTipo: raw.codTipo,
      numero: raw.numero,
      ano: raw.ano,
      ementa: raw.ementa,
      dataApresentacao: raw.dataApresentacao,
      statusProposicao: raw.statusProposicao,
      uriAutores: raw.uriAutores,
      descricaoTipo: raw.descricaoTipo,
      ementaDetalhada: raw.ementaDetalhada,
      keywords: raw.keywords,
      uriOrgaoNumerador: raw.uriOrgaoNumerador,
    };
  }

  /**
   * Normaliza votação
   */
  static normalizeVotacao(raw: any) {
    return {
      id: raw.id,
      uri: raw.uri,
      data: raw.data,
      dataHoraRegistro: raw.dataHoraRegistro,
      siglaOrgao: raw.siglaOrgao,
      uriOrgao: raw.uriOrgao,
      uriEvento: raw.uriEvento,
      proposicaoObjeto: raw.proposicaoObjeto,
      uriProposicaoObjeto: raw.uriProposicaoObjeto,
      descricao: raw.descricao,
      aprovacao: raw.aprovacao,
    };
  }

  /**
   * Normaliza evento
   */
  static normalizeEvento(raw: any) {
    return {
      id: raw.id,
      uri: raw.uri,
      dataHoraInicio: raw.dataHoraInicio,
      dataHoraFim: raw.dataHoraFim,
      situacao: raw.situacao,
      descricaoTipo: raw.descricaoTipo,
      descricao: raw.descricao,
      localCamara: raw.localCamara,
      localExterno: raw.localExterno,
      orgaos: raw.orgaos,
      requerimentos: raw.requerimentos,
      urlRegistro: raw.urlRegistro,
    };
  }

  /**
   * Normaliza órgão
   */
  static normalizeOrgao(raw: any) {
    return {
      id: raw.id,
      uri: raw.uri,
      sigla: raw.sigla,
      nome: raw.nome,
      apelido: raw.apelido,
      codTipoOrgao: raw.codTipoOrgao,
      tipoOrgao: raw.tipoOrgao,
      nomePublicacao: raw.nomePublicacao,
      nomeResumido: raw.nomeResumido,
    };
  }

  /**
   * Normaliza partido
   */
  static normalizePartido(raw: any) {
    return {
      id: raw.id,
      uri: raw.uri,
      sigla: raw.sigla,
      nome: raw.nome,
      dataInicio: raw.dataInicio,
      dataFim: raw.dataFim,
      idLegislatura: raw.idLegislatura,
      urlLogo: raw.urlLogo,
      urlWebSite: raw.urlWebSite,
    };
  }

  /**
   * Formata valores monetários
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Normaliza data para formato ISO
   */
  static normalizeDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * Adiciona metadados à resposta
   */
  static addMetadata(data: any, cached = false, latency?: number) {
    return {
      ...data,
      _metadata: {
        cache: cached,
        latencyMs: latency,
        apiVersion: 'v2',
        fetchedAt: new Date().toISOString(),
      },
    };
  }
}
