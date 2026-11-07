import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_BRAND, migrateBrand, type BrandConfig } from "@/lib/ats/brand";
import { persistence } from "@/lib/ats/storage-service";

interface BrandState {
  config: BrandConfig;
  replace: (config: BrandConfig) => void;
  reset: () => void;
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      config: DEFAULT_BRAND,
      replace: (config) => set({ config }),
      reset: () => set({ config: DEFAULT_BRAND }),
    }),
    {
      // Persisted through the shared adapter, so swapping in a backend keeps branding too.
      name: "qeloma-brand-v1",
      version: 1,
      storage: createJSONStorage(() => persistence),
      skipHydration: true,
      partialize: (s) => ({ config: s.config }),
      // `merge` runs on every rehydrate: stored data is folded over the defaults so a
      // field added in a later release is never `undefined` on an old browser profile.
      merge: (persisted, current) => ({
        ...current,
        config: migrateBrand((persisted as { config?: unknown } | undefined)?.config, 1),
      }),
    },
  ),
);
