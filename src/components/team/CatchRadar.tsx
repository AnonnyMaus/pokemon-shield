import React, { useMemo, useState, useEffect } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { useSettingsStore } from '../../store/settingsStore';
import { SUGGESTION_POOL } from '../../data/pokemonList';

import { getTierScore, SMOGON_TIERS } from '../../data/smogonTiers';
import { PokemonService } from '../../data/pokemonService';
import type { Pokemon } from '../../types/pokemon';
import { Radar, MapPin, Plus } from 'lucide-react';

export const CatchRadar: React.FC = () => {
    const { badges, team, addPokemon } = useTeamStore();
    const { showCatchRadar, allowedTiers } = useSettingsStore();
    const [hydratedCandidates, setHydratedCandidates] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Compute list of candidates (SimplePokemon) based on rules
    const simpleCandidates = useMemo(() => {
        if (!showCatchRadar) return [];

        const teamNames = new Set(team.filter((p): p is Pokemon => p !== null).map(p => p.name.toLowerCase()));

        return SUGGESTION_POOL.filter(p => {
            if (teamNames.has(p.name.toLowerCase())) return false;
            // Allow if minBadge is less than or equal to current badges
            // Safe access using optional chaining or defaul
            const minBadge = p.minBadge ?? 99; // Default to 99 if undefined (shouldn't happen for valid suggestions)
            if (minBadge > badges) return false;

            const tier = SMOGON_TIERS[p.name.toLowerCase()];
            if (!tier) return false;

            return allowedTiers.includes(tier);
        }).sort((a, b) => {
            // Sort by Tier Score desc, then Name asc
            const scoreA = getTierScore(a.name);
            const scoreB = getTierScore(b.name);
            if (scoreA !== scoreB) return scoreB - scoreA;
            return a.name.localeCompare(b.name);
        });
    }, [badges, team, showCatchRadar, allowedTiers]);

    // 2. Hydrate with full details (Pokemon[])
    useEffect(() => {
        if (simpleCandidates.length === 0) {
            setHydratedCandidates([]);
            return;
        }

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    simpleCandidates.map(p => PokemonService.getPokemon(p.name))
                );
                // Filter out nulls
                setHydratedCandidates(results.filter((p): p is Pokemon => p !== null));
            } catch (err) {
                console.error("Failed to load radar candidates", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [simpleCandidates]);

    if (!showCatchRadar) return null;

    if (loading) return (
        <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm h-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                <Radar size={20} className="animate-spin" />
                <span className="text-sm">Scanning...</span>
            </div>
        </div>
    );

    if (hydratedCandidates.length === 0) return (
        <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3 text-blue-400">
                <Radar size={20} />
                <h3 className="font-bold uppercase tracking-wider text-sm">Catch Radar</h3>
            </div>
            <p className="text-gray-500 text-sm italic">No high-tier Pokemon found nearby.</p>
        </div>
    );

    return (
        <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm flex flex-col h-full max-h-[600px]">
            <div className="flex items-center gap-2 mb-4 text-blue-400 flex-shrink-0 border-b border-gray-700 pb-2">
                <Radar size={20} />
                <h3 className="font-bold uppercase tracking-wider text-sm">Catch Radar</h3>
                <span className="ml-auto text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                    {hydratedCandidates.length} Found
                </span>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-1">
                {hydratedCandidates.map(p => {
                    const tier = SMOGON_TIERS[p.name.toLowerCase()];

                    const location = p.locations?.[0] || 'Unknown Location';

                    return (
                        <div key={p.id} className="flex items-center gap-3 bg-gray-900/40 p-2 rounded border border-gray-700/50 hover:border-gray-500 transition-colors group">
                            <img src={p.sprite} alt={p.name} className="w-10 h-10 object-contain" />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-200 text-sm truncate">{p.name}</span>
                                    {tier && (
                                        <span className={`text-[9px] font-bold px-1 rounded border uppercase ${tier === 'Uber' ? 'bg-purple-900/60 text-purple-200 border-purple-800' :
                                            tier === 'OU' ? 'bg-red-900/60 text-red-200 border-red-800' :
                                                tier === 'UU' ? 'bg-blue-900/60 text-blue-200 border-blue-800' :
                                                    tier.includes('BL') ? 'bg-yellow-900/60 text-yellow-200 border-yellow-800' :
                                                        'bg-gray-700 text-gray-400 border-gray-600'
                                            }`}>
                                            {tier}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                    <MapPin size={10} />
                                    <span className="truncate">{location}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => addPokemon(p)}
                                disabled={team.filter(x => x !== null).length >= 6}
                                className="opacity-0 group-hover:opacity-100 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-all disabled:opacity-0 disabled:cursor-not-allowed"
                                title="Add to Team"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};



