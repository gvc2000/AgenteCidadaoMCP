import { buscarProposicoes } from '../src/tools/proposicoes/buscar.js';

// Desativar logs internos
process.env.LOG_LEVEL = 'silent';

async function main() {
    console.log('🔍 Buscando proposições sobre "Aborto"...');
    const startTime = Date.now();

    try {
        const resultado = await buscarProposicoes({
            keywords: 'aborto',
            ordem: 'DESC',
            ordenarPor: 'id',
            itens: 5
        });

        const duration = Date.now() - startTime;
        console.log(`\n⏱️ Tempo total: ${duration}ms`);
        console.log(`📄 Resultados encontrados: ${resultado.proposicoes.length}`);

        if (resultado.proposicoes.length > 0) {
            console.log('\n📋 Top 5 Resultados:');
            resultado.proposicoes.forEach(p => {
                console.log(`- [${p.siglaTipo} ${p.numero}/${p.ano}] ${p.ementa.substring(0, 100)}...`);
            });
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

main();
