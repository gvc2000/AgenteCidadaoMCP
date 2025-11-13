export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function countBy<T>(array: T[], key: keyof T): Record<string, number> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = (result[groupKey] || 0) + 1;
    return result;
  }, {} as Record<string, number>);
}

export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((sum, item) => {
    const value = item[key];
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
}

export function averageBy<T>(array: T[], key: keyof T): number {
  if (array.length === 0) return 0;
  return sumBy(array, key) / array.length;
}

export function maxBy<T>(array: T[], key: keyof T): T | undefined {
  if (array.length === 0) return undefined;
  return array.reduce((max, item) => {
    const value = item[key];
    const maxValue = max[key];
    if (typeof value === 'number' && typeof maxValue === 'number') {
      return value > maxValue ? item : max;
    }
    return max;
  });
}

export function minBy<T>(array: T[], key: keyof T): T | undefined {
  if (array.length === 0) return undefined;
  return array.reduce((min, item) => {
    const value = item[key];
    const minValue = min[key];
    if (typeof value === 'number' && typeof minValue === 'number') {
      return value < minValue ? item : min;
    }
    return min;
  });
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === bVal) return 0;

    let comparison = 0;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }

    return order === 'asc' ? comparison : -comparison;
  });
}

export function paginate<T>(array: T[], page: number, itemsPerPage: number): {
  data: T[];
  total: number;
  page: number;
  itemsPerPage: number;
  totalPages: number;
} {
  const total = array.length;
  const totalPages = Math.ceil(total / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const data = array.slice(start, end);

  return {
    data,
    total,
    page,
    itemsPerPage,
    totalPages
  };
}
