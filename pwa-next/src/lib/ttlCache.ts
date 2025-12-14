type CacheEntry<T> = {
  value: T;
  expiresAtMs: number;
};

export class TtlCache<T> {
  private map = new Map<string, CacheEntry<T>>();

  get(key: string): T | null {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAtMs) {
      this.map.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.map.set(key, { value, expiresAtMs: Date.now() + ttlMs });
  }

  // Best-effort cleanup.
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.map.entries()) {
      if (now >= entry.expiresAtMs) {
        this.map.delete(key);
      }
    }
  }
}

export function roundCoord(value: number, decimals: number): number {
  const p = 10 ** decimals;
  return Math.round(value * p) / p;
}
