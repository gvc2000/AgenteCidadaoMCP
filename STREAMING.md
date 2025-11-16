# HTTP Streaming com Server-Sent Events (SSE)

O servidor MCP Câmara BR agora suporta streaming HTTP usando **Server-Sent Events (SSE)**, permitindo que os clientes recebam dados em tempo real conforme são processados.

## Visão Geral

O streaming é útil para:
- **Grandes volumes de dados**: Envio de resultados em chunks para evitar timeout
- **Feedback em tempo real**: Atualizações de progresso durante execução
- **Experiência do usuário**: Interface mais responsiva e interativa
- **Eficiência**: Processamento incremental sem esperar toda a resposta

## Endpoints Disponíveis

### 1. Endpoint Tradicional (Resposta Completa)

```
POST /api/tools/:toolName
Content-Type: application/json

{
  "param1": "value1",
  "param2": "value2"
}
```

**Resposta**: JSON completo após processamento total

### 2. Endpoint de Streaming (SSE)

```
POST /api/tools/:toolName/stream
Content-Type: application/json

{
  "param1": "value1",
  "param2": "value2"
}
```

**Resposta**: Stream de eventos SSE

## Formato dos Eventos SSE

Cada evento segue o formato:

```
event: <tipo>
data: <dados-json>

```

### Tipos de Eventos

#### 1. `start` - Início da Execução
Enviado quando a ferramenta começa a executar.

```
event: start
data: {"tool":"buscar_deputados","timestamp":"2025-11-16T10:00:00.000Z"}
```

#### 2. `progress` - Progresso da Execução
Enviado durante o processamento para indicar progresso.

```
event: progress
data: {"message":"Executing tool...","progress":0.5}
```

#### 3. `chunk` - Chunk de Dados (Grandes Respostas)
Para respostas grandes (>10KB), os dados são enviados em chunks.

```
event: chunk
data: {"chunk":"...","index":0,"total":5,"isLast":false}
```

**Campos**:
- `chunk`: String com parte dos dados
- `index`: Índice do chunk (0-based)
- `total`: Total de chunks
- `isLast`: `true` se é o último chunk

#### 4. `data` - Dados Completos (Respostas Pequenas)
Para respostas pequenas (<10KB), enviado diretamente.

```
event: data
data: {"data":[...],"_metadata":{...}}
```

#### 5. `complete` - Conclusão com Sucesso
Enviado quando a execução termina com sucesso.

```
event: complete
data: {"success":true,"tool":"buscar_deputados","metadata":{"executionTime":1234,"timestamp":"2025-11-16T10:00:01.234Z"}}
```

#### 6. `error` - Erro na Execução
Enviado quando ocorre um erro.

```
event: error
data: {"success":false,"error":"Tool execution failed","tool":"buscar_deputados","message":"..."}
```

## Exemplos de Uso

### JavaScript (Fetch API)

```javascript
async function streamTool(toolName, args) {
  const response = await fetch(`http://localhost:9090/api/tools/${toolName}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args)
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      const eventMatch = line.match(/^event: (.+)$/m);
      const dataMatch = line.match(/^data: (.+)$/m);

      if (eventMatch && dataMatch) {
        const eventType = eventMatch[1];
        const eventData = JSON.parse(dataMatch[1]);

        handleEvent(eventType, eventData);
      }
    }
  }
}

function handleEvent(type, data) {
  switch (type) {
    case 'start':
      console.log('Started:', data.tool);
      break;
    case 'progress':
      console.log('Progress:', data.message);
      break;
    case 'chunk':
      console.log(`Chunk ${data.index + 1}/${data.total}`);
      // Acumular chunks e processar quando isLast === true
      break;
    case 'data':
      console.log('Data received:', data);
      break;
    case 'complete':
      console.log('Completed in', data.metadata.executionTime, 'ms');
      break;
    case 'error':
      console.error('Error:', data.message);
      break;
  }
}

// Uso
streamTool('buscar_deputados', { uf: 'SP', pagina: 1, itens: 10 });
```

### Python

```python
import requests
import json
import re

def stream_tool(tool_name, args):
    url = f"http://localhost:9090/api/tools/{tool_name}/stream"

    response = requests.post(
        url,
        json=args,
        stream=True,
        headers={'Content-Type': 'application/json'}
    )

    buffer = ''

    for chunk in response.iter_content(chunk_size=None, decode_unicode=True):
        if chunk:
            buffer += chunk
            events = buffer.split('\n\n')
            buffer = events.pop()

            for event in events:
                if not event.strip():
                    continue

                event_match = re.search(r'^event: (.+)$', event, re.MULTILINE)
                data_match = re.search(r'^data: (.+)$', event, re.MULTILINE)

                if event_match and data_match:
                    event_type = event_match.group(1)
                    event_data = json.loads(data_match.group(1))

                    handle_event(event_type, event_data)

def handle_event(event_type, data):
    if event_type == 'start':
        print(f"Started: {data['tool']}")
    elif event_type == 'progress':
        print(f"Progress: {data['message']}")
    elif event_type == 'chunk':
        print(f"Chunk {data['index'] + 1}/{data['total']}")
    elif event_type == 'data':
        print(f"Data received: {data}")
    elif event_type == 'complete':
        print(f"Completed in {data['metadata']['executionTime']}ms")
    elif event_type == 'error':
        print(f"Error: {data['message']}")

