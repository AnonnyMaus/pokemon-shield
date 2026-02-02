import type { PokemonType } from "../types/pokemon";
import { ALL_TYPES, TYPE_CHART } from "../data/typeChart";

export class TypeCalculator {
    static getMultiplier(attacker: PokemonType, defender: PokemonType): number {
        const attackEffectiveness = TYPE_CHART[attacker];
        if (!attackEffectiveness) return 1;

        // Explicit 0 check for immunity, otherwise default to 1 (Neutral)
        if (defender in attackEffectiveness) {
            return attackEffectiveness[defender];
        }
        return 1;
    }

    static getDualMultiplier(attacker: PokemonType, defenders: PokemonType[]): number {
        return defenders.reduce((acc, def) => acc * this.getMultiplier(attacker, def), 1);
    }

    static getWeaknesses(defenders: PokemonType[]): { type: PokemonType; multiplier: number }[] {
        const weaknesses: { type: PokemonType; multiplier: number }[] = [];

        ALL_TYPES.forEach(attacker => {
            const multiplier = this.getDualMultiplier(attacker, defenders);
            if (multiplier > 1) {
                weaknesses.push({ type: attacker, multiplier });
            }
        });

        return weaknesses.sort((a, b) => b.multiplier - a.multiplier);
    }

    static getResistances(defenders: PokemonType[]): { type: PokemonType; multiplier: number }[] {
        const resistances: { type: PokemonType; multiplier: number }[] = [];

        ALL_TYPES.forEach(attacker => {
            const multiplier = this.getDualMultiplier(attacker, defenders);
            if (multiplier < 1) {
                resistances.push({ type: attacker, multiplier });
            }
        });

        return resistances.sort((a, b) => a.multiplier - b.multiplier);
    }

    static getCoverage(attackers: PokemonType[]): PokemonType[] {
        const covered: Set<PokemonType> = new Set();

        attackers.forEach(attacker => {
            ALL_TYPES.forEach(defender => {
                if (this.getMultiplier(attacker, defender) > 1) {
                    covered.add(defender);
                }
            });
        });

        return Array.from(covered);
    }
}
