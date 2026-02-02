import React, { useState, useEffect } from 'react';
import { Plus, X, Lock, Unlock, MapPin, ArrowUp } from 'lucide-react';
import type { Pokemon } from '../../types/pokemon';
import { PokemonService } from '../../data/pokemonService';
import clsx from 'clsx';

interface TeamSlotProps {
    pokemon: Pokemon | null;
    isLocked: boolean;
    onToggleLock: () => void;
    onRemove: () => void;
    onAdd: (p: Pokemon) => void;
    onUpdate?: (p: Pokemon) => void;
    availableMaxLevel?: number;
}

export const TeamSlot: React.FC<TeamSlotProps> = ({ pokemon, isLocked, onToggleLock, onRemove, onAdd, onUpdate }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Autocomplete state
    const [allNames, setAllNames] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [showLocation, setShowLocation] = useState(false);

    // State for Evolution Modal
    const [showEvoModal, setShowEvoModal] = useState(false);

    // Load names on mount (lazy)
    useEffect(() => {
        if (isSearching && allNames.length === 0) {
            PokemonService.getAllNames().then(setAllNames);
        }
    }, [isSearching]);

    // Filter suggestions
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        const lower = searchQuery.toLowerCase();
        const matches = allNames
            .filter(n => n.includes(lower))
            .slice(0, 5); // Limit to 5 suggestions
        setSuggestions(matches);
        setHighlightedIndex(-1);
    }, [searchQuery, allNames]);

    const handleSearch = async (e?: React.FormEvent, nameOverride?: string) => {
        e?.preventDefault();
        const term = nameOverride || searchQuery;
        if (!term) return;

        setLoading(true);
        const result = await PokemonService.getPokemon(term);
        if (result) {
            onAdd(result);
            setIsSearching(false);
            setSearchQuery('');
            setSuggestions([]);
        } else {
            alert('Pokemon not found!');
        }
        setLoading(false);
    };

    const handleEvolveClick = () => {
        if (!pokemon?.nextEvolutions || pokemon.nextEvolutions.length === 0) return;

        // If only 1 evolution, do it immediately
        if (pokemon.nextEvolutions.length === 1) {
            performEvolution(pokemon.nextEvolutions[0].name);
        } else {
            // Show modal for choice
            setShowEvoModal(true);
        }
    };

    const performEvolution = async (targetName: string) => {
        if (!onUpdate) return;
        setLoading(true);
        setShowEvoModal(false);
        const nextForm = await PokemonService.getPokemon(targetName);
        if (nextForm) {
            onUpdate(nextForm);
        }
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            if (highlightedIndex >= 0) {
                e.preventDefault();
                setSearchQuery(suggestions[highlightedIndex]);
                handleSearch(undefined, suggestions[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsSearching(false);
        }
    };

    const typeColors: Record<string, string> = {
        Normal: 'bg-gray-400', Fire: 'bg-red-500', Water: 'bg-blue-500',
        Electric: 'bg-yellow-400', Grass: 'bg-green-500', Ice: 'bg-cyan-300',
        Fighting: 'bg-red-700', Poison: 'bg-purple-500', Ground: 'bg-yellow-600',
        Flying: 'bg-indigo-400', Psychic: 'bg-pink-500', Bug: 'bg-lime-500',
        Rock: 'bg-yellow-800', Ghost: 'bg-purple-700', Dragon: 'bg-indigo-700',
        Steel: 'bg-gray-500', Dark: 'bg-gray-800', Fairy: 'bg-pink-300'
    };

    if (!pokemon) {
        return (
            <div className="relative w-full h-64 rounded-xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center hover:bg-white/5 transition-colors group">
                {isSearching ? (
                    <form onSubmit={(e) => handleSearch(e)} className="absolute inset-0 bg-gray-900 rounded-xl p-4 flex flex-col gap-2 z-10 w-full h-full">
                        <div className="relative w-full">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Name..."
                                className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            {/* Autocomplete Dropdown */}
                            {suggestions.length > 0 && (
                                <ul className="absolute left-0 right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-xl z-50 max-h-40 overflow-y-auto">
                                    {suggestions.map((name, idx) => (
                                        <li
                                            key={name}
                                            className={clsx(
                                                "px-3 py-2 cursor-pointer capitalize text-sm",
                                                idx === highlightedIndex ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                                            )}
                                            onClick={() => {
                                                setSearchQuery(name);
                                                handleSearch(undefined, name);
                                            }}
                                        >
                                            {name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <button type="submit" className="flex-1 bg-blue-600 rounded py-1 text-sm font-medium" disabled={loading}>
                                {loading ? '...' : 'Add'}
                            </button>
                            <button type="button" onClick={() => setIsSearching(false)} className="flex-1 bg-gray-700 rounded py-1 text-sm">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <button onClick={() => setIsSearching(true)} className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-300">
                        <Plus className="w-8 h-8" />
                        <span className="font-medium">Add Pokemon</span>
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="relative w-full h-64 rounded-xl bg-gray-800 border border-gray-700 p-4 flex flex-col transition-all hover:border-gray-600">
            {/* Header: Lock and Close (Floating for z-index, but we need caution with layout) */}
            <div className="flex justify-between w-full mb-1 z-10">
                <button
                    onClick={() => onToggleLock()}
                    className={clsx(
                        "p-1 rounded transition-colors",
                        isLocked ? "bg-yellow-500/20 text-yellow-500" : "text-gray-600 hover:text-gray-400"
                    )}
                    title={isLocked ? "Unlock" : "Lock"}
                >
                    {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
                <div className="flex gap-2">
                    {pokemon.tier && (
                        <span className={clsx(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider",
                            pokemon.tier === 'Uber' ? "bg-purple-900/50 border-purple-500 text-purple-300" :
                                pokemon.tier === 'OU' ? "bg-red-900/50 border-red-500 text-red-300" :
                                    "bg-gray-700 border-gray-500 text-gray-400"
                        )}>
                            {pokemon.tier}
                        </span>
                    )}
                    <button
                        onClick={onRemove}
                        className={clsx(
                            "p-1 rounded transition-colors",
                            isLocked ? "text-gray-700 cursor-not-allowed" : "text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                        )}
                        disabled={isLocked}
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Content Centered */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full">
                <div className="relative mb-1">
                    <img src={pokemon.sprite} alt={pokemon.name} className="w-20 h-20 object-contain drop-shadow-md" />

                    {/* Evolve Button */}
                    {pokemon.nextEvolutions && pokemon.nextEvolutions.length > 0 && !isLocked && onUpdate && (
                        <button
                            onClick={handleEvolveClick}
                            disabled={loading}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white p-1 rounded-full transition-all border border-green-600/30 shadow-lg hover:scale-110 z-20"
                            title={pokemon.nextEvolutions.length > 1 ? "Choose Evolution" : `Evolve into ${pokemon.nextEvolutions[0].name}`}
                        >
                            {loading ? <div className="animate-spin h-3 w-3 border-2 border-current rounded-full border-t-transparent" /> : <ArrowUp size={14} />}
                        </button>
                    )}
                </div>

                <div className="text-center w-full px-1">
                    <h3 className="font-bold text-white capitalize text-sm truncate w-full">{pokemon.name}</h3>
                    <div className="flex gap-1 mt-1 justify-center flex-wrap">
                        {pokemon.types.map(t => (
                            <span key={t} className={clsx("text-[10px] px-1.5 py-0.5 rounded text-white font-medium", typeColors[t] || 'bg-gray-500')}>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer: Where to Catch (Flex Item, pushed to bottom) */}
            <div className="mt-auto flex justify-center pt-2">
                <button
                    onClick={() => setShowLocation(!showLocation)}
                    className="flex items-center gap-1.5 text-[10px] bg-gray-900/60 hover:bg-black text-blue-300 px-3 py-1 rounded-full border border-gray-700 transition-all hover:border-blue-500/50 shadow-sm whitespace-nowrap"
                >
                    <MapPin size={10} />
                    <span className="font-medium">Where to catch?</span>
                </button>
            </div>

            {/* Location Hover/Modal */}
            {showLocation && (
                <div className="absolute inset-0 z-30 bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                        <MapPin size={16} className="text-yellow-500" /> Found In
                    </h4>
                    <div className="overflow-y-auto max-h-[100px] w-full custom-scrollbar space-y-1">
                        {(!pokemon.locations || pokemon.locations.length === 0) ? (
                            <p className="text-xs text-gray-400 italic">Unknown / Trade / Evolution</p>
                        ) : (
                            pokemon.locations.map((loc, i) => (
                                <p key={i} className="text-xs text-gray-300 border-b border-gray-800 last:border-0 pb-1">{loc}</p>
                            ))
                        )}
                    </div>
                    <button
                        onClick={() => setShowLocation(false)}
                        className="mt-3 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                    >
                        Close
                    </button>
                </div>
            )}
            {/* Evolution Selection Modal */}
            {showEvoModal && pokemon.nextEvolutions && (
                <div className="absolute inset-0 z-40 bg-gray-900/98 backdrop-blur rounded-xl p-3 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    <h4 className="font-bold text-white text-sm mb-2 text-center">Possible Evolutions</h4>
                    <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                        {pokemon.nextEvolutions.map(evo => (
                            <button
                                key={evo.name}
                                onClick={() => performEvolution(evo.name)}
                                className="w-full flex justify-between items-center p-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 hover:border-green-500 transition-all text-left group/btn"
                            >
                                <span className="text-xs font-bold text-gray-200 capitalize group-hover/btn:text-green-400">{evo.name}</span>
                                {evo.item && <span className="text-[10px] text-gray-400 italic ml-2">{evo.item}</span>}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowEvoModal(false)}
                        className="mt-2 text-xs bg-gray-800 text-gray-400 hover:text-white py-1 rounded w-full border border-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};
