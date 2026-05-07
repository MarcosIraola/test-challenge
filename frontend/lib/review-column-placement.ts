export type ReviewColumnPlacement = "left" | "right";

const STORAGE_KEY = "candidates:reviewColumnPlacement";

export function readStoredReviewPlacement(): ReviewColumnPlacement | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "left" || raw === "right") return raw;
  } catch {}
  return null;
}

export function writeReviewPlacement(placement: ReviewColumnPlacement): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, placement);
  } catch {}
}
