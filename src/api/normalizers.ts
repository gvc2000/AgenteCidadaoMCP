import { formatCurrency } from '../utils/currency.js';

export class DataNormalizer {
  // Normalização de deputado
  static normalizeDeputado(raw: any) {
    const ultimoStatus = raw.ultimoStatus || {};

    return {
      id: raw.id,
      uri: raw.uri,
      nome: ultimoStatus.nome || raw.nome,
      nomeCompleto: raw.nomeCivil,
      nomeCivil: raw.nomeCivil,
      cpf: raw.cpf,
      sexo: ultimoStatus.data?.sexo || raw.sexo,
      dataNascimento: raw.dataNascimento,
      dataFalecimento: raw.dataFalecimento,
      ufNascimento: raw.ufNascimento,
      municipioNascimento: raw.municipioNascimento,
      escolaridade: raw.escolaridade,
      partido: {
        sigla: ultimoStatus.siglaPartido || raw.siglaPartido,
        nome: ultimoStatus.nomePartido,
        uri: ultimoStatus.uriPartido
      },
      uf: ultimoStatus.siglaUf || raw.siglaUf,
      idLegislatura: ultimoStatus.idLegislatura,
      situacao: ultimoStatus.situacao,
      condicaoEleitoral: ultimoStatus.condicaoEleitoral,
      descricaoStatus: ultimoStatus.descricaoStatus,
      email: ultimoStatus.email,
      redesSociais: ultimoStatus.redeSocial || [],
      urlWebsite: ultimoStatus.urlWebsite,
      gabinete: ultimoStatus.gabinete ? {
        nome: ultimoStatus.gabinete.nome,
        sala: ultimoStatus.gabinete.sala,
        predio: ultimoStatus.gabinete.predio,
        andar: ultimoStatus.gabinete.andar,
        telefone: ultimoStatus.gabinete.telefone,
        email: ultimoStatus.gabinete.email
      } : undefined,
      urlFoto: ultimoStatus.urlFoto,
      _metadata: {
        source: raw.uri,
        fetchedAt: new Date().toISOString(),
        normalized: true,
        version: 'v2'
      }
    };
  }

  // Normalização de proposição
  static normalizeProposicao(raw: any) {
    return {
      id: raw.id,
      uri: raw.uri,
      siglaTipo: raw.siglaTipo,
      codTipo: raw.codTipo,
      numero: raw.numero,
      ano: raw.ano,
      ementa: raw.ementa,
      ementaDetalhada: raw.ementaDetalhada,
      keywords: raw.keywords,
      dataApresentacao: raw.dataApresentacao,
      uriOrgaoNumerador: raw.uriOrgaoNumerador,
      statusProposicao: raw.statusProposicao ? {
        dataHora: raw.statusProposicao.dataHora,
        sequencia: raw.statusProposicao.sequencia,
        siglaOrgao: raw.statusProposicao.siglaOrgao,
        uriOrgao: raw.statusProposicao.uriOrgao,
        uriUltimoRelator: raw.statusProposicao.uriUltimoRelator,
        regime: raw.statusProposicao.regime,
        descricaoTramitacao: raw.statusProposicao.descricaoTramitacao,
        codTipoTramitacao: raw.statusProposicao.codTipoTramitacao,
        descricaoSituacao: raw.statusProposicao.descricaoSituacao,
        codSituacao: raw.statusProposicao.codSituacao,
        despacho: raw.statusProposicao.despacho,
        url: raw.statusProposicao.url,
        ambito: raw.statusProposicao.ambito
      } : undefined,
      uriAutores: raw.uriAutores,
      urlInteiroTeor: raw.urlInteiroTeor,
      uriPropPrincipal: raw.uriPropPrincipal,
      uriPropAnterior: raw.uriPropAnterior,
      uriPropPosterior: raw.uriPropPosterior,
      urlInteiroTeorAnexo: raw.urlInteiroTeorAnexo,
      _metadata: {
        source: raw.uri,
        fetchedAt: new Date().toISOString(),
        normalized: true,
        version: 'v2'
      }
    };
  }

  // Normalização de despesa
  static normalizeDespesa(raw: any) {
    return {
      ano: raw.ano,
      mes: raw.mes,
      tipoDespesa: raw.tipoDespesa,
      codDocumento: raw.codDocumento,
      tipoDocumento: raw.tipoDocumento,
      codTipoDocumento: raw.codTipoDocumento,
      dataDocumento: raw.dataDocumento,
      numDocumento: raw.numDocumento,
      valorDocumento: raw.valorDocumento,
      valorDocumentoFormatado: formatCurrency(raw.valorDocumento),
      urlDocumento: raw.urlDocumento,
      nomeFornecedor: raw.nomeFornecedor,
      cnpjCpfFornecedor: raw.cnpjCpfFornecedor,
      valorLiquido: raw.valorLiquido,
      valorLiquidoFormatado: formatCurrency(raw.valorLiquido),
      valorGlosa: raw.valorGlosa,
      valorGlosaFormatado: raw.valorGlosa ? formatCurrency(raw.valorGlosa) : undefined,
      numRessarcimento: raw.numRessarcimento,
      codLote: raw.codLote,
      parcela: raw.parcela,
      _metadata: {
        fetchedAt: new Date().toISOString(),
        normalized: true,
        version: 'v2'
      }
    };
  }

