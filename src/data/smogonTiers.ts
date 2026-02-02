import { ShieldDataProvider } from './games/ShieldProvider';

const provider = new ShieldDataProvider();
export const SMOGON_TIERS = provider.getTiers();

export const getTierScore = (pokemonName: string): number => {
    const tier = SMOGON_TIERS[pokemonName.toLowerCase()];
    if (!tier) return 0;
    return provider.getTierScore(tier);
};

export const getMaxFamilyTier = (family: string[]): { score: number, tier: string } => {
    let maxScore = 0;
    let bestTier = '';

    family.forEach(member => {
        const score = getTierScore(member);
        if (score > maxScore) {
            maxScore = score;
            bestTier = SMOGON_TIERS[member.toLowerCase()];
        }
    });

    return { score: maxScore, tier: bestTier };
};
