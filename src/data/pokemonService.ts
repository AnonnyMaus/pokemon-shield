const POKEAPI_BASE = "https://pokeapi.co/api/v2";
import type { Pokemon } from "../types/pokemon";
import { MANUAL_LOCATIONS } from './pokemonList';
import { SMOGON_TIERS } from './smogonTiers';

export class PokemonService {
    private static cache: Map<string, Pokemon> = new Map();

    static async getPokemon(nameOrId: string | number): Promise<Pokemon | null> {
        const key = String(nameOrId).toLowerCase();
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }

        try {
            const response = await fetch(`${POKEAPI_BASE}/pokemon/${key}`);
            if (!response.ok) return null;
            const data = await response.json();

            // Fetch location data specifically for Shield
            const locations = await this.getLocations(data.id);

            // Fetch Evolution Data
            let nextEvolutions: { name: string; level?: number; trigger?: string; item?: string }[] = [];
            let family: string[] | undefined = undefined;
            const speciesResponse = await fetch(`${POKEAPI_BASE}/pokemon-species/${data.id}`);
            if (speciesResponse.ok) {
                const speciesData = await speciesResponse.json();
                if (speciesData.evolution_chain?.url) {
                    const evoResponse = await fetch(speciesData.evolution_chain.url);
                    if (evoResponse.ok) {
                        const evoData = await evoResponse.json();
                        nextEvolutions = this.findNextEvolutions(evoData.chain, data.name); // Using new method
                        family = this.getEvolutionFamily(evoData.chain);
                    }
                }
            }

            const tier = SMOGON_TIERS[data.name.toLowerCase()] || undefined;

            const pokemon: Pokemon = {
                id: data.id,
                name: data.name,
                types: data.types.map((t: any) =>
                    t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)
                ),
                sprite: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
                stats: {
                    hp: data.stats[0].base_stat,
                    attack: data.stats[1].base_stat,
                    defense: data.stats[2].base_stat,
                    spAttack: data.stats[3].base_stat,
                    spDefense: data.stats[4].base_stat,
                    speed: data.stats[5].base_stat,
                },
                locations: locations.length > 0 ? locations : ["Unknown / Trade / Evolution"],
                minLevel: 1, // Default, improved by location logic later
                nextEvolutions, // Updated property
                family, // Add family here
                tier // Add tier here
            };

