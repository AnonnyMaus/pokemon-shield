import { useState, useEffect } from "react";
import type { Pokemon } from "../types/pokemon";
import { PokemonService } from "../data/pokemonService";

export function usePokemon(name: string) {
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!name) return;

        const fetch = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await PokemonService.getPokemon(name);
                setPokemon(data);
            } catch (e) {
                setError("Failed to load");
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [name]);

    return { pokemon, loading, error };
}
