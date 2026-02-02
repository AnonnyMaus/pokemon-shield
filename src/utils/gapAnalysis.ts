import type { PokemonType } from "../types/pokemon";
import { ALL_TYPES } from "../data/typeChart";
import { TypeCalculator } from "./typeCalc";

export interface TeamAnalysis {
    weaknessMap: Record<PokemonType, number>; // Type -> count of team members weak to it
    resistanceMap: Record<PokemonType, number>; // Type -> count of team members resisting it
    offensiveCoverage: Set<PokemonType>; // Types hit for Super Effective damage
    missingCoverage: PokemonType[]; // Types NOT hit for Super Effective damage
}

export class GapAnalysis {
    static analyzeTeam(teamTypes: PokemonType[][]): TeamAnalysis {
        const weaknessMap = {} as Record<PokemonType, number>;
        const resistanceMap = {} as Record<PokemonType, number>;
        const offensiveCoverage = new Set<PokemonType>();

        // Initialize maps
        ALL_TYPES.forEach(t => {
            weaknessMap[t] = 0;
            resistanceMap[t] = 0;
        });

        // Analyze Defenses
        ALL_TYPES.forEach(attackerType => {
            teamTypes.forEach(memberTypes => {
                const mult = TypeCalculator.getDualMultiplier(attackerType, memberTypes);
                if (mult > 1) weaknessMap[attackerType]++;
                if (mult < 1) resistanceMap[attackerType]++;
            });
        });

        // Analyze Offense (STAB assumption)
        // For each team member, their STAB types hit which types super effectively?
        teamTypes.forEach(memberTypes => {
            memberTypes.forEach(stabType => {
                ALL_TYPES.forEach(defenderType => {
                    if (TypeCalculator.getMultiplier(stabType, defenderType) > 1) {
                        offensiveCoverage.add(defenderType);
                    }
                });
            });
        });

        const missingCoverage = ALL_TYPES.filter(t => !offensiveCoverage.has(t));

        return { weaknessMap, resistanceMap, offensiveCoverage, missingCoverage };
    }

    static getSuggestionsCriteria(analysis: TeamAnalysis): {
        resists: PokemonType[]; // Should resist these
        hits: PokemonType[];    // Should hit these
    } {
        // 1. Prioritize resistances to types that threaten >2 members
        const threats = Object.entries(analysis.weaknessMap)
            .filter(([_, count]) => count >= 2) // If 2 or more members are weak
            .map(([type]) => type as PokemonType);

        // 2. Prioritize hitting types we currently miss
        const missing = analysis.missingCoverage;

        return { resists: threats, hits: missing };
    }
}
