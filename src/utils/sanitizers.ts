export function sanitizeText(text: string): string {
  return text
    .replace(/[^\w\s\u00C0-\u00FF-]/g, '')
    .trim();
}

export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function sanitizeNumber(value: any): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}

export function sanitizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return false;
}

export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function slugify(text: string): string {
  return removeAccents(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
