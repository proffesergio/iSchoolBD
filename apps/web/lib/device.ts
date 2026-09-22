/**
 * Stable per-device guest id so offline/guest progress still aggregates
 * per learner instead of one shared "guest" row in admin stats.
 */
const KEY = "ischool-device-id";

export function getDeviceId(): string {
  try {
    const s = window.localStorage;
    let id = s.getItem(KEY);
    if (!id) {
      const rand =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID().slice(0, 8)
          : Math.random().toString(36).slice(2, 10);
      id = `d-${rand}`;
      s.setItem(KEY, id);
    }
    return id;
  } catch {
    return "guest";
  }
}
