import { buscarDeputados } from './src/tools/deputados/buscar.js';
import { detalharDeputado } from './src/tools/deputados/detalhar.js';
import { despesasDeputado } from './src/tools/deputados/despesas.js';
import { discursosDeputado } from './src/tools/deputados/discursos.js';
import { eventosDeputado } from './src/tools/deputados/eventos.js';
import { frentesDeputado } from './src/tools/deputados/frentes.js';
import { ocupacoesDeputado } from './src/tools/deputados/ocupacoes.js';
import { orgaosDeputado } from './src/tools/deputados/orgaos.js';
import { profissoesDeputado } from './src/tools/deputados/profissoes.js';

import { buscarProposicoes } from './src/tools/proposicoes/buscar.js';
import { detalharProposicao } from './src/tools/proposicoes/detalhar.js';
import { autoresProposicao } from './src/tools/proposicoes/autores.js';
import { tramitacoesProposicao } from './src/tools/proposicoes/tramitacoes.js';
import { votacoesProposicao } from './src/tools/proposicoes/votacoes.js';
import { relacionadasProposicao } from './src/tools/proposicoes/relacionadas.js';
import { temasProposicao } from './src/tools/proposicoes/temas.js';

import { buscarVotacoes } from './src/tools/votacoes/buscar.js';
import { detalharVotacao } from './src/tools/votacoes/detalhar.js';
import { votosVotacao } from './src/tools/votacoes/votos.js';
import { orientacoesVotacao } from './src/tools/votacoes/orientacoes.js';
import { ultimasVotacoes } from './src/tools/votacoes/ultimas.js';

import { buscarEventos } from './src/tools/eventos/buscar.js';
import { detalharEvento } from './src/tools/eventos/detalhar.js';
import { deputadosEvento } from './src/tools/eventos/deputados.js';
import { pautaEvento } from './src/tools/eventos/pauta.js';
import { votacoesEvento } from './src/tools/eventos/votacoes.js';
import { orgaosEvento } from './src/tools/eventos/orgaos.js';

import { buscarOrgaos } from './src/tools/orgaos/buscar.js';
import { detalharOrgao } from './src/tools/orgaos/detalhar.js';
import { membrosOrgao } from './src/tools/orgaos/membros.js';
import { eventosOrgao } from './src/tools/orgaos/eventos.js';
import { votacoesOrgao } from './src/tools/orgaos/votacoes.js';

import { buscarPartidos } from './src/tools/partidos/buscar.js';
import { detalharPartido } from './src/tools/partidos/detalhar.js';
import { membrosPartido } from './src/tools/partidos/membros.js';
import { lideresPartido } from './src/tools/partidos/lideres.js';

import { buscarFrentes } from './src/tools/frentes/buscar.js';
import { detalharFrente } from './src/tools/frentes/detalhar.js';
import { membrosFrente } from './src/tools/frentes/membros.js';

import { buscarBlocos } from './src/tools/blocos/buscar.js';
import { detalharBloco } from './src/tools/blocos/detalhar.js';

import { buscarLegislaturas } from './src/tools/legislaturas/buscar.js';
import { detalharLegislatura } from './src/tools/legislaturas/detalhar.js';
import { mesaLegislatura } from './src/tools/legislaturas/mesa.js';

import { ufs } from './src/tools/referencias/ufs.js';
import { tiposProposicao } from './src/tools/referencias/tipos-proposicao.js';
import { tiposOrgao } from './src/tools/referencias/tipos-orgao.js';
import { tiposEvento } from './src/tools/referencias/tipos-evento.js';
import { situacoesProposicao } from './src/tools/referencias/situacoes.js';

// Configuracao
const DELAY_BETWEEN_TESTS = 2000; // 2 segundos entre cada teste
const DELAY_BETWEEN_GROUPS = 5000; // 5 segundos entre grupos de ferramentas

interface TestResult {
  tool: string;
  test: string;
  success: boolean;
  error?: string;
  latencyMs?: number;
  dataCount?: number;
}

