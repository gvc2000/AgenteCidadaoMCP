/**
 * MCP Prompts para o Agente Cidadão
 *
 * Prompts que guiam o agente a usar corretamente as ferramentas
 * da API da Câmara dos Deputados.
 */

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: {
    name: string;
    description: string;
    required: boolean;
  }[];
}

export interface MCPPromptMessage {
  role: 'user' | 'assistant';
  content: {
    type: 'text';
    text: string;
  };
}

// Definição dos prompts disponíveis
export const prompts: MCPPrompt[] = [
  {
    name: 'consultar_deputado',
    description: 'Guia completo para consultar informações sobre deputados federais brasileiros. Use quando precisar buscar dados de um deputado específico ou listar deputados por critérios.',
    arguments: [
      {
        name: 'criterio',
        description: 'Critério de busca: nome do deputado, UF (ex: SP, RJ), partido (ex: PT, PL) ou ID numérico',
        required: true
      }
    ]
  },
  {
    name: 'acompanhar_proposicao',
    description: 'Guia para acompanhar tramitação de projetos de lei e outras proposições legislativas. Use para buscar PLs, PECs, PDLs e ver seu status.',
    arguments: [
      {
        name: 'identificacao',
        description: 'Identificação da proposição: tipo e número (ex: PL 1234/2024) ou palavras-chave do tema',
        required: true
      }
    ]
  },
  {
    name: 'analisar_votacao',
    description: 'Guia para analisar votações na Câmara, incluindo votos individuais de deputados e orientações de partidos.',
    arguments: [
      {
        name: 'contexto',
        description: 'Contexto da votação: ID da votação, nome da proposição votada, ou período de interesse',
        required: true
      }
    ]
  },
  {
    name: 'visao_geral_legislativa',
    description: 'Prompt para obter panorama geral da atividade legislativa atual. Útil para resumos e análises amplas.',
    arguments: [
      {
        name: 'foco',
        description: 'Foco da análise: votações recentes, proposições em destaque, atividade de comissões, etc.',
        required: false
      }
    ]
  },
  {
    name: 'gastos_parlamentares',
    description: 'Guia para consultar gastos da cota parlamentar (CEAP) dos deputados.',
    arguments: [
      {
        name: 'deputado_ou_periodo',
        description: 'Nome/ID do deputado ou período de análise (ex: 2024, outubro/2024)',
        required: true
      }
    ]
  },
  {
    name: 'orientacao_inicial',
    description: 'Orientação geral sobre como usar as ferramentas da API da Câmara. Use no início de uma conversa ou quando o usuário não souber por onde começar.',
    arguments: []
  }
];

// Função para gerar o conteúdo de cada prompt
export function getPromptContent(name: string, args: Record<string, string>): MCPPromptMessage[] {
  switch (name) {
    case 'consultar_deputado':
      return getConsultarDeputadoPrompt(args.criterio || '');

    case 'acompanhar_proposicao':
      return getAcompanharProposicaoPrompt(args.identificacao || '');

    case 'analisar_votacao':
      return getAnalisarVotacaoPrompt(args.contexto || '');

    case 'visao_geral_legislativa':
      return getVisaoGeralPrompt(args.foco || '');

    case 'gastos_parlamentares':
      return getGastosParlamentaresPrompt(args.deputado_ou_periodo || '');

    case 'orientacao_inicial':
      return getOrientacaoInicialPrompt();

    default:
      return [{
        role: 'user',
        content: {
          type: 'text',
          text: `Prompt "${name}" não encontrado.`
        }
      }];
  }
}