# Uso
stream_tool('buscar_deputados', {'uf': 'SP', 'pagina': 1, 'itens': 10})
```

### cURL (Linha de Comando)

```bash
# Streaming de busca de deputados
curl -X POST http://localhost:9090/api/tools/buscar_deputados/stream \
  -H "Content-Type: application/json" \
  -d '{"uf":"SP","pagina":1,"itens":10}' \
  --no-buffer

# Streaming de proposições
curl -X POST http://localhost:9090/api/tools/buscar_proposicoes/stream \
  -H "Content-Type: application/json" \
  -d '{"siglaTipo":"PL","ano":2024,"pagina":1}' \
  --no-buffer
```

## Cliente HTML Interativo

Um cliente HTML completo está disponível em `examples/streaming-client.html`.

Para usar:

1. Inicie o servidor HTTP:
```bash
npm run start:http
```

2. Abra o arquivo HTML em um navegador:
```bash
open examples/streaming-client.html
```

O cliente fornece:
- Interface gráfica para testar streaming
- Visualização de eventos em tempo real
- Métricas de performance
- Exemplo de código funcional

## Comparação: Normal vs Streaming

### Endpoint Normal
**Vantagens**:
- Simples de usar
- Resposta única completa
- Ideal para dados pequenos

**Desvantagens**:
- Sem feedback durante processamento
- Pode dar timeout em operações longas
- Cliente fica esperando sem informação

### Endpoint Streaming
**Vantagens**:
- Feedback em tempo real
- Suporta grandes volumes de dados
- Melhor experiência do usuário
- Evita timeouts

**Desvantagens**:
- Mais complexo de implementar no cliente
- Requer processamento de eventos
- Overhead de conexão mantida

## Configuração

O tamanho dos chunks pode ser configurado no código (padrão: 10KB):

```typescript
// Em http-server.ts
const chunkSize = 1024 * 10; // 10KB chunks
```

Para alterar, modifique o arquivo `src/http-server.ts` e recompile:

```bash
npm run build
```

## Performance e Otimizações

### 1. Chunking Automático
Respostas > 10KB são automaticamente divididas em chunks de 10KB.

### 2. Compressão
Para habilitar compressão gzip em produção:

```javascript
// Adicionar ao http-server.ts
import compression from 'compression';
app.use(compression());
```

### 3. Keep-Alive
A conexão SSE usa keep-alive automático via comentários periódicos.

### 4. Timeout
Configure timeout do servidor para streaming longo:

```bash
# No .env
REQUEST_TIMEOUT_MS=300000  # 5 minutos
```

## Troubleshooting

### Problema: Eventos não chegam em tempo real

**Solução**: Alguns proxies/CDNs fazem buffering. Adicione headers:
```
X-Accel-Buffering: no  (nginx)
Cache-Control: no-cache
```

### Problema: Conexão fecha prematuramente

**Solução**: Aumente timeout do servidor e do cliente.

### Problema: Chunks chegam fora de ordem

**Solução**: SSE garante ordem. Se houver problemas, verifique rede.

## Integração com n8n

Para usar com n8n:

```json
{
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:9090/api/tools/buscar_deputados/stream",
        "options": {
          "response": {
            "response": {
              "responseFormat": "stream"
            }
          }
        },
        "bodyParameters": {
          "parameters": [
            {
              "name": "uf",
              "value": "SP"
            },
            {
              "name": "pagina",
              "value": 1
            }
          ]
        }
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [250, 300],
      "name": "HTTP Request"
    }
  ]
}
```

## Deploy em Produção

### Railway / Render

O streaming SSE funciona out-of-the-box em:
- Railway
- Render
- Heroku
- Fly.io

### Nginx

Configure para não fazer buffering:

```nginx
location /api/tools/ {
    proxy_pass http://localhost:9090;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
    proxy_buffering off;
    proxy_cache off;
}
```

### Docker

O Dockerfile existente já suporta streaming. Para deploy:

```bash
docker build -t mcp-camara-br .
docker run -p 9090:9090 mcp-camara-br
```

## Métricas

O streaming é rastreado nas métricas padrão:

```
# Chamadas de ferramentas (inclui streaming)
tool_calls_total{tool="buscar_deputados"} 150

# Latência (inclui streaming)
tool_latency_ms{tool="buscar_deputados",quantile="0.95"} 2500
```

Acesse em: `http://localhost:9090/metrics`

## Referências

- [Server-Sent Events Spec](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [MDN: Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

## Próximos Passos

Recursos planejados:
- [ ] WebSocket support para comunicação bidirecional
- [ ] Streaming incremental de arrays
- [ ] Retomada de streaming interrompido
- [ ] Compressão de streaming

## Suporte

Para problemas ou dúvidas:
- Abra uma issue: https://github.com/gvc2000/AgenteCidadaoMCP/issues
- Veja exemplos: `examples/streaming-client.html`