            this.cache.set(key, pokemon);
            return pokemon;
        } catch (error) {
            console.error("Failed to fetch pokemon", error);
            return null;
        }
    }

    static async getLocations(id: number): Promise<string[]> {
        try {
            // 1. Try direct encounters first
            const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}/encounters`);
            if (response.ok) {
                const data = await response.json();
                // Filter for Shield version (shield)
                const shieldEncounters = data.filter((enc: any) =>
                    enc.version_details.some((vd: any) => vd.version.name === "shield")
                );

                if (shieldEncounters.length > 0) {
                    return shieldEncounters.map((enc: any) => {
                        const location = this.formatLocation(enc.location_area.name);

                        // Extract details for Shield
                        const details = enc.version_details.find((vd: any) => vd.version.name === "shield")?.encounter_details;

                        if (!details || details.length === 0) return location;

                        // Group by method (e.g. "walk", "surf")
                        const methods = new Set<string>();
                        const conditions = new Set<string>();

                        details.forEach((d: any) => {
                            // Add method if not 'walk' (default implies walking usually)
                            if (d.method.name !== 'walk') methods.add(this.formatLocation(d.method.name));

                            // Add conditions (weather, time)
                            d.condition_values.forEach((c: any) => {
                                conditions.add(this.formatLocation(c.name).replace("Time ", "").replace("Weather ", ""));
                            });
                        });

                        let extraInfo = "";
                        if (conditions.size > 0) extraInfo += Array.from(conditions).join("/");
                        if (methods.size > 0) extraInfo += (extraInfo ? ", " : "") + Array.from(methods).join("/");

                        return extraInfo ? `${location} (${extraInfo})` : location;
                    });
                }
            }

            // 2. Determine species name for manual lookup / evolution check
            const speciesResponse = await fetch(`${POKEAPI_BASE}/pokemon-species/${id}`);
            if (!speciesResponse.ok) return ["Unknown Location"];
            const speciesData = await speciesResponse.json();
            const speciesName = speciesData.name.toLowerCase();

            // 3. Check Manual Locations (for Gen 8 / API gaps)
            const manualLoc = MANUAL_LOCATIONS[speciesName];
            if (manualLoc) {
                return [manualLoc];
            }

            // 4. Check evolution chain (Recursive for base form location)
            if (speciesData.evolution_chain?.url) {
                const evoResponse = await fetch(speciesData.evolution_chain.url);
                if (evoResponse.ok) {
                    const evoData = await evoResponse.json();
                    const baseSpeciesName = evoData.chain.species.name;

                    // If we are already the base species, and loc is unknown => rare/gift
                    if (baseSpeciesName === speciesName) {
                        return ["Trade / Event / One-time catch"];
                    }

                    // Fetch base pokemon to check its location
                    // Note: This recurses. We need to be careful not to infinite loop if names match, but we checked baseName != speciesName.
                    const basePokemon = await this.getPokemon(baseSpeciesName);
                    if (basePokemon && basePokemon.id !== id) {
                        const baseLocations = basePokemon.locations;
                        if (baseLocations && baseLocations.length > 0 && !baseLocations[0].includes("Trade") && !baseLocations[0].includes("Unknown")) {
                            return [`Evolve from ${this.capitalize(baseSpeciesName)}`, ...baseLocations.map(l => `(Found at ${l})`)];
                        }
                    }
                }
            }

            return ["Unknown / Trade / Evolution"];
        } catch (error) {
            console.error("Failed to fetch locations", error);
            return ["Unknown"];
        }
    }

    private static getEvolutionFamily(chain: any): string[] {
        let family: string[] = [chain.species.name];
        for (const next of chain.evolves_to) {
            family = family.concat(this.getEvolutionFamily(next));
        }
        return family;
    }

    private static findNextEvolutions(chain: any, currentName: string): { name: string, level?: number, trigger?: string, item?: string }[] {
        if (chain.species.name === currentName) {
            // Check if this node has evolutions
            if (chain.evolves_to.length > 0) {
                return chain.evolves_to.map((next: any) => {
                    let nextName = next.species.name;

                    // Handle forms
                    if (nextName === 'toxtricity') nextName = 'toxtricity-amped';
                    if (nextName === 'urshifu') nextName = 'urshifu-single-strike';
                    if (nextName === 'basculegion') nextName = 'basculegion-male';

                    const details = next.evolution_details[0];
                    return {
                        name: nextName,
                        level: details?.min_level,
                        trigger: details?.trigger?.name,
                        item: details?.item?.name // Capture item if trade/item evo
                    };
                });
            }
            return [];
        }

        // Recursive search
        for (const next of chain.evolves_to) {
            const found = this.findNextEvolutions(next, currentName);
            if (found.length > 0) return found;
        }
        return [];
    }

    private static formatLocation(slug: string): string {
        return slug
            .replace(/-/g, " ")
            .replace(/galar/i, "")
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .trim();
    }

    private static capitalize(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    // Pre-load common Galar Pokemon (Starters, etc) to speed up initial UX
    static async preloadStarters() {
        const starters = ["grookey", "scorbunny", "sobble", "rookidee", "wooloo"];
        await Promise.all(starters.map(s => this.getPokemon(s)));
    }

    private static allNamesCache: string[] | null = null;

    static async getAllNames(): Promise<string[]> {
        if (this.allNamesCache) return this.allNamesCache;

        try {
            // Fetch a large list to get all names. Gen 8 ends around 898.
            const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=1000`);
            const data = await response.json();
            this.allNamesCache = data.results.map((r: any) => r.name);
            return this.allNamesCache!;
        } catch (e) {
            console.error("Failed to fetch all names", e);
            return [];
        }
    }


}
