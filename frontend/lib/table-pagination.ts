export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_PAGE_SIZE: PageSize = 10;

export const PAGE_SIZE_STORAGE_KEY = "candidates:pageSize";

export function readStoredPageSize(): PageSize | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    if ([10, 25, 50, 100].includes(n)) return n as PageSize;
  } catch {}
  return null;
}

export function writePageSize(size: PageSize): void {
  try {
    window.localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(size));
  } catch {}
}
