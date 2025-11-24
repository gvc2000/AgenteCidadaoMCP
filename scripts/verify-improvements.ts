
process.env.METRICS_ENABLED = 'false';
process.env.LOG_LEVEL = 'silent';

async function main() {
    console.log('Iniciando Verificação...');

    try {
        const { obterPerfilCompleto } = await import('../src/tools/deputados/perfil-completo.js');
        const { cacheManager } = await import('../src/core/cache.js');
        const { camaraAPI } = await import('../src/api/client.js');

        // Mock do axios client interno para preservar a lógica de cache do camaraAPI.get
        let networkCalls = 0;

        // Acessar a propriedade privada 'client' (AxiosInstance)
        // @ts-ignore
        camaraAPI['client'].get = async (endpoint: string, config?: any) => {
            networkCalls++;
            // Simula delay de rede
            await new Promise(resolve => setTimeout(resolve, 10));

            // Retorna dados mockados mínimos
            if (endpoint.includes('/despesas')) return { data: { dados: [], links: [] } };
            if (endpoint.includes('/discursos')) return { data: { dados: [], links: [] } };
            if (endpoint.includes('/frentes')) return { data: { dados: [], links: [] } };
            if (endpoint.includes('/orgaos')) return { data: { dados: [], links: [] } };
            if (endpoint.includes('/ocupacoes')) return { data: { dados: [], links: [] } };
            if (endpoint.includes('/profissoes')) return { data: { dados: [], links: [] } };

            // Detalhes
            return {
                data: {
                    dados: {
                        id: 12345,
                        uri: 'http://...',
                        nomeCivil: 'TESTE',
                        ultimoStatus: {
                            nome: 'TESTE',
                            siglaPartido: 'TESTE',
                            siglaUf: 'TS',
                            id: 12345,
                            uri: '...',
                            uriPartido: '...',
                            siglaCondicaoPolitica: 'Titular',
                            idLegislatura: 57,
                            urlFoto: '...',
                            email: '...',
                            data: '2023-01-01',
                            nomeEleitoral: 'TESTE',
                            gabinete: { nome: '100', predio: '4', sala: '100', andar: '1', telefone: '123' },
                            situacao: 'Exercício',
                            condicaoEleitoral: 'Eleito',
                            descricaoStatus: 'Exercício'
                        },
                        cpf: '',
                        sexo: 'M',
                        urlWebsite: null,
                        redeSocial: [],
                        dataNascimento: '1980-01-01',
                        dataFalecimento: null,
                        ufNascimento: 'SP',
                        municipioNascimento: 'São Paulo',
                        escolaridade: 'Superior'
                    },
                    links: []
                }
            };
        };

        // Limpar cache
        console.log('Limpando cache...');
        cacheManager.clear();

        // 1. Primeira chamada (Cache Miss)
        console.log('\n1. Testando Perfil Completo (Cold Cache)...');
        networkCalls = 0;
        const start1 = Date.now();
        console.log('Chamando obterPerfilCompleto...');
        const result1 = await obterPerfilCompleto({ id: 12345 });
        console.log('obterPerfilCompleto retornou.');
        const time1 = Date.now() - start1;

        console.log(`Tempo: ${time1}ms`);
        console.log(`Chamadas de Rede: ${networkCalls}`);

        if (networkCalls === 0) {
            console.error('ERRO: Deveria ter feito chamadas de rede!');
            process.exit(1);
        }

        // 2. Segunda chamada (Cache Hit)
        console.log('\n2. Testando Perfil Completo (Warm Cache)...');
        networkCalls = 0;
        const start2 = Date.now();
        console.log('Chamando obterPerfilCompleto (2)...');
        const result2 = await obterPerfilCompleto({ id: 12345 });
        console.log('obterPerfilCompleto (2) retornou.');
        const time2 = Date.now() - start2;

        console.log(`Tempo: ${time2}ms`);
        console.log(`Chamadas de Rede: ${networkCalls}`);

        if (networkCalls > 0) {
            console.error('ERRO: Deveria ter usado o cache (0 chamadas de rede)!');
            process.exit(1);
        }

        console.log('\nSUCESSO: Cache Global e Ferramenta de Perfil Completo funcionando!');
    } catch (error) {
        console.error('ERRO FATAL:', error);
        process.exit(1);
    }
}

main();
