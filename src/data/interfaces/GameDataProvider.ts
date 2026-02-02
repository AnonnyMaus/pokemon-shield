

export interface TierData {
    [pokemonName: string]: string; // "dragapult": "OU"
}

export interface IGameDataProvider {
    getGameName(): string;
    getTiers(): TierData;
    // In the future we can add getPokedex(), getLocations(), etc.
    getTierScore(tier: string): number;
}