function getConsultarDeputadoPrompt(criterio: string): MCPPromptMessage[] {
  return [{
    role: 'user',
    content: {
      type: 'text',
      text: `# Consulta sobre Deputado Federal

## Critério informado: ${criterio}

## Estratégia de busca recomendada:

### 1. Identificar o deputado
- Se for **nome**: use \`buscar_deputados\` com parâmetro \`nome\`
- Se for **UF** (ex: SP, RJ): use \`buscar_deputados\` com parâmetro \`uf\`
- Se for **partido** (ex: PT, PL): use \`buscar_deputados\` com parâmetro \`partido\`
- Se for **ID numérico**: vá direto para \`detalhar_deputado\`

### 2. Obter detalhes completos
Após identificar o ID do deputado, use:
- \`detalhar_deputado\`: dados pessoais, contatos, gabinete
- \`despesas_deputado\`: gastos da cota parlamentar (CEAP)
- \`discursos_deputado\`: pronunciamentos em plenário
- \`orgaos_deputado\`: comissões que participa
- \`frentes_deputado\`: frentes parlamentares que integra

### 3. Informações importantes
- A **legislatura atual é 57** (2023-2027)
- IDs de deputados são **números inteiros** (ex: 204554)
- Para filtrar por sexo, use \`siglaSexo: "F"\` ou \`"M"\`
- Despesas podem ser filtradas por \`ano\` e \`mes\`

### 4. Exemplo de fluxo completo
\`\`\`
1. buscar_deputados({ nome: "Silva", uf: "SP", itens: 10 })
2. detalhar_deputado({ id: 204554 })
3. despesas_deputado({ id: 204554, ano: 2024, itens: 15 })
\`\`\`

### 5. Dicas
- Use \`itens\` para limitar resultados (padrão: 15)
- Ordene despesas por \`valorDocumento\` para ver maiores gastos
- Combine com \`votos_votacao\` para ver como o deputado votou`
    }
  }];
}

function getAcompanharProposicaoPrompt(identificacao: string): MCPPromptMessage[] {
  return [{
    role: 'user',
    content: {
      type: 'text',
      text: `# Acompanhamento de Proposição Legislativa

## Identificação informada: ${identificacao}

## Estratégia de busca recomendada:

### 1. Encontrar a proposição
- Se tiver **tipo/número/ano** (ex: PL 1234/2024):
  \`buscar_proposicoes({ siglaTipo: "PL", numero: 1234, ano: 2024 })\`

- Se tiver **palavras-chave**:
  \`buscar_proposicoes({ keywords: "reforma tributária", ano: 2024 })\`

- Se tiver **ID numérico**: vá direto para \`detalhar_proposicao\`

### 2. Tipos de proposição comuns
- **PL**: Projeto de Lei (mais comum)
- **PEC**: Proposta de Emenda à Constituição
- **PLP**: Projeto de Lei Complementar
- **PDL**: Projeto de Decreto Legislativo
- **MPV**: Medida Provisória
- **REQ**: Requerimento

### 3. Obter informações detalhadas
- \`detalhar_proposicao\`: ementa, situação, último status
- \`autores_proposicao\`: quem apresentou
- \`tramitacoes_proposicao\`: histórico completo de movimentações
- \`votacoes_proposicao\`: votações que a proposição teve
- \`temas_proposicao\`: classificação temática
- \`relacionadas_proposicao\`: proposições apensadas ou relacionadas

### 4. Entendendo a tramitação
- Tramitações são ordenadas por data
- Use \`ordem: "DESC"\` para ver mais recentes primeiro
- O campo \`situacao\` indica status atual (em tramitação, arquivada, etc.)

### 5. Exemplo de fluxo completo
\`\`\`
1. buscar_proposicoes({ siglaTipo: "PL", keywords: "educação", ano: 2024 })
2. detalhar_proposicao({ id: 2456789 })
3. tramitacoes_proposicao({ id: 2456789, ordem: "DESC" })
4. votacoes_proposicao({ id: 2456789 })
\`\`\`

### 6. Dicas
- Use \`situacoes_proposicao\` para ver todas as situações possíveis
- Use \`tipos_proposicao\` para ver todos os tipos disponíveis
- Proposições podem ter muitas tramitações - use paginação`
    }
  }];
}

