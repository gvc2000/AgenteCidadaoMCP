export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function parseCurrency(value: string): number {
  // Remove símbolos e converte para número
  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(cleaned);
}

export function sumValues(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0);
}

export function averageValue(values: number[]): number {
  if (values.length === 0) return 0;
  return sumValues(values) / values.length;
}

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}