  // Normalização de votação
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
      placarSim: raw.placarSim,
      placarNao: raw.placarNao,
      placarAbstencao: raw.placarAbstencao,
      efeitosRegistrados: raw.efeitosRegistrados,
      _metadata: {
        source: raw.uri,
        fetchedAt: new Date().toISOString(),
        normalized: true,
        version: 'v2'
      }
    };
  }

  // Normalização de voto
  static normalizeVoto(raw: any) {
    return {
      deputado: {
        id: raw.deputado_?.id,
        uri: raw.deputado_?.uri,
        nome: raw.deputado_?.nome,
        siglaPartido: raw.deputado_?.siglaPartido,
        siglaUf: raw.deputado_?.siglaUf,
        idLegislatura: raw.deputado_?.idLegislatura,
        urlFoto: raw.deputado_?.urlFoto
      },
      tipoVoto: raw.tipoVoto,
      dataRegistroVoto: raw.dataRegistroVoto,
      _metadata: {
        fetchedAt: new Date().toISOString(),
        normalized: true,
        version: 'v2'
      }
    };
  }

  // Normalização de evento
  static normalizeEvento(raw: any) {
    return {
      id: raw.id,
      uri: raw.uri,
      dataHoraInicio: raw.dataHoraInicio,
      dataHoraFim: raw.dataHoraFim,
      situacao: raw.situacao,
      descricaoTipo: raw.descricaoTipo,
      descricao: raw.descricao,
      localCamara: raw.localCamara ? {
        nome: raw.localCamara.nome,
        predio: raw.localCamara.predio,
        sala: raw.localCamara.sala,
        andar: raw.localCamara.andar
      } : undefined,
      localExterno: raw.localExterno,
      orgaos: raw.orgaos || [],
      uriConvidados: raw.uriConvidados,
      uriDeputados: raw.uriDeputados,
      urlDocumentacao: raw.urlDocumentacao,
      urlRegistro: raw.urlRegistro,
      _metadata: {
        source: raw.uri,
        fetchedAt: new Date().toISOString(),
        normalized: true,
        version: 'v2'
      }
    };
  }

  // Normalização de órgão
  static normalizeOrgao(raw: any) {
    return {
      id: raw.id,
      uri: raw.uri,
      sigla: raw.sigla,
      nome: raw.nome,
      apelido: raw.apelido,
      codTipoOrgao: raw.codTipoOrgao,
      tipoOrgao: raw.tipoOrgao,
      dataInicio: raw.dataInicio,
      dataInstalacao: raw.dataInstalacao,
      dataFim: raw.dataFim,
      dataFimOriginal: raw.dataFimOriginal,
      casa: raw.casa,
      sala: raw.sala,
      urlWebsite: raw.urlWebsite,
      _metadata: {
        source: raw.uri,
        fetchedAt: new Date().toISOString(),
        normalized: true,
        version: 'v2'
      }
    };
  }

  // Normalização de partido
  static normalizePartido(raw: any) {
    // Mapeamento de siglas antigas
    const siglaMap: Record<string, string> = {
      'DEM': 'UNIÃO',
      'PSL': 'UNIÃO',
      'PODE': 'PODEMOS',
      'PR': 'PL',
      'PRB': 'REPUBLICANOS'
    };

    const sigla = raw.sigla;
    const siglaAtual = siglaMap[sigla] || sigla;

    return {
      id: raw.id,
      uri: raw.uri,
      sigla: siglaAtual,
      siglaOriginal: sigla !== siglaAtual ? sigla : undefined,
      nome: raw.nome,
      dataInicio: raw.dataInicio,
      dataFim: raw.dataFim,
      idLegislatura: raw.idLegislatura,
      urlLogo: raw.urlLogo,
      urlWebsite: raw.urlWebsite,
      _metadata: {
        source: raw.uri,
        fetchedAt: new Date().toISOString(),
        normalized: true,
        version: 'v2'
      }
    };
  }

  // Normalização de frente parlamentar
  static normalizeFrente(raw: any) {
    return {
      id: raw.id,
      uri: raw.uri,
      titulo: raw.titulo,
      idLegislatura: raw.idLegislatura,
      urlDocumento: raw.urlDocumento,
      keywords: raw.keywords,
      situacao: raw.situacao,
      _metadata: {
        source: raw.uri,
        fetchedAt: new Date().toISOString(),
        normalized: true,
        version: 'v2'
      }
    };
  }

  // Helper para normalizar arrays
  static normalizeArray<T>(
    data: any[],
    normalizer: (item: any) => T
  ): T[] {
    return data.map(item => normalizer(item));
  }
}
