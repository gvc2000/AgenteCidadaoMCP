-- ============================================================================
-- Script de Inicialização do Banco de Dados
-- MCP Câmara BR + n8n + Supabase
-- ============================================================================

-- Criar schema para o n8n (será usado automaticamente pelo n8n)
CREATE SCHEMA IF NOT EXISTS n8n;

-- ============================================================================
-- TABELAS PRINCIPAIS
-- ============================================================================

-- Tabela de Deputados
CREATE TABLE IF NOT EXISTS deputados (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  sigla_partido TEXT,
  sigla_uf TEXT,
  email TEXT,
  url_foto TEXT,
  data_nascimento DATE,
  data_falecimento DATE,
  municipio_nascimento TEXT,
  uf_nascimento TEXT,
  escolaridade TEXT,
  situacao TEXT,
  condicao_eleitoral TEXT,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  dados_completos JSONB,

  -- Índices para busca
  CONSTRAINT deputados_nome_check CHECK (char_length(nome) > 0)
);

-- Tabela de Proposições
CREATE TABLE IF NOT EXISTS proposicoes (
  id INTEGER PRIMARY KEY,
  tipo TEXT NOT NULL,
  numero INTEGER,
  ano INTEGER,
  ementa TEXT,
  keywords TEXT,
  status TEXT,
  tema TEXT,
  data_apresentacao DATE,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  dados_completos JSONB,

  CONSTRAINT proposicoes_tipo_check CHECK (char_length(tipo) > 0)
);

-- Tabela de Votações
CREATE TABLE IF NOT EXISTS votacoes (
  id TEXT PRIMARY KEY,
  data TIMESTAMP,
  proposicao_id INTEGER,
  descricao TEXT,
  sigla_orgao TEXT,
  aprovada BOOLEAN,
  votos_sim INTEGER DEFAULT 0,
  votos_nao INTEGER DEFAULT 0,
  votos_abstencao INTEGER DEFAULT 0,
  votos_outros INTEGER DEFAULT 0,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  dados_completos JSONB,

  FOREIGN KEY (proposicao_id) REFERENCES proposicoes(id) ON DELETE SET NULL
);

-- Tabela de Votos Individuais
CREATE TABLE IF NOT EXISTS votos (
  id SERIAL PRIMARY KEY,
  votacao_id TEXT NOT NULL,
  deputado_id INTEGER NOT NULL,
  tipo_voto TEXT NOT NULL,
  data_registro TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (votacao_id) REFERENCES votacoes(id) ON DELETE CASCADE,
  FOREIGN KEY (deputado_id) REFERENCES deputados(id) ON DELETE CASCADE,

  UNIQUE (votacao_id, deputado_id)
);

-- Tabela de Despesas
CREATE TABLE IF NOT EXISTS despesas (
  id SERIAL PRIMARY KEY,
  deputado_id INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  tipo_despesa TEXT,
  tipo_documento TEXT,
  data_documento DATE,
  valor_documento DECIMAL(12, 2),
  valor_glosa DECIMAL(12, 2) DEFAULT 0,
  valor_liquido DECIMAL(12, 2),
  nome_fornecedor TEXT,
  cnpj_cpf_fornecedor TEXT,
  numero_documento TEXT,
  parcela INTEGER,
  url_documento TEXT,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  dados_completos JSONB,

  FOREIGN KEY (deputado_id) REFERENCES deputados(id) ON DELETE CASCADE,

  CONSTRAINT despesas_ano_check CHECK (ano >= 2000 AND ano <= 2100),
  CONSTRAINT despesas_mes_check CHECK (mes >= 1 AND mes <= 12)
);

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY,
  tipo TEXT,
  descricao TEXT,
  data_hora_inicio TIMESTAMP,
  data_hora_fim TIMESTAMP,
  situacao TEXT,
  local_camara TEXT,
  local_externo TEXT,
  orgao_id INTEGER,
  uri_convidados TEXT,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  dados_completos JSONB
);

-- Tabela de Órgãos
CREATE TABLE IF NOT EXISTS orgaos (
  id INTEGER PRIMARY KEY,
  sigla TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT,
  tipo_orgao TEXT,
  casa TEXT DEFAULT 'Câmara dos Deputados',
  sala TEXT,
  url TEXT,
  data_inicio DATE,
  data_fim DATE,
  data_instalacao DATE,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  dados_completos JSONB
);

