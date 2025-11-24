import { buscarDeputados } from '../src/tools/deputados/buscar.js';
import { obterPerfilCompleto } from '../src/tools/deputados/perfil-completo.js';
import { cacheManager } from '../src/core/cache.js';

// Desativar logs internos ruidosos para focar no output do script
process.env.LOG_LEVEL = 'silent';

async function main() {
    try {
        console.log('🔍 Buscando deputado "Arthur Lira"...');

        // 1. Buscar ID
        const busca = await buscarDeputados({ nome: 'Arthur Lira', itens: 1 });

        if (!busca.deputados || busca.deputados.length === 0) {
            console.error('❌ Deputado não encontrado.');
            return;
        }

        const deputado = busca.deputados[0];
        process.stdout.write(`✅ Encontrado: ${deputado.nome} (ID: ${deputado.id}) - ${deputado.siglaPartido}/${deputado.siglaUf}\n`);

        // 2. Obter Perfil Completo
        process.stdout.write('\n🚀 Obtendo perfil completo (chamadas paralelas)...\n');
        const startTime = Date.now();

        const perfil = await obterPerfilCompleto({ id: deputado.id });

        const duration = Date.now() - startTime;

        process.stdout.write(`\n✨ Perfil obtido em ${duration}ms!\n`);
        process.stdout.write('--------------------------------------------------\n');
        process.stdout.write(`👤 Nome Civil: ${perfil.nomeCivil}\n`);
        process.stdout.write(`📅 Nascimento: ${perfil.dataNascimento}\n`);
        process.stdout.write(`💰 Últimas Despesas: ${perfil.ultimasDespesas?.length || 0} itens recuperados\n`);
        if (perfil.ultimasDespesas && perfil.ultimasDespesas.length > 0) {
            process.stdout.write(`   Ex: ${perfil.ultimasDespesas[0].tipoDespesa} - R$ ${perfil.ultimasDespesas[0].valorLiquido}\n`);
        }
        process.stdout.write(`🗣️ Últimos Discursos: ${perfil.ultimosDiscursos?.length || 0} itens recuperados\n`);
        process.stdout.write(`👥 Frentes Parlamentares: ${perfil.frentes?.length || 0} frentes\n`);
        process.stdout.write('--------------------------------------------------\n');

    } catch (error) {
        console.error('❌ Erro na consulta:', error);
    }
}

main();
