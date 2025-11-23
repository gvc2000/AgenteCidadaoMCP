import { camaraAPI } from '../src/api/client.js';
import { cacheManager } from '../src/core/cache.js';

// Configuração da Simulação
const LATENCY_MS = 2000; // 2 segundos de latência simulada

// Monkey-patch no método get do client para simular latência
// Isso evita problemas com nock/axios adapters e garante que o teste rode
const originalGet = camaraAPI.get.bind(camaraAPI);

camaraAPI.get = async (endpoint: string, params?: any) => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, LATENCY_MS));

    // Retorna dados mockados
    return {
        dados: { id: 12345, nome: 'Simulado' },
        links: []
    } as any;
};

async function runSequentialScenario() {
    console.log('\n--- Cenário A: Sequencial (Atual) ---');
    const start = Date.now();

    process.stdout.write('Buscando detalhes... ');
    await camaraAPI.get('/deputados/12345');
    console.log(`Feito`);

    process.stdout.write('Buscando despesas... ');
    await camaraAPI.get('/deputados/12345/despesas');
    console.log(`Feito`);

    process.stdout.write('Buscando discursos... ');
    await camaraAPI.get('/deputados/12345/discursos');
    console.log(`Feito`);

    return Date.now() - start;
}

async function runParallelScenario() {
    console.log('\n--- Cenário B: Paralelo (Proposto) ---');
    const start = Date.now();

    process.stdout.write('Buscando tudo em paralelo... ');

    await Promise.all([
        camaraAPI.get('/deputados/12345'),
        camaraAPI.get('/deputados/12345/despesas'),
        camaraAPI.get('/deputados/12345/discursos')
    ]);

    console.log(`Feito`);
    return Date.now() - start;
}

async function runCachedScenario() {
    console.log('\n--- Cenário C: Com Cache (Simulado) ---');
    const start = Date.now();
    process.stdout.write('Buscando dados cacheados... ');

    // Simula hit no cache (sem delay de rede)
    await new Promise(resolve => setTimeout(resolve, 5));

    console.log(`Feito`);
    return Date.now() - start;
}

async function main() {
    console.log(`Iniciando Benchmark (Latência Simulada: ${LATENCY_MS}ms)`);

    const timeSeq = await runSequentialScenario();
    const timePar = await runParallelScenario();
    const timeCache = await runCachedScenario();

    console.log('\n=== RESULTADOS ===');
    console.log(`Sequencial: ${timeSeq}ms`);
    console.log(`Paralelo:   ${timePar}ms (Melhoria: ${((timeSeq - timePar) / timeSeq * 100).toFixed(1)}%)`);
    console.log(`Com Cache:  ${timeCache}ms (Melhoria: ${((timeSeq - timeCache) / timeSeq * 100).toFixed(1)}%)`);
}

main();
