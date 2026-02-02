import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    showCatchRadar: boolean;
    allowedTiers: string[];
    toggleCatchRadar: () => void;
    toggleTier: (tier: string) => void;
    setAllowedTiers: (tiers: string[]) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            showCatchRadar: true,
            allowedTiers: ['Uber', 'OU', 'UU', 'UUBL'], // Default to high tiers
            toggleCatchRadar: () => set((state) => ({ showCatchRadar: !state.showCatchRadar })),
            toggleTier: (tier) => set((state) => {
                const allowed = state.allowedTiers.includes(tier)
                    ? state.allowedTiers.filter(t => t !== tier)
                    : [...state.allowedTiers, tier];
                return { allowedTiers: allowed };
            }),
            setAllowedTiers: (tiers) => set({ allowedTiers: tiers }),
        }),
        {
            name: 'pokemon-team-settings',
        }
    )
);
