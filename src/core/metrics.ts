import { CONFIG } from '../config.js';

interface MetricData {
  count: number;
  values: number[];
  sum: number;
  min: number;
  max: number;
  lastUpdated: number;
}

class MetricsCollector {
  private enabled: boolean;

  // Contadores
  private toolCallCount: Map<string, number>;
  private httpRequestCount: Map<string, number>;
  private errorCount: Map<string, number>;

  // Histogramas
  private latencyData: Map<string, MetricData>;
  private responseSizeData: Map<string, MetricData>;

  // Gauges
  private cacheHitRate: number;
  private activeConnections: number;
  private queueSize: number;

  constructor() {
    this.enabled = CONFIG.metrics.enabled;
    this.toolCallCount = new Map();
    this.httpRequestCount = new Map();
    this.errorCount = new Map();
    this.latencyData = new Map();
    this.responseSizeData = new Map();
    this.cacheHitRate = 0;
    this.activeConnections = 0;
    this.queueSize = 0;
  }

  incrementToolCall(toolName: string) {
    if (!this.enabled) return;
    const count = this.toolCallCount.get(toolName) || 0;
    this.toolCallCount.set(toolName, count + 1);
  }

  incrementHttpRequest(endpoint: string) {
    if (!this.enabled) return;
    const count = this.httpRequestCount.get(endpoint) || 0;
    this.httpRequestCount.set(endpoint, count + 1);
  }

  incrementError(errorType: string) {
    if (!this.enabled) return;
    const count = this.errorCount.get(errorType) || 0;
    this.errorCount.set(errorType, count + 1);
  }

  recordLatency(tool: string, latencyMs: number) {
    if (!this.enabled) return;

    const data = this.latencyData.get(tool) || {
      count: 0,
      values: [],
      sum: 0,
      min: Infinity,
      max: -Infinity,
      lastUpdated: Date.now()
    };

    data.count++;
    data.values.push(latencyMs);
    data.sum += latencyMs;
    data.min = Math.min(data.min, latencyMs);
    data.max = Math.max(data.max, latencyMs);
    data.lastUpdated = Date.now();

    // Mantém apenas os últimos 1000 valores
    if (data.values.length > 1000) {
      data.values.shift();
    }

    this.latencyData.set(tool, data);
  }

  recordResponseSize(tool: string, sizeBytes: number) {
    if (!this.enabled) return;

    const data = this.responseSizeData.get(tool) || {
      count: 0,
      values: [],
      sum: 0,
      min: Infinity,
      max: -Infinity,
      lastUpdated: Date.now()
    };

    data.count++;
    data.values.push(sizeBytes);
    data.sum += sizeBytes;
    data.min = Math.min(data.min, sizeBytes);
    data.max = Math.max(data.max, sizeBytes);
    data.lastUpdated = Date.now();

    if (data.values.length > 1000) {
      data.values.shift();
    }

    this.responseSizeData.set(tool, data);
  }

  setCacheHitRate(rate: number) {
    if (!this.enabled) return;
    this.cacheHitRate = rate;
  }

  setActiveConnections(count: number) {
    if (!this.enabled) return;
    this.activeConnections = count;
  }

  setQueueSize(size: number) {
    if (!this.enabled) return;
    this.queueSize = size;
  }

  getMetrics() {
    return {
      toolCalls: Object.fromEntries(this.toolCallCount),
      httpRequests: Object.fromEntries(this.httpRequestCount),
      errors: Object.fromEntries(this.errorCount),
      latency: this.calculateLatencyStats(),
      responseSize: this.calculateResponseSizeStats(),
      gauges: {
        cacheHitRate: this.cacheHitRate,
        activeConnections: this.activeConnections,
        queueSize: this.queueSize
      }
    };
  }

