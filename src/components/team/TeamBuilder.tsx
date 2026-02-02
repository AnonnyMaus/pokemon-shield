import React from 'react';
import { useTeamStore } from '../../store/teamStore';
import { TeamSlot } from './TeamSlot';
import { AnalysisPanel } from './AnalysisPanel';
import { SuggestionsPanel } from './SuggestionsPanel';
import { CatchRadar } from './CatchRadar';

export const TeamBuilder: React.FC = () => {
    const { team, locked, addPokemon, removePokemon, updatePokemon, toggleLock, badges, setBadges, clearTeam } = useTeamStore();

    return (
        <div className="max-w-6xl mx-auto w-full space-y-8">

            {/* Progression Control */}
            <div className="bg-gray-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-700 shadow-md">
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
                    <div>
                        <h2 className="text-white font-bold text-lg">Your Journey</h2>
                        <p className="text-gray-400 text-sm">Badge Level: {badges}</p>
                    </div>
                    <button
                        onClick={clearTeam}
                        className="px-3 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs rounded border border-red-900 transition-colors"
                        title="Remove all unlocked Pokemon"
                    >
                        Clear Unlocked
                    </button>
                </div>
                <div className="flex gap-2 flex-wrap justify-center md:justify-end">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(b => (
                        <button
                            key={b}
                            onClick={() => setBadges(b)}
                            className={`w-8 h-8 rounded-full font-bold text-sm transition-all shadow-sm ${badges >= b ? 'bg-yellow-500 text-black scale-110' : 'bg-gray-700 text-gray-500 hover:bg-gray-600'}`}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((pokemon, index) => (
                    <TeamSlot
                        key={index}
                        pokemon={pokemon}
                        isLocked={locked[index]}
                        onToggleLock={() => toggleLock(index)}
                        onAdd={(p) => addPokemon(p, index)}
                        onRemove={() => removePokemon(index)}
                        onUpdate={(p) => updatePokemon(index, p)}
                    />
                ))}
            </div>

            {/* Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalysisPanel />
                <div className="space-y-6">
                    <SuggestionsPanel />
                    <CatchRadar />
                </div>
            </div>
        </div>
    );
};