const results: TestResult[] = [];

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest(
  toolName: string,
  testName: string,
  testFn: () => Promise<any>
): Promise<void> {
  const startTime = Date.now();
  try {
    const result = await testFn();
    const latencyMs = Date.now() - startTime;

    // Verificar se tem dados
    let dataCount = 0;
    if (result.deputados) dataCount = result.deputados.length;
    else if (result.proposicoes) dataCount = result.proposicoes.length;
    else if (result.votacoes) dataCount = result.votacoes.length;
    else if (result.eventos) dataCount = result.eventos.length;
    else if (result.orgaos) dataCount = result.orgaos.length;
    else if (result.partidos) dataCount = result.partidos.length;
    else if (result.frentes) dataCount = result.frentes.length;
    else if (result.blocos) dataCount = result.blocos.length;
    else if (result.legislaturas) dataCount = result.legislaturas.length;
    else if (result.ufs) dataCount = result.ufs.length;
    else if (result.tipos) dataCount = result.tipos.length;
    else if (result.situacoes) dataCount = result.situacoes.length;
    else if (result.despesas) dataCount = result.despesas.length;
    else if (result.discursos) dataCount = result.discursos.length;
    else if (result.membros) dataCount = result.membros.length;
    else if (result.autores) dataCount = result.autores.length;
    else if (result.tramitacoes) dataCount = result.tramitacoes.length;
    else if (result.votos) dataCount = result.votos.length;
    else if (result.orientacoes) dataCount = result.orientacoes.length;
    else if (result.deputado) dataCount = 1;
    else if (result.proposicao) dataCount = 1;
    else if (result.votacao) dataCount = 1;
    else if (result.evento) dataCount = 1;
    else if (result.orgao) dataCount = 1;
    else if (result.partido) dataCount = 1;
    else if (result.frente) dataCount = 1;
    else if (result.bloco) dataCount = 1;
    else if (result.legislatura) dataCount = 1;
    else if (result.pauta) dataCount = result.pauta.length;
    else if (result.temas) dataCount = result.temas.length;
    else if (result.relacionadas) dataCount = result.relacionadas.length;
    else if (result.mesa) dataCount = result.mesa.length;

    results.push({
      tool: toolName,
      test: testName,
      success: true,
      latencyMs,
      dataCount
    });

    console.log(`  [OK] ${testName} - ${latencyMs}ms - ${dataCount} registro(s)`);
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);

    results.push({
      tool: toolName,
      test: testName,
      success: false,
      error: errorMsg,
      latencyMs
    });

    console.log(`  [ERRO] ${testName} - ${latencyMs}ms - ${errorMsg}`);
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('TESTE DE FERRAMENTAS MCP - CAMARA DOS DEPUTADOS');
  console.log('='.repeat(80));
  console.log(`Iniciando testes em ${new Date().toISOString()}`);
  console.log(`Delay entre testes: ${DELAY_BETWEEN_TESTS}ms`);
  console.log(`Delay entre grupos: ${DELAY_BETWEEN_GROUPS}ms`);
  console.log('='.repeat(80));

  // 1. DEPUTADOS
  console.log('\n[DEPUTADOS]');

  console.log('\nbuscar_deputados:');
  await runTest('buscar_deputados', 'Buscar todos (pag 1)', () => buscarDeputados({ pagina: 1, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_deputados', 'Buscar por UF SP', () => buscarDeputados({ uf: 'SP', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_deputados', 'Buscar por partido PT', () => buscarDeputados({ partido: 'PT', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_deputados', 'Buscar mulheres', () => buscarDeputados({ sexo: 'F', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_deputados', 'Buscar legislatura 57', () => buscarDeputados({ idLegislatura: 57, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ndetalhar_deputado:');
  await runTest('detalhar_deputado', 'Deputado ID 204554', () => detalharDeputado({ id: 204554 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_deputado', 'Deputado ID 178957', () => detalharDeputado({ id: 178957 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_deputado', 'Deputado ID 73701', () => detalharDeputado({ id: 73701 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_deputado', 'Deputado ID 74847', () => detalharDeputado({ id: 74847 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_deputado', 'ID inexistente', () => detalharDeputado({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ndespesas_deputado:');
  await runTest('despesas_deputado', 'Despesas 2024', () => despesasDeputado({ id: 204554, ano: 2024, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('despesas_deputado', 'Despesas outubro', () => despesasDeputado({ id: 204554, ano: 2024, mes: 10, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('despesas_deputado', 'Despesas outro deputado', () => despesasDeputado({ id: 178957, ano: 2024, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('despesas_deputado', 'Despesas 2023', () => despesasDeputado({ id: 204554, ano: 2023, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('despesas_deputado', 'Ordenado por valor', () => despesasDeputado({ id: 204554, ano: 2024, itens: 5, ordenarPor: 'valor', ordem: 'DESC' }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ndiscursos_deputado:');
  await runTest('discursos_deputado', 'Discursos 2024', () => discursosDeputado({ id: 204554, ano: 2024, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('discursos_deputado', 'Discursos outro deputado', () => discursosDeputado({ id: 178957, ano: 2024, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('discursos_deputado', 'Discursos 2023', () => discursosDeputado({ id: 204554, ano: 2023, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('discursos_deputado', 'Discursos periodo', () => discursosDeputado({ id: 204554, dataInicio: '2024-01-01', dataFim: '2024-06-30', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('discursos_deputado', 'Sem itens', () => discursosDeputado({ id: 204554, ano: 2020, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\neventos_deputado:');
  await runTest('eventos_deputado', 'Eventos 2024', () => eventosDeputado({ id: 204554, ano: 2024, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('eventos_deputado', 'Eventos outro deputado', () => eventosDeputado({ id: 178957, ano: 2024, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('eventos_deputado', 'Eventos por data', () => eventosDeputado({ id: 204554, dataInicio: '2024-01-01', dataFim: '2024-03-31', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('eventos_deputado', 'Eventos ordenados', () => eventosDeputado({ id: 204554, ano: 2024, itens: 5, ordem: 'DESC' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('eventos_deputado', 'Eventos pagina 2', () => eventosDeputado({ id: 204554, ano: 2024, pagina: 2, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nfrentes_deputado:');
  await runTest('frentes_deputado', 'Frentes basico', () => frentesDeputado({ id: 204554 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('frentes_deputado', 'Frentes outro deputado', () => frentesDeputado({ id: 178957 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('frentes_deputado', 'Frentes deputado 3', () => frentesDeputado({ id: 73701 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('frentes_deputado', 'Frentes deputado 4', () => frentesDeputado({ id: 74847 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('frentes_deputado', 'ID inexistente', () => frentesDeputado({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nocupacoes_deputado:');
  await runTest('ocupacoes_deputado', 'Ocupacoes basico', () => ocupacoesDeputado({ id: 204554 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ocupacoes_deputado', 'Ocupacoes outro', () => ocupacoesDeputado({ id: 178957 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ocupacoes_deputado', 'Ocupacoes deputado 3', () => ocupacoesDeputado({ id: 73701 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ocupacoes_deputado', 'Ocupacoes deputado 4', () => ocupacoesDeputado({ id: 74847 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ocupacoes_deputado', 'ID inexistente', () => ocupacoesDeputado({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\norgaos_deputado:');
  await runTest('orgaos_deputado', 'Orgaos basico', () => orgaosDeputado({ id: 204554 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orgaos_deputado', 'Orgaos outro', () => orgaosDeputado({ id: 178957 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orgaos_deputado', 'Orgaos por data', () => orgaosDeputado({ id: 204554, dataInicio: '2023-01-01' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orgaos_deputado', 'Orgaos ordenados', () => orgaosDeputado({ id: 204554, ordem: 'DESC' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orgaos_deputado', 'ID inexistente', () => orgaosDeputado({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nprofissoes_deputado:');
  await runTest('profissoes_deputado', 'Profissoes basico', () => profissoesDeputado({ id: 204554 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('profissoes_deputado', 'Profissoes outro', () => profissoesDeputado({ id: 178957 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('profissoes_deputado', 'Profissoes deputado 3', () => profissoesDeputado({ id: 73701 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('profissoes_deputado', 'Profissoes deputado 4', () => profissoesDeputado({ id: 74847 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('profissoes_deputado', 'ID inexistente', () => profissoesDeputado({ id: 999999999 }));

  await sleep(DELAY_BETWEEN_GROUPS);

  // 2. PROPOSICOES
  console.log('\n[PROPOSICOES]');

  console.log('\nbuscar_proposicoes:');
  await runTest('buscar_proposicoes', 'PLs de 2024', () => buscarProposicoes({ siglaTipo: 'PL', ano: 2024, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_proposicoes', 'PECs de 2024', () => buscarProposicoes({ siglaTipo: 'PEC', ano: 2024, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_proposicoes', 'Por palavras-chave', () => buscarProposicoes({ keywords: 'educacao', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_proposicoes', 'Por autor PT', () => buscarProposicoes({ siglaPartidoAutor: 'PT', ano: 2024, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_proposicoes', 'Por UF SP', () => buscarProposicoes({ siglaUfAutor: 'SP', ano: 2024, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ndetalhar_proposicao:');
  await runTest('detalhar_proposicao', 'PL conhecida', () => detalharProposicao({ id: 2120019 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_proposicao', 'Outra PL', () => detalharProposicao({ id: 2120020 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_proposicao', 'PL 2023', () => detalharProposicao({ id: 2044755 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_proposicao', 'Proposicao antiga', () => detalharProposicao({ id: 1000000 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_proposicao', 'ID inexistente', () => detalharProposicao({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nautores_proposicao:');
  await runTest('autores_proposicao', 'Autores PL', () => autoresProposicao({ id: 2120019 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('autores_proposicao', 'Autores outra PL', () => autoresProposicao({ id: 2120020 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('autores_proposicao', 'Autores PL 2023', () => autoresProposicao({ id: 2044755 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('autores_proposicao', 'Proposicao antiga', () => autoresProposicao({ id: 1000000 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('autores_proposicao', 'ID inexistente', () => autoresProposicao({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ntramitacoes_proposicao:');
  await runTest('tramitacoes_proposicao', 'Tramitacoes PL', () => tramitacoesProposicao({ id: 2120019 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tramitacoes_proposicao', 'Tramitacoes outra PL', () => tramitacoesProposicao({ id: 2120020 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tramitacoes_proposicao', 'Tramitacoes PL 2023', () => tramitacoesProposicao({ id: 2044755 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tramitacoes_proposicao', 'Ordenado DESC', () => tramitacoesProposicao({ id: 2120019, ordem: 'DESC' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tramitacoes_proposicao', 'ID inexistente', () => tramitacoesProposicao({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nvotacoes_proposicao:');
  await runTest('votacoes_proposicao', 'Votacoes PL', () => votacoesProposicao({ id: 2120019 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_proposicao', 'Votacoes outra PL', () => votacoesProposicao({ id: 2120020 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_proposicao', 'Votacoes PL 2023', () => votacoesProposicao({ id: 2044755 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_proposicao', 'Ordenado DESC', () => votacoesProposicao({ id: 2120019, ordem: 'DESC' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_proposicao', 'ID inexistente', () => votacoesProposicao({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nrelacionadas_proposicao:');
  await runTest('relacionadas_proposicao', 'Relacionadas PL', () => relacionadasProposicao({ id: 2120019 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('relacionadas_proposicao', 'Relacionadas outra PL', () => relacionadasProposicao({ id: 2120020 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('relacionadas_proposicao', 'Relacionadas PL 2023', () => relacionadasProposicao({ id: 2044755 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('relacionadas_proposicao', 'Proposicao antiga', () => relacionadasProposicao({ id: 1000000 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('relacionadas_proposicao', 'ID inexistente', () => relacionadasProposicao({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ntemas_proposicao:');
  await runTest('temas_proposicao', 'Temas PL', () => temasProposicao({ id: 2120019 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('temas_proposicao', 'Temas outra PL', () => temasProposicao({ id: 2120020 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('temas_proposicao', 'Temas PL 2023', () => temasProposicao({ id: 2044755 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('temas_proposicao', 'Proposicao antiga', () => temasProposicao({ id: 1000000 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('temas_proposicao', 'ID inexistente', () => temasProposicao({ id: 999999999 }));

  await sleep(DELAY_BETWEEN_GROUPS);

  // 3. VOTACOES
  console.log('\n[VOTACOES]');

  console.log('\nbuscar_votacoes:');
  await runTest('buscar_votacoes', 'Votacoes 2024', () => buscarVotacoes({ dataInicio: '2024-01-01', dataFim: '2024-12-31', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_votacoes', 'Votacoes novembro', () => buscarVotacoes({ dataInicio: '2024-11-01', dataFim: '2024-11-30', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_votacoes', 'Votacoes outubro', () => buscarVotacoes({ dataInicio: '2024-10-01', dataFim: '2024-10-31', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_votacoes', 'Votacoes setembro', () => buscarVotacoes({ dataInicio: '2024-09-01', dataFim: '2024-09-30', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_votacoes', 'Votacoes agosto', () => buscarVotacoes({ dataInicio: '2024-08-01', dataFim: '2024-08-31', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nultimas_votacoes:');
  await runTest('ultimas_votacoes', 'Ultimas 5', () => ultimasVotacoes({ itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ultimas_votacoes', 'Ultimas 10', () => ultimasVotacoes({ itens: 10 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ultimas_votacoes', 'Ultimas 3', () => ultimasVotacoes({ itens: 3 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ultimas_votacoes', 'Pagina 2', () => ultimasVotacoes({ pagina: 2, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ultimas_votacoes', 'Ordenado ASC', () => ultimasVotacoes({ itens: 5, ordem: 'ASC' }));
  await sleep(DELAY_BETWEEN_TESTS);

  // Buscar uma votacao para usar nos proximos testes
  let votacaoId = '2322686-290';  // ID de exemplo
  try {
    const votacoes = await ultimasVotacoes({ itens: 1 });
    if (votacoes.votacoes && votacoes.votacoes.length > 0) {
      votacaoId = votacoes.votacoes[0].id;
    }
  } catch (e) {
    console.log('  Usando ID de votacao padrao');
  }

  console.log('\ndetalhar_votacao:');
  await runTest('detalhar_votacao', 'Votacao recente', () => detalharVotacao({ id: votacaoId }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_votacao', 'Votacao exemplo 1', () => detalharVotacao({ id: '2322686-290' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_votacao', 'Votacao exemplo 2', () => detalharVotacao({ id: '2322686-291' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_votacao', 'Votacao exemplo 3', () => detalharVotacao({ id: '2322686-292' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_votacao', 'ID inexistente', () => detalharVotacao({ id: 'inexistente-999' }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nvotos_votacao:');
  await runTest('votos_votacao', 'Votos recente', () => votosVotacao({ id: votacaoId }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votos_votacao', 'Votos exemplo 1', () => votosVotacao({ id: '2322686-290' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votos_votacao', 'Votos exemplo 2', () => votosVotacao({ id: '2322686-291' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votos_votacao', 'Votos exemplo 3', () => votosVotacao({ id: '2322686-292' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votos_votacao', 'ID inexistente', () => votosVotacao({ id: 'inexistente-999' }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\norientacoes_votacao:');
  await runTest('orientacoes_votacao', 'Orientacoes recente', () => orientacoesVotacao({ id: votacaoId }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orientacoes_votacao', 'Orientacoes exemplo 1', () => orientacoesVotacao({ id: '2322686-290' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orientacoes_votacao', 'Orientacoes exemplo 2', () => orientacoesVotacao({ id: '2322686-291' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orientacoes_votacao', 'Orientacoes exemplo 3', () => orientacoesVotacao({ id: '2322686-292' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orientacoes_votacao', 'ID inexistente', () => orientacoesVotacao({ id: 'inexistente-999' }));

  await sleep(DELAY_BETWEEN_GROUPS);

  // 4. EVENTOS
  console.log('\n[EVENTOS]');

  console.log('\nbuscar_eventos:');
  await runTest('buscar_eventos', 'Eventos novembro', () => buscarEventos({ dataInicio: '2024-11-01', dataFim: '2024-11-30', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_eventos', 'Eventos outubro', () => buscarEventos({ dataInicio: '2024-10-01', dataFim: '2024-10-31', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_eventos', 'Eventos setembro', () => buscarEventos({ dataInicio: '2024-09-01', dataFim: '2024-09-30', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_eventos', 'Eventos ordenados', () => buscarEventos({ dataInicio: '2024-01-01', dataFim: '2024-12-31', itens: 5, ordem: 'DESC' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_eventos', 'Eventos pagina 2', () => buscarEventos({ dataInicio: '2024-01-01', dataFim: '2024-12-31', pagina: 2, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  // Buscar um evento para usar nos proximos testes
  let eventoId = 70000;  // ID de exemplo
  try {
    const eventos = await buscarEventos({ dataInicio: '2024-11-01', dataFim: '2024-11-30', itens: 1 });
    if (eventos.eventos && eventos.eventos.length > 0) {
      eventoId = eventos.eventos[0].id;
    }
  } catch (e) {
    console.log('  Usando ID de evento padrao');
  }

  console.log('\ndetalhar_evento:');
  await runTest('detalhar_evento', 'Evento recente', () => detalharEvento({ id: eventoId }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_evento', 'Evento exemplo 1', () => detalharEvento({ id: 70000 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_evento', 'Evento exemplo 2', () => detalharEvento({ id: 70001 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_evento', 'Evento exemplo 3', () => detalharEvento({ id: 70002 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_evento', 'ID inexistente', () => detalharEvento({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ndeputados_evento:');
  await runTest('deputados_evento', 'Deputados recente', () => deputadosEvento({ id: eventoId }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('deputados_evento', 'Deputados exemplo 1', () => deputadosEvento({ id: 70000 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('deputados_evento', 'Deputados exemplo 2', () => deputadosEvento({ id: 70001 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('deputados_evento', 'Deputados exemplo 3', () => deputadosEvento({ id: 70002 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('deputados_evento', 'ID inexistente', () => deputadosEvento({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\npauta_evento:');
  await runTest('pauta_evento', 'Pauta recente', () => pautaEvento({ id: eventoId }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('pauta_evento', 'Pauta exemplo 1', () => pautaEvento({ id: 70000 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('pauta_evento', 'Pauta exemplo 2', () => pautaEvento({ id: 70001 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('pauta_evento', 'Pauta exemplo 3', () => pautaEvento({ id: 70002 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('pauta_evento', 'ID inexistente', () => pautaEvento({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nvotacoes_evento:');
  await runTest('votacoes_evento', 'Votacoes recente', () => votacoesEvento({ id: eventoId }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_evento', 'Votacoes exemplo 1', () => votacoesEvento({ id: 70000 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_evento', 'Votacoes exemplo 2', () => votacoesEvento({ id: 70001 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_evento', 'Votacoes exemplo 3', () => votacoesEvento({ id: 70002 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_evento', 'ID inexistente', () => votacoesEvento({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\norgaos_evento:');
  await runTest('orgaos_evento', 'Orgaos recente', () => orgaosEvento({ id: eventoId }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orgaos_evento', 'Orgaos exemplo 1', () => orgaosEvento({ id: 70000 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orgaos_evento', 'Orgaos exemplo 2', () => orgaosEvento({ id: 70001 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orgaos_evento', 'Orgaos exemplo 3', () => orgaosEvento({ id: 70002 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('orgaos_evento', 'ID inexistente', () => orgaosEvento({ id: 999999999 }));

  await sleep(DELAY_BETWEEN_GROUPS);

  // 5. ORGAOS
  console.log('\n[ORGAOS]');

  console.log('\nbuscar_orgaos:');
  await runTest('buscar_orgaos', 'Todos orgaos', () => buscarOrgaos({ itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_orgaos', 'Por sigla', () => buscarOrgaos({ sigla: 'CCJC', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_orgaos', 'Comissoes', () => buscarOrgaos({ codTipoOrgao: 2, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_orgaos', 'Ordenados', () => buscarOrgaos({ itens: 5, ordem: 'DESC' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_orgaos', 'Pagina 2', () => buscarOrgaos({ pagina: 2, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ndetalhar_orgao:');
  await runTest('detalhar_orgao', 'CCJC', () => detalharOrgao({ id: 2003 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_orgao', 'Plenario', () => detalharOrgao({ id: 180 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_orgao', 'Mesa Diretora', () => detalharOrgao({ id: 1 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_orgao', 'CFT', () => detalharOrgao({ id: 2005 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_orgao', 'ID inexistente', () => detalharOrgao({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nmembros_orgao:');
  await runTest('membros_orgao', 'Membros CCJC', () => membrosOrgao({ id: 2003 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_orgao', 'Membros Plenario', () => membrosOrgao({ id: 180 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_orgao', 'Membros Mesa', () => membrosOrgao({ id: 1 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_orgao', 'Membros CFT', () => membrosOrgao({ id: 2005 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_orgao', 'ID inexistente', () => membrosOrgao({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\neventos_orgao:');
  await runTest('eventos_orgao', 'Eventos CCJC', () => eventosOrgao({ id: 2003, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('eventos_orgao', 'Eventos Plenario', () => eventosOrgao({ id: 180, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('eventos_orgao', 'Eventos Mesa', () => eventosOrgao({ id: 1, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('eventos_orgao', 'Eventos CFT', () => eventosOrgao({ id: 2005, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('eventos_orgao', 'ID inexistente', () => eventosOrgao({ id: 999999999, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nvotacoes_orgao:');
  await runTest('votacoes_orgao', 'Votacoes CCJC', () => votacoesOrgao({ id: 2003, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_orgao', 'Votacoes Plenario', () => votacoesOrgao({ id: 180, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_orgao', 'Votacoes Mesa', () => votacoesOrgao({ id: 1, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_orgao', 'Votacoes CFT', () => votacoesOrgao({ id: 2005, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('votacoes_orgao', 'ID inexistente', () => votacoesOrgao({ id: 999999999, itens: 5 }));

  await sleep(DELAY_BETWEEN_GROUPS);

  // 6. PARTIDOS
  console.log('\n[PARTIDOS]');

  console.log('\nbuscar_partidos:');
  await runTest('buscar_partidos', 'Todos partidos', () => buscarPartidos({ itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_partidos', 'Por sigla PT', () => buscarPartidos({ sigla: 'PT' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_partidos', 'Por sigla PSDB', () => buscarPartidos({ sigla: 'PSDB' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_partidos', 'Ordenados', () => buscarPartidos({ itens: 5, ordem: 'DESC' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_partidos', 'Pagina 2', () => buscarPartidos({ pagina: 2, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ndetalhar_partido:');
  await runTest('detalhar_partido', 'PT', () => detalharPartido({ id: 36769 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_partido', 'PSDB', () => detalharPartido({ id: 36779 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_partido', 'MDB', () => detalharPartido({ id: 36786 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_partido', 'PL', () => detalharPartido({ id: 37906 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_partido', 'ID inexistente', () => detalharPartido({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nmembros_partido:');
  await runTest('membros_partido', 'Membros PT', () => membrosPartido({ id: 36769, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_partido', 'Membros PSDB', () => membrosPartido({ id: 36779, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_partido', 'Membros MDB', () => membrosPartido({ id: 36786, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_partido', 'Membros PL', () => membrosPartido({ id: 37906, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_partido', 'ID inexistente', () => membrosPartido({ id: 999999999, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nlideres_partido:');
  await runTest('lideres_partido', 'Lideres PT', () => lideresPartido({ id: 36769 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('lideres_partido', 'Lideres PSDB', () => lideresPartido({ id: 36779 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('lideres_partido', 'Lideres MDB', () => lideresPartido({ id: 36786 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('lideres_partido', 'Lideres PL', () => lideresPartido({ id: 37906 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('lideres_partido', 'ID inexistente', () => lideresPartido({ id: 999999999 }));

  await sleep(DELAY_BETWEEN_GROUPS);

  // 7. FRENTES
  console.log('\n[FRENTES]');

  console.log('\nbuscar_frentes:');
  await runTest('buscar_frentes', 'Todas frentes', () => buscarFrentes({ itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_frentes', 'Legislatura 57', () => buscarFrentes({ idLegislatura: 57, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_frentes', 'Legislatura 56', () => buscarFrentes({ idLegislatura: 56, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_frentes', 'Ordenadas', () => buscarFrentes({ itens: 5, ordem: 'DESC' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_frentes', 'Pagina 2', () => buscarFrentes({ pagina: 2, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  // Buscar uma frente para usar nos proximos testes
  let frenteId = 54254;  // ID de exemplo
  try {
    const frentes = await buscarFrentes({ itens: 1 });
    if (frentes.frentes && frentes.frentes.length > 0) {
      frenteId = frentes.frentes[0].id;
    }
  } catch (e) {
    console.log('  Usando ID de frente padrao');
  }

  console.log('\ndetalhar_frente:');
  await runTest('detalhar_frente', 'Frente recente', () => detalharFrente({ id: frenteId }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_frente', 'Frente exemplo 1', () => detalharFrente({ id: 54254 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_frente', 'Frente exemplo 2', () => detalharFrente({ id: 54255 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_frente', 'Frente exemplo 3', () => detalharFrente({ id: 54256 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_frente', 'ID inexistente', () => detalharFrente({ id: 999999999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nmembros_frente:');
  await runTest('membros_frente', 'Membros recente', () => membrosFrente({ id: frenteId }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_frente', 'Membros exemplo 1', () => membrosFrente({ id: 54254 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_frente', 'Membros exemplo 2', () => membrosFrente({ id: 54255 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_frente', 'Membros exemplo 3', () => membrosFrente({ id: 54256 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('membros_frente', 'ID inexistente', () => membrosFrente({ id: 999999999 }));

  await sleep(DELAY_BETWEEN_GROUPS);

  // 8. BLOCOS
  console.log('\n[BLOCOS]');

  console.log('\nbuscar_blocos:');
  await runTest('buscar_blocos', 'Todos blocos', () => buscarBlocos({ itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_blocos', 'Legislatura 57', () => buscarBlocos({ idLegislatura: 57, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_blocos', 'Legislatura 56', () => buscarBlocos({ idLegislatura: 56, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_blocos', 'Ordenados', () => buscarBlocos({ itens: 5, ordem: 'DESC' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_blocos', 'Pagina 2', () => buscarBlocos({ pagina: 2, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  // Buscar um bloco para usar nos proximos testes
  let blocoId = 1;  // ID de exemplo
  try {
    const blocos = await buscarBlocos({ itens: 1 });
    if (blocos.blocos && blocos.blocos.length > 0) {
      blocoId = blocos.blocos[0].id;
    }
  } catch (e) {
    console.log('  Usando ID de bloco padrao');
  }

  console.log('\ndetalhar_bloco:');
  await runTest('detalhar_bloco', 'Bloco recente', () => detalharBloco({ id: blocoId }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_bloco', 'Bloco exemplo 1', () => detalharBloco({ id: 1 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_bloco', 'Bloco exemplo 2', () => detalharBloco({ id: 2 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_bloco', 'Bloco exemplo 3', () => detalharBloco({ id: 3 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_bloco', 'ID inexistente', () => detalharBloco({ id: 999999999 }));

  await sleep(DELAY_BETWEEN_GROUPS);

  // 9. LEGISLATURAS
  console.log('\n[LEGISLATURAS]');

  console.log('\nbuscar_legislaturas:');
  await runTest('buscar_legislaturas', 'Todas legislaturas', () => buscarLegislaturas({ itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_legislaturas', 'Por data', () => buscarLegislaturas({ data: '2024-01-01', itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_legislaturas', 'Ordenadas ASC', () => buscarLegislaturas({ itens: 5, ordem: 'ASC' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_legislaturas', 'Ordenadas DESC', () => buscarLegislaturas({ itens: 5, ordem: 'DESC' }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('buscar_legislaturas', 'Pagina 2', () => buscarLegislaturas({ pagina: 2, itens: 5 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ndetalhar_legislatura:');
  await runTest('detalhar_legislatura', 'Legislatura 57', () => detalharLegislatura({ id: 57 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_legislatura', 'Legislatura 56', () => detalharLegislatura({ id: 56 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_legislatura', 'Legislatura 55', () => detalharLegislatura({ id: 55 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_legislatura', 'Legislatura 54', () => detalharLegislatura({ id: 54 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('detalhar_legislatura', 'ID inexistente', () => detalharLegislatura({ id: 999 }));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nmesa_legislatura:');
  await runTest('mesa_legislatura', 'Mesa 57', () => mesaLegislatura({ idLegislatura: 57 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('mesa_legislatura', 'Mesa 56', () => mesaLegislatura({ idLegislatura: 56 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('mesa_legislatura', 'Mesa 55', () => mesaLegislatura({ idLegislatura: 55 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('mesa_legislatura', 'Mesa 54', () => mesaLegislatura({ idLegislatura: 54 }));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('mesa_legislatura', 'ID inexistente', () => mesaLegislatura({ idLegislatura: 999 }));

  await sleep(DELAY_BETWEEN_GROUPS);

  // 10. REFERENCIAS
  console.log('\n[REFERENCIAS]');

  console.log('\nufs:');
  await runTest('ufs', 'Todas UFs', () => ufs({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ufs', 'Teste 2', () => ufs({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ufs', 'Teste 3', () => ufs({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ufs', 'Teste 4', () => ufs({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('ufs', 'Teste 5', () => ufs({}));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ntipos_proposicao:');
  await runTest('tipos_proposicao', 'Todos tipos', () => tiposProposicao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_proposicao', 'Teste 2', () => tiposProposicao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_proposicao', 'Teste 3', () => tiposProposicao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_proposicao', 'Teste 4', () => tiposProposicao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_proposicao', 'Teste 5', () => tiposProposicao({}));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ntipos_orgao:');
  await runTest('tipos_orgao', 'Todos tipos', () => tiposOrgao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_orgao', 'Teste 2', () => tiposOrgao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_orgao', 'Teste 3', () => tiposOrgao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_orgao', 'Teste 4', () => tiposOrgao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_orgao', 'Teste 5', () => tiposOrgao({}));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\ntipos_evento:');
  await runTest('tipos_evento', 'Todos tipos', () => tiposEvento({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_evento', 'Teste 2', () => tiposEvento({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_evento', 'Teste 3', () => tiposEvento({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_evento', 'Teste 4', () => tiposEvento({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('tipos_evento', 'Teste 5', () => tiposEvento({}));
  await sleep(DELAY_BETWEEN_TESTS);

  console.log('\nsituacoes_proposicao:');
  await runTest('situacoes_proposicao', 'Todas situacoes', () => situacoesProposicao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('situacoes_proposicao', 'Teste 2', () => situacoesProposicao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('situacoes_proposicao', 'Teste 3', () => situacoesProposicao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('situacoes_proposicao', 'Teste 4', () => situacoesProposicao({}));
  await sleep(DELAY_BETWEEN_TESTS);
  await runTest('situacoes_proposicao', 'Teste 5', () => situacoesProposicao({}));

  // RELATORIO FINAL
  console.log('\n' + '='.repeat(80));
  console.log('RELATORIO FINAL');
  console.log('='.repeat(80));

  const totalTests = results.length;
  const successTests = results.filter(r => r.success).length;
  const failedTests = results.filter(r => !r.success).length;

  console.log(`\nTotal de testes: ${totalTests}`);
  console.log(`Sucesso: ${successTests} (${((successTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`Falhas: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);

  if (failedTests > 0) {
    console.log('\n--- FALHAS DETALHADAS ---');
    const failures = results.filter(r => !r.success);

    // Agrupar por ferramenta
    const failuresByTool: Record<string, TestResult[]> = {};
    for (const f of failures) {
      if (!failuresByTool[f.tool]) {
        failuresByTool[f.tool] = [];
      }
      failuresByTool[f.tool].push(f);
    }

    for (const [tool, toolFailures] of Object.entries(failuresByTool)) {
      console.log(`\n${tool}:`);
      for (const f of toolFailures) {
        console.log(`  - ${f.test}: ${f.error}`);
      }
    }
  }

  // Estatisticas por ferramenta
  console.log('\n--- ESTATISTICAS POR FERRAMENTA ---');
  const toolStats: Record<string, { success: number; failed: number; avgLatency: number; totalData: number }> = {};

  for (const r of results) {
    if (!toolStats[r.tool]) {
      toolStats[r.tool] = { success: 0, failed: 0, avgLatency: 0, totalData: 0 };
    }
    if (r.success) {
      toolStats[r.tool].success++;
      toolStats[r.tool].avgLatency += r.latencyMs || 0;
      toolStats[r.tool].totalData += r.dataCount || 0;
    } else {
      toolStats[r.tool].failed++;
    }
  }

  for (const [tool, stats] of Object.entries(toolStats)) {
    const avgLatency = stats.success > 0 ? Math.round(stats.avgLatency / stats.success) : 0;
    const status = stats.failed === 0 ? 'OK' : `${stats.failed} falhas`;
    console.log(`${tool}: ${status} (avg: ${avgLatency}ms)`);
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Testes finalizados em ${new Date().toISOString()}`);
  console.log('='.repeat(80));

  // Salvar resultados em JSON
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      success: successTests,
      failed: failedTests,
      successRate: ((successTests/totalTests)*100).toFixed(1) + '%'
    },
    toolStats,
    failures: results.filter(r => !r.success),
    allResults: results
  };

  const fs = await import('fs');
  fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
  console.log('\nResultados salvos em test-results.json');
}

main().catch(console.error);
