import { create } from 'zustand';
import type { Pokemon } from '../types/pokemon';

interface TeamState {
    team: (Pokemon | null)[]; // Fixed 6 slots
    locked: boolean[];
    blacklist: string[]; // Names of banned Pokemon
    badges: number; // 0-8
    projectedBadge: number; // For "catchable at" logic

    addPokemon: (pokemon: Pokemon, slotIndex?: number) => void;
    removePokemon: (slotIndex: number) => void;
    updatePokemon: (slotIndex: number, pokemon: Pokemon) => void;
    toggleLock: (slotIndex: number) => void;
    setBadges: (count: number) => void;
    clearTeam: () => void;
    addToBlacklist: (name: string) => void;
    removeFromBlacklist: (name: string) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
    team: [null, null, null, null, null, null],
    locked: [false, false, false, false, false, false],
    blacklist: [],
    badges: 0,
    projectedBadge: 0,

    addPokemon: (pokemon, slotIndex) => set((state) => {
        const newTeam = [...state.team];
        // If slot specified
        if (slotIndex !== undefined && slotIndex >= 0 && slotIndex < 6) {
            // Check lock?
            if (state.locked[slotIndex] && state.team[slotIndex] !== null) return state;
            newTeam[slotIndex] = pokemon;
        } else {
            // Find first empty
            const firstEmpty = newTeam.indexOf(null);
            if (firstEmpty !== -1) {
                newTeam[firstEmpty] = pokemon;
            }
        }
        return { team: newTeam };
    }),

    removePokemon: (slotIndex) => set((state) => {
        if (state.locked[slotIndex]) return state;
        const newTeam = [...state.team];
        newTeam[slotIndex] = null;
        return { team: newTeam };
    }),

    updatePokemon: (slotIndex, pokemon) => set((state) => {
        const newTeam = [...state.team];
        newTeam[slotIndex] = pokemon;
        return { team: newTeam };
    }),

    toggleLock: (slotIndex) => set((state) => {
        const newLocked = [...state.locked];
        newLocked[slotIndex] = !newLocked[slotIndex];
        return { locked: newLocked };
    }),

    setBadges: (count) => set({ badges: count }),

    clearTeam: () => set((state) => ({
        team: state.team.map((p, i) => state.locked[i] ? p : null)
    })),

    addToBlacklist: (name) => set((state) => ({
        blacklist: [...state.blacklist, name.toLowerCase()]
    })),

    removeFromBlacklist: (name) => set((state) => ({
        blacklist: state.blacklist.filter(n => n !== name.toLowerCase())
    }))
}));