function getAnalisarVotacaoPrompt(contexto: string): MCPPromptMessage[] {
  return [{
    role: 'user',
    content: {
      type: 'text',
      text: `# Análise de Votação na Câmara

## Contexto informado: ${contexto}

## Estratégia de análise recomendada:

### 1. Encontrar a votação
- **Votações recentes**: \`ultimas_votacoes({ itens: 10 })\`
- **Por período**: \`buscar_votacoes({ dataInicio: "2024-11-01", dataFim: "2024-11-30" })\`
- **De uma proposição**: \`votacoes_proposicao({ id: 2456789 })\`
- **De um evento**: \`votacoes_evento({ id: 70123 })\`

### 2. Analisar a votação
- \`detalhar_votacao\`: informações gerais, resultado, aprovação/rejeição
- \`votos_votacao\`: voto individual de cada deputado
- \`orientacoes_votacao\`: como cada partido orientou a bancada

### 3. Entendendo os votos
Tipos de voto possíveis:
- **Sim**: a favor
- **Não**: contra
- **Abstenção**: não votou a favor nem contra
- **Obstrução**: tentativa de impedir quórum
- **Art. 17**: impedido de votar

### 4. Orientações partidárias
- Partidos orientam suas bancadas antes da votação
- Orientação pode ser: Sim, Não, Liberado, Obstrução
- Compare votos individuais com orientação para ver "dissidentes"

### 5. Exemplo de fluxo completo
\`\`\`
1. ultimas_votacoes({ itens: 5 })
2. detalhar_votacao({ id: "2456789-123" })
3. votos_votacao({ id: "2456789-123" })
4. orientacoes_votacao({ id: "2456789-123" })
\`\`\`

### 6. Cruzando dados
Para saber como um deputado específico votou:
\`\`\`
1. votos_votacao({ id: "votacao-id" })
2. Filtrar pelo nome ou ID do deputado no resultado
\`\`\`

### 7. Dicas importantes
- IDs de votação são **strings** no formato "numero-sequencial"
- Votações podem demorar para processar (API lenta para algumas)
- Use \`votacoes_orgao\` para ver votações de uma comissão específica`
    }
  }];
}

function getVisaoGeralPrompt(foco: string): MCPPromptMessage[] {
  const focoTexto = foco ? `\n## Foco solicitado: ${foco}` : '';

  return [{
    role: 'user',
    content: {
      type: 'text',
      text: `# Visão Geral da Atividade Legislativa
${focoTexto}

## Ferramentas para panorama geral:

### 1. Atividade recente
- \`ultimas_votacoes\`: votações mais recentes
- \`buscar_eventos\`: reuniões, audiências, sessões
- \`buscar_proposicoes\`: proposições recentes ou em destaque

### 2. Estrutura da Câmara
- \`buscar_orgaos\`: comissões e órgãos
- \`buscar_partidos\`: partidos com representação
- \`buscar_frentes\`: frentes parlamentares ativas
- \`buscar_blocos\`: blocos partidários

### 3. Dados de referência
- \`buscar_legislaturas\`: informações sobre legislaturas
- \`mesa_legislatura\`: composição da Mesa Diretora
- \`ufs\`: lista de estados
- \`tipos_proposicao\`: tipos de proposições
- \`tipos_evento\`: tipos de eventos

### 4. Sugestões por tipo de análise

**Votações importantes:**
\`\`\`
ultimas_votacoes({ itens: 20 })
\`\`\`

**Agenda da semana:**
\`\`\`
buscar_eventos({
  dataInicio: "2024-11-18",
  dataFim: "2024-11-22",
  itens: 50
})
\`\`\`

**Proposições em destaque:**
\`\`\`
buscar_proposicoes({
  ano: 2024,
  tramitacaoSenado: false,
  itens: 20,
  ordem: "DESC"
})
\`\`\`

**Atividade de uma comissão:**
\`\`\`
1. buscar_orgaos({ sigla: "CCJC" })
2. eventos_orgao({ id: 2003, itens: 10 })
3. votacoes_orgao({ id: 2003, itens: 10 })
\`\`\`

### 5. Contexto atual
- **Legislatura**: 57ª (2023-2027)
- **Presidente da Câmara**: Verificar via mesa_legislatura({ idLegislatura: 57 })
- Use sempre datas recentes para dados atualizados`
    }
  }];
}

