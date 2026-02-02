import React, { useEffect, useState } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { GapAnalysis } from '../../utils/gapAnalysis';
import { SUGGESTION_POOL } from '../../data/pokemonList';
import type { SimplePokemon } from '../../data/pokemonList';
import { PokemonService } from '../../data/pokemonService';
import { TypeCalculator } from '../../utils/typeCalc';
import { getTierScore } from '../../data/smogonTiers';
import { Plus, Ban, X } from 'lucide-react';
import type { Pokemon } from '../../types/pokemon';

type CandidateWithExtras = Pokemon & {
    reasons: string[];
    note?: string;
    manualLocation?: string;
    displayTier?: string; // Tier to show (might be inherited)
};

export const SuggestionsPanel: React.FC = () => {
    const { team, addPokemon, badges, blacklist, addToBlacklist, removeFromBlacklist } = useTeamStore();
    const [candidates, setCandidates] = useState<CandidateWithExtras[]>([]);
    const [loading, setLoading] = useState(false);
    const [showBlacklist, setShowBlacklist] = useState(false);

    const activeTeam = team.filter((p): p is Pokemon => p !== null);

    useEffect(() => {
        // Run analysis and find candidates
        if (activeTeam.length === 0 || activeTeam.length >= 6) {
            setCandidates([]);
            return;
        }

        const analyze = async () => {
            setLoading(true);
            const teamTypes = activeTeam.map(p => p.types);
            const analysis = GapAnalysis.analyzeTeam(teamTypes);
            const criteria = GapAnalysis.getSuggestionsCriteria(analysis);

            // Filter pool based on criteria + badges
            const potentialMatches = SUGGESTION_POOL.map(p => {
                if (p.minBadge !== undefined && p.minBadge > badges) return null;
                // Check if name is in team OR in the family of a team member
                if (activeTeam.some(existing =>
                    existing.name.toLowerCase() === p.name.toLowerCase() ||
                    existing.family?.includes(p.name.toLowerCase())
                )) return null;
                if (blacklist && blacklist.includes(p.name.toLowerCase())) return null;

                const reasons: string[] = [];
                let score = 0;

                // 1. Offensive Coverage (High Priority)
                const offensiveScore = criteria.hits.reduce((acc, missingType) => {
                    let hits = false;
                    p.types.forEach(stab => {
                        if (TypeCalculator.getMultiplier(stab, missingType) > 1) hits = true;
                    });
                    if (hits) {
                        reasons.push(`Hits ${missingType}`);
                        return acc + 3; // +3 Points per covered offensive gap
                    }
                    return acc;
                }, 0);
                score += offensiveScore;

                // 2. Smogon Tier (High Priority)
                const tierScore = getTierScore(p.name);
                if (tierScore > 0) {
                    score += tierScore * 1.5; // Multiplier to make Tiers very impactful (Uber=7.5, OU=6)
                    if (tierScore >= 4) reasons.push("Top Meta Pick");
                }

                // 3. Defensive Utility (Lower Priority, Capped)
                let defensivePoints = 0;
                criteria.resists.forEach((weakType) => {
                    const mult = TypeCalculator.getDualMultiplier(weakType, p.types);
                    if (mult < 1) {
                        if (defensivePoints < 2) { // Cap defensive score contribution
                            defensivePoints += 1;
                            reasons.push(`Resists ${weakType}`);
                        }
                    }
                });
                score += defensivePoints;

                // FILTER: If we have offensive gaps, we shouldn't suggest things that strictly provide defense but 0 offense
                if (criteria.hits.length > 0 && offensiveScore === 0 && tierScore < 4) {
                    return null; // Skip non-offensive picks unless they are Top Tier (OU/Uber)
                }

                if (score === 0) return null;

                return { ...p, score, reasons };
            }).filter((p): p is (SimplePokemon & { score: number, reasons: string[] }) => p !== null);

            // Sort by score
            potentialMatches.sort((a, b) => b.score - a.score);

            // Take top 10
            const topPicks = potentialMatches.slice(0, 10);

            // Fetch full details
            const detailedPicks = await Promise.all(
                topPicks.map(async (p) => {
                    const details = await PokemonService.getPokemon(p.name);
                    if (!details) return null;

                    const candidate: CandidateWithExtras = {
                        ...details,
                        reasons: p.reasons,
                        note: p.note,
                        manualLocation: p.location
                    };
                    return candidate;
                })
            );

            setCandidates(detailedPicks.filter((p): p is CandidateWithExtras => p !== null));
            setLoading(false);
        };

        analyze();

    }, [team, badges, blacklist]);

    if (activeTeam.length >= 6) return null;

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">Smart Suggestions</h3>
                    <p className="text-sm text-gray-400">Top 10 picks for your team.</p>
                </div>
                <button
                    onClick={() => setShowBlacklist(!showBlacklist)}
                    className="text-xs text-gray-500 hover:text-white underline"
                >
                    {showBlacklist ? "Hide Blacklist" : `Manage Blacklist (${blacklist ? blacklist.length : 0})`}
                </button>
            </div>

            {showBlacklist ? (
                <div className="flex-1 overflow-y-auto space-y-2">
                    <h4 className="text-sm font-bold text-gray-300 mb-2">Blacklisted Pokemon</h4>
                    {(!blacklist || blacklist.length === 0) ? <p className="text-gray-600 text-xs italic">No blacklisted Pokemon.</p> : (
                        <div className="flex flex-wrap gap-2">
                            {blacklist.map(name => (
                                <div key={name} className="bg-red-900/30 border border-red-800 text-red-200 px-2 py-1 rounded text-xs flex items-center gap-2">
                                    <span className="capitalize">{name}</span>
                                    <button onClick={() => removeFromBlacklist(name)} className="hover:text-white"><X size={12} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : loading ? (
                <div className="text-center py-8 text-gray-500 animate-pulse">Analyzing Team Dynamics...</div>
            ) : (
                <div className="space-y-4 overflow-y-auto pr-2 max-h-[600px] custom-scrollbar">
                    {candidates.length === 0 ? (
                        <p className="text-gray-500 italic">No specific suggestions found. Try adding more variety!</p>
                    ) : (
                        candidates.map(p => (
                            <div key={p.id} className="group relative flex items-start gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors">
                                <img src={p.sprite} alt={p.name} className="w-12 h-12 object-contain mt-1" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white capitalize">{p.name}</h4>
                                        <div className="flex gap-1 text-xs">
                                            {p.types.map(t => <span key={t} className="text-gray-400">{t}</span>)}
                                        </div>
                                        {/* Tier Badges */}
                                        {p.tier && (
                                            <span className={`text-[9px] font-bold px-1.5 rounded border uppercase tracking-wider ${p.tier === 'Uber' ? 'bg-purple-900/80 text-purple-200 border-purple-700' :
                                                p.tier === 'OU' ? 'bg-red-900/80 text-red-200 border-red-700' :
                                                    p.tier === 'UU' ? 'bg-blue-900/80 text-blue-200 border-blue-700' :
                                                        'bg-gray-700 text-gray-400 border-gray-600'
                                                }`}>
                                                {p.tier}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {p.reasons.slice(0, 3).map(r => (
                                            <span key={r} className="text-[10px] bg-blue-900/30 text-blue-200 px-1.5 py-0.5 rounded border border-blue-900/50">{r}</span>
                                        ))}
                                        {p.reasons.length > 3 && <span className="text-[10px] text-gray-500">+{p.reasons.length - 3} more</span>}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500 flex flex-col">
                                        {(p.manualLocation || (p.locations && p.locations[0])) && (
                                            <span className="text-yellow-600/80">📍 {p.manualLocation || p.locations?.[0]}</span>
                                        )}
                                        {p.note && <span className="text-gray-400/80 italic">{p.note}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => addPokemon(p)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg"
                                        title="Add to Team"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        onClick={() => addToBlacklist(p.name)}
                                        className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                                        title="Exclude from suggestions"
                                    >
                                        <Ban size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
