import { DateTime } from 'luxon';

interface CacheItem {
  data: any;
  date: string;
}

const map: Map<string, CacheItem> = new Map();

export async function cached<T>(key: string, fn: (key: string) => Promise<T>): Promise<T> {
  let cacheItem = map.get(key);

  if (cacheItem && cacheItem.date > DateTime.now().toISO()) {
    return Promise.resolve(cacheItem.data as T);
  }

  const result = await fn(key);

  cacheItem = {
    data: result,
    date: DateTime.now().plus({ minutes: 1 }).toISO(),
  };

  map.set(key, cacheItem);

  return result;
}

export function unique<T>(list: T[]): T[] {
  return [...new Set([...list]).values()];
}