function getGastosParlamentaresPrompt(criterio: string): MCPPromptMessage[] {
  return [{
    role: 'user',
    content: {
      type: 'text',
      text: `# Consulta de Gastos Parlamentares (CEAP)

## Critério informado: ${criterio}

## O que é a CEAP?
A Cota para o Exercício da Atividade Parlamentar (CEAP) é a verba que deputados podem usar para custear atividades do mandato.

## Estratégia de consulta:

### 1. Identificar o deputado
Se não tiver o ID, primeiro busque:
\`\`\`
buscar_deputados({ nome: "Silva", uf: "SP" })
\`\`\`

### 2. Consultar despesas
\`\`\`
despesas_deputado({
  id: 204554,
  ano: 2024,
  mes: 10,  // opcional
  itens: 30,
  ordenarPor: "valorDocumento",
  ordem: "DESC"
})
\`\`\`

### 3. Campos importantes nas despesas
- **tipoDespesa**: categoria do gasto
- **valorDocumento**: valor bruto
- **valorLiquido**: valor após descontos
- **fornecedor**: quem recebeu
- **dataDocumento**: quando ocorreu

### 4. Tipos de despesa comuns
- Passagens aéreas
- Telefonia
- Combustíveis
- Divulgação parlamentar
- Alimentação
- Hospedagem
- Serviços postais

### 5. Parâmetros de ordenação
- \`ano\`: ordena por ano
- \`mes\`: ordena por mês
- \`dataDocumento\`: ordena por data
- \`valorDocumento\`: ordena por valor bruto
- \`valorLiquido\`: ordena por valor líquido

### 6. Exemplo de análise completa
\`\`\`
1. buscar_deputados({ partido: "PT", uf: "SP", itens: 5 })
2. despesas_deputado({ id: 204554, ano: 2024, ordenarPor: "valorDocumento", ordem: "DESC", itens: 50 })
3. Somar valores por tipoDespesa para análise
\`\`\`

### 7. Dicas
- Valores zerados podem indicar ressarcimento negado
- Compare gastos entre meses para ver padrões
- Alguns deputados têm mais gastos que outros (depende da distância do estado)`
    }
  }];
}

function getOrientacaoInicialPrompt(): MCPPromptMessage[] {
  return [{
    role: 'user',
    content: {
      type: 'text',
      text: `# Orientação Geral - API da Câmara dos Deputados

## Bem-vindo ao Agente Cidadão!

Este servidor MCP fornece acesso aos dados abertos da Câmara dos Deputados do Brasil.

## Principais categorias de consulta:

### 1. DEPUTADOS
Informações sobre os 513 deputados federais:
- \`buscar_deputados\`: listar/filtrar deputados
- \`detalhar_deputado\`: dados completos
- \`despesas_deputado\`: gastos da cota parlamentar
- \`discursos_deputado\`: pronunciamentos
- \`orgaos_deputado\`: comissões que participa

### 2. PROPOSIÇÕES
Projetos de lei e outras matérias legislativas:
- \`buscar_proposicoes\`: encontrar proposições
- \`detalhar_proposicao\`: informações completas
- \`tramitacoes_proposicao\`: histórico de movimentação
- \`autores_proposicao\`: quem apresentou

### 3. VOTAÇÕES
Votações em plenário e comissões:
- \`buscar_votacoes\`: encontrar votações por período
- \`ultimas_votacoes\`: votações mais recentes
- \`votos_votacao\`: voto de cada deputado
- \`orientacoes_votacao\`: orientação dos partidos

### 4. EVENTOS
Reuniões, audiências e sessões:
- \`buscar_eventos\`: agenda legislativa
- \`detalhar_evento\`: informações do evento
- \`pauta_evento\`: o que será discutido

### 5. ÓRGÃOS
Comissões e estrutura da Câmara:
- \`buscar_orgaos\`: listar comissões
- \`membros_orgao\`: quem compõe

### 6. PARTIDOS
Informações partidárias:
- \`buscar_partidos\`: partidos com representação
- \`membros_partido\`: deputados do partido
- \`lideres_partido\`: liderança

## Informações importantes:

### Legislatura atual
- **57ª Legislatura** (2023-2027)
- Use \`idLegislatura: 57\` para dados atuais

### Formatos de ID
- Deputados: números inteiros (ex: 204554)
- Votações: strings (ex: "2456789-123")
- Demais: números inteiros

### Paginação
- Use \`pagina\` e \`itens\` para controlar resultados
- Padrão: 15 itens por página

### Ordenação
- \`ordem: "ASC"\` ou \`"DESC"\`
- \`ordenarPor\`: varia por ferramenta

## Como posso ajudar?

Posso ajudar com:
- Buscar informações sobre deputados específicos
- Acompanhar tramitação de projetos de lei
- Analisar votações e posicionamentos
- Consultar gastos parlamentares
- Verificar agenda legislativa

**Qual informação você precisa?**`
    }
  }];
}