  private calculateLatencyStats() {
    const stats: Record<string, any> = {};

    for (const [tool, data] of this.latencyData.entries()) {
      const avg = data.sum / data.count;
      const sorted = [...data.values].sort((a, b) => a - b);
      const p50 = this.percentile(sorted, 0.5);
      const p95 = this.percentile(sorted, 0.95);
      const p99 = this.percentile(sorted, 0.99);

      stats[tool] = {
        count: data.count,
        avg: Math.round(avg * 100) / 100,
        min: data.min,
        max: data.max,
        p50: Math.round(p50 * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        p99: Math.round(p99 * 100) / 100
      };
    }

    return stats;
  }

  private calculateResponseSizeStats() {
    const stats: Record<string, any> = {};

    for (const [tool, data] of this.responseSizeData.entries()) {
      const avg = data.sum / data.count;

      stats[tool] = {
        count: data.count,
        avg: Math.round(avg),
        min: data.min,
        max: data.max,
        total: data.sum
      };
    }

    return stats;
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  reset() {
    this.toolCallCount.clear();
    this.httpRequestCount.clear();
    this.errorCount.clear();
    this.latencyData.clear();
    this.responseSizeData.clear();
    this.cacheHitRate = 0;
    this.activeConnections = 0;
    this.queueSize = 0;
  }

  // Exportar métricas no formato Prometheus
  exportPrometheus(): string {
    const lines: string[] = [];

    // Tool calls
    lines.push('# HELP mcp_tool_calls_total Total number of tool calls');
    lines.push('# TYPE mcp_tool_calls_total counter');
    for (const [tool, count] of this.toolCallCount.entries()) {
      lines.push(`mcp_tool_calls_total{tool="${tool}"} ${count}`);
    }

    // HTTP requests
    lines.push('# HELP mcp_http_requests_total Total number of HTTP requests');
    lines.push('# TYPE mcp_http_requests_total counter');
    for (const [endpoint, count] of this.httpRequestCount.entries()) {
      lines.push(`mcp_http_requests_total{endpoint="${endpoint}"} ${count}`);
    }

    // Errors
    lines.push('# HELP mcp_errors_total Total number of errors');
    lines.push('# TYPE mcp_errors_total counter');
    for (const [errorType, count] of this.errorCount.entries()) {
      lines.push(`mcp_errors_total{type="${errorType}"} ${count}`);
    }

    // Latency
    const latencyStats = this.calculateLatencyStats();
    lines.push('# HELP mcp_latency_milliseconds Request latency in milliseconds');
    lines.push('# TYPE mcp_latency_milliseconds summary');
    for (const [tool, stats] of Object.entries(latencyStats)) {
      lines.push(`mcp_latency_milliseconds{tool="${tool}",quantile="0.5"} ${stats.p50}`);
      lines.push(`mcp_latency_milliseconds{tool="${tool}",quantile="0.95"} ${stats.p95}`);
      lines.push(`mcp_latency_milliseconds{tool="${tool}",quantile="0.99"} ${stats.p99}`);
      lines.push(`mcp_latency_milliseconds_sum{tool="${tool}"} ${this.latencyData.get(tool)?.sum || 0}`);
      lines.push(`mcp_latency_milliseconds_count{tool="${tool}"} ${stats.count}`);
    }

    // Gauges
    lines.push('# HELP mcp_cache_hit_rate Cache hit rate');
    lines.push('# TYPE mcp_cache_hit_rate gauge');
    lines.push(`mcp_cache_hit_rate ${this.cacheHitRate}`);

    lines.push('# HELP mcp_active_connections Number of active connections');
    lines.push('# TYPE mcp_active_connections gauge');
    lines.push(`mcp_active_connections ${this.activeConnections}`);

    lines.push('# HELP mcp_queue_size Size of the request queue');
    lines.push('# TYPE mcp_queue_size gauge');
    lines.push(`mcp_queue_size ${this.queueSize}`);

    return lines.join('\n') + '\n';
  }
}

export const metricsCollector = new MetricsCollector();
