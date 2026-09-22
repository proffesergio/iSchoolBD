import { describe, it, expect, afterEach } from "vitest";
import { getDeviceId } from "./device";
import { isOnline, isSavedOffline, offlineKey, offlineUrl, removeOffline, saveOffline } from "./offline-videos";

function stubStorage(): void {
  const store = new Map<string, string>();
  (globalThis as Record<string, unknown>).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  };
}

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window;
});

describe("device + offline video", () => {
  it("issues a stable per-device id", () => {
    stubStorage();
    const a = getDeviceId();
    const b = getDeviceId();
    expect(a).toBe(b);
    expect(a.startsWith("d-")).toBe(true);
  });

  it("falls back to guest without storage", () => {
    expect(getDeviceId()).toBe("guest");
  });

  it("offline cache fns fail safe without Cache API", async () => {
    stubStorage();
    expect(await saveOffline("l1", "https://cdn.example.com/v.mp4")).toBe(false);
    expect(await offlineUrl("l1", "https://cdn.example.com/v.mp4")).toBeNull();
    await removeOffline("l1", "https://cdn.example.com/v.mp4");
    expect(await isSavedOffline("l1")).toBe(false);
    expect(offlineKey("l1")).toBe("offline:l1");
  });

  it("assumes online without navigator", () => {
    expect(isOnline()).toBe(true);
  });
});