-- Tabela de Partidos
CREATE TABLE IF NOT EXISTS partidos (
  id INTEGER PRIMARY KEY,
  sigla TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  uri TEXT,
  total_membros INTEGER DEFAULT 0,
  total_posse INTEGER DEFAULT 0,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  dados_completos JSONB
);

-- Tabela de Frentes Parlamentares
CREATE TABLE IF NOT EXISTS frentes (
  id INTEGER PRIMARY KEY,
  titulo TEXT NOT NULL,
  uri TEXT,
  keywords TEXT,
  id_legislatura INTEGER,
  total_membros INTEGER DEFAULT 0,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  dados_completos JSONB
);

-- ============================================================================
-- TABELAS DE LOGS E MONITORAMENTO
-- ============================================================================

-- Logs de execução de workflows do n8n
CREATE TABLE IF NOT EXISTS workflow_logs (
  id SERIAL PRIMARY KEY,
  workflow_name TEXT NOT NULL,
  workflow_id TEXT,
  execution_id TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  duration_ms INTEGER,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT workflow_logs_status_check CHECK (status IN ('success', 'error', 'running', 'waiting'))
);

-- Tabela de métricas agregadas
CREATE TABLE IF NOT EXISTS metricas (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor DECIMAL(12, 2),
  data_referencia DATE NOT NULL,
  metadados JSONB,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (tipo, categoria, data_referencia)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Deputados
CREATE INDEX IF NOT EXISTS idx_deputados_nome ON deputados(nome);
CREATE INDEX IF NOT EXISTS idx_deputados_partido ON deputados(sigla_partido);
CREATE INDEX IF NOT EXISTS idx_deputados_uf ON deputados(sigla_uf);
CREATE INDEX IF NOT EXISTS idx_deputados_situacao ON deputados(situacao);

-- Proposições
CREATE INDEX IF NOT EXISTS idx_proposicoes_tipo ON proposicoes(tipo);
CREATE INDEX IF NOT EXISTS idx_proposicoes_ano ON proposicoes(ano);
CREATE INDEX IF NOT EXISTS idx_proposicoes_status ON proposicoes(status);
CREATE INDEX IF NOT EXISTS idx_proposicoes_data ON proposicoes(data_apresentacao);
CREATE INDEX IF NOT EXISTS idx_proposicoes_keywords ON proposicoes USING GIN (to_tsvector('portuguese', keywords));

-- Votações
CREATE INDEX IF NOT EXISTS idx_votacoes_data ON votacoes(data DESC);
CREATE INDEX IF NOT EXISTS idx_votacoes_proposicao ON votacoes(proposicao_id);
CREATE INDEX IF NOT EXISTS idx_votacoes_orgao ON votacoes(sigla_orgao);
CREATE INDEX IF NOT EXISTS idx_votacoes_aprovada ON votacoes(aprovada);

-- Votos
CREATE INDEX IF NOT EXISTS idx_votos_votacao ON votos(votacao_id);
CREATE INDEX IF NOT EXISTS idx_votos_deputado ON votos(deputado_id);
CREATE INDEX IF NOT EXISTS idx_votos_tipo ON votos(tipo_voto);

-- Despesas
CREATE INDEX IF NOT EXISTS idx_despesas_deputado ON despesas(deputado_id);
CREATE INDEX IF NOT EXISTS idx_despesas_ano_mes ON despesas(ano, mes);
CREATE INDEX IF NOT EXISTS idx_despesas_tipo ON despesas(tipo_despesa);
CREATE INDEX IF NOT EXISTS idx_despesas_fornecedor ON despesas(nome_fornecedor);
CREATE INDEX IF NOT EXISTS idx_despesas_valor ON despesas(valor_liquido);

-- Eventos
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos(data_hora_inicio DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_situacao ON eventos(situacao);
CREATE INDEX IF NOT EXISTS idx_eventos_orgao ON eventos(orgao_id);

-- Órgãos
CREATE INDEX IF NOT EXISTS idx_orgaos_sigla ON orgaos(sigla);
CREATE INDEX IF NOT EXISTS idx_orgaos_tipo ON orgaos(tipo_orgao);

-- Partidos
CREATE INDEX IF NOT EXISTS idx_partidos_sigla ON partidos(sigla);

-- Workflow Logs
CREATE INDEX IF NOT EXISTS idx_workflow_logs_workflow ON workflow_logs(workflow_name);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_status ON workflow_logs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_created ON workflow_logs(created_at DESC);

-- Métricas
CREATE INDEX IF NOT EXISTS idx_metricas_tipo ON metricas(tipo);
CREATE INDEX IF NOT EXISTS idx_metricas_data ON metricas(data_referencia DESC);

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View de deputados ativos
CREATE OR REPLACE VIEW deputados_ativos AS
SELECT
  id,
  nome,
  sigla_partido,
  sigla_uf,
  email,
  url_foto
FROM deputados
WHERE situacao = 'Exercício'
ORDER BY nome;

-- View de proposições recentes
CREATE OR REPLACE VIEW proposicoes_recentes AS
SELECT
  id,
  tipo,
  numero,
  ano,
  ementa,
  status,
  data_apresentacao
FROM proposicoes
WHERE data_apresentacao >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY data_apresentacao DESC;

-- View de votações recentes
CREATE OR REPLACE VIEW votacoes_recentes AS
SELECT
  v.id,
  v.data,
  v.descricao,
  v.aprovada,
  v.votos_sim,
  v.votos_nao,
  p.tipo as proposicao_tipo,
  p.numero as proposicao_numero,
  p.ano as proposicao_ano
FROM votacoes v
LEFT JOIN proposicoes p ON v.proposicao_id = p.id
WHERE v.data >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY v.data DESC;

-- View de despesas mensais por deputado
CREATE OR REPLACE VIEW despesas_mensais AS
SELECT
  d.id as deputado_id,
  d.nome as deputado_nome,
  d.sigla_partido,
  d.sigla_uf,
  desp.ano,
  desp.mes,
  COUNT(*) as total_despesas,
  SUM(desp.valor_liquido) as valor_total
FROM deputados d
JOIN despesas desp ON d.id = desp.deputado_id
GROUP BY d.id, d.nome, d.sigla_partido, d.sigla_uf, desp.ano, desp.mes
ORDER BY desp.ano DESC, desp.mes DESC, valor_total DESC;

-- View de ranking de proposições por autor
CREATE OR REPLACE VIEW ranking_autores AS
SELECT
  d.id as deputado_id,
  d.nome,
  d.sigla_partido,
  d.sigla_uf,
  COUNT(DISTINCT p.id) as total_proposicoes
FROM deputados d
JOIN proposicoes p ON p.dados_completos::text LIKE '%' || d.id || '%'
WHERE p.data_apresentacao >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY d.id, d.nome, d.sigla_partido, d.sigla_uf
HAVING COUNT(DISTINCT p.id) > 0
ORDER BY total_proposicoes DESC
LIMIT 100;

-- ============================================================================
-- FUNÇÕES ÚTEIS
-- ============================================================================

-- Função para atualizar timestamp de atualização automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática
DROP TRIGGER IF EXISTS update_deputados_updated_at ON deputados;
CREATE TRIGGER update_deputados_updated_at BEFORE UPDATE ON deputados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposicoes_updated_at ON proposicoes;
CREATE TRIGGER update_proposicoes_updated_at BEFORE UPDATE ON proposicoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_votacoes_updated_at ON votacoes;
CREATE TRIGGER update_votacoes_updated_at BEFORE UPDATE ON votacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================================================

-- Inserir partidos principais (dados de exemplo)
INSERT INTO partidos (id, sigla, nome) VALUES
  (36835, 'PT', 'Partido dos Trabalhadores'),
  (36779, 'PL', 'Partido Liberal'),
  (36886, 'UNIÃO', 'União Brasil'),
  (36898, 'PP', 'Progressistas'),
  (36899, 'PSD', 'Partido Social Democrático'),
  (36844, 'MDB', 'Movimento Democrático Brasileiro'),
  (36896, 'REPUBLICANOS', 'Republicanos'),
  (36897, 'PSDB', 'Partido da Social Democracia Brasileira'),
  (36781, 'PDT', 'Partido Democrático Trabalhista'),
  (36785, 'PSB', 'Partido Socialista Brasileiro')
ON CONFLICT (sigla) DO NOTHING;

-- ============================================================================
-- PERMISSÕES (ajuste conforme necessário)
-- ============================================================================

-- Grant de permissões para o schema n8n
GRANT ALL PRIVILEGES ON SCHEMA n8n TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA n8n TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA n8n TO postgres;

-- Grant de permissões para o schema public
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

-- Informações do banco
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Banco de dados inicializado com sucesso!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Tabelas criadas: 11';
    RAISE NOTICE 'Views criadas: 5';
    RAISE NOTICE 'Índices criados: 25+';
    RAISE NOTICE 'Schema n8n: Criado';
    RAISE NOTICE '============================================';
END $$;
