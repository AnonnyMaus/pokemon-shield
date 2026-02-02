export type PokemonType =
    | 'Normal' | 'Fire' | 'Water' | 'Electric' | 'Grass' | 'Ice'
    | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic'
    | 'Bug' | 'Rock' | 'Ghost' | 'Dragon' | 'Steel' | 'Dark' | 'Fairy';

export interface Pokemon {
    id: number;
    name: string;
    types: PokemonType[];
    sprite: string;
    stats: {
        hp: number;
        attack: number;
        defense: number;
        spAttack: number;
        spDefense: number;
        speed: number;
    };
    locations?: string[];
    minLevel?: number; // Minimum level to catch effectively
    nextEvolutions?: {
        name: string;
        level?: number;
        trigger?: string;
        item?: string; // e.g. "Water Stone"
    }[];
    tier?: string; // Smogon tier (OU, UU, etc)
    family?: string[]; // List of all pokemon names in this evolution chain
}

export interface GymLeader {
    id: string;
    name: string;
    type: PokemonType;
    ace: string; // Ace Pokemon Name
    levelCap: number; // Max level obey/catch
    badgeId: number; // 1-8
    description: string;
}

export interface TypeEffectiveness {
    [attacker: string]: {
        [defender: string]: number; // Multiplier (0, 0.5, 1, 2)
    };
}
