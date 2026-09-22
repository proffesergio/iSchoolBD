/**
 * Offline video pack (VID-1): direct mp4/webm files can be cached with the
 * Cache Storage API and replayed when the network drops — the rural-3G core
 * of Epic 3. YouTube embeds, Drive previews and Terabox share pages cannot
 * be cached (cross-origin, no CORS) and report honest unavailability.
 */

const CACHE_NAME = "ischool-video-v1";

export function offlineKey(lectureId: string): string {
  return `offline:${lectureId}`;
}

function cacheApi(): CacheStorage | null {
  try {
    return typeof caches !== "undefined" ? caches : null;
  } catch {
    return null;
  }
}

export function isOnline(): boolean {
  try {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine !== false;
  } catch {
    return true;
  }
}

/** Cache a direct file for offline replay. False = unsupported or failed. */
export async function saveOffline(lectureId: string, url: string): Promise<boolean> {
  const api = cacheApi();
  if (!api) return false;
  try {
    const cache = await api.open(CACHE_NAME);
    await cache.add(new Request(url, { mode: "cors" }));
    try {
      window.localStorage.setItem(offlineKey(lectureId), url);
    } catch { /* private mode */ }
    return true;
  } catch {
    return false;
  }
}

/** Blob URL for a cached lecture, or null (not cached / unsupported). */
export async function offlineUrl(lectureId: string, url: string): Promise<string | null> {
  const api = cacheApi();
  if (!api) return null;
  try {
    const cache = await api.open(CACHE_NAME);
    const hit = await cache.match(url);
    if (!hit) return null;
    const blob = await hit.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export async function removeOffline(lectureId: string, url: string): Promise<void> {
  try {
    window.localStorage.removeItem(offlineKey(lectureId));
  } catch { /* no-op */ }
  const api = cacheApi();
  if (!api) return;
  try {
    const cache = await api.open(CACHE_NAME);
    await cache.delete(url);
  } catch { /* no-op */ }
}

export async function isSavedOffline(lectureId: string): Promise<boolean> {
  try {
    return window.localStorage.getItem(offlineKey(lectureId)) !== null;
  } catch {
    return false;
  }
}
