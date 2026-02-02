import React, { useMemo } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { GapAnalysis } from '../../utils/gapAnalysis';
import { TypeCalculator } from '../../utils/typeCalc';
import { ALL_TYPES } from '../../data/typeChart';

export const AnalysisPanel: React.FC = () => {
    const { team } = useTeamStore();
    const activeTeam = team.filter((p): p is NonNullable<typeof p> => p !== null);

    const analysis = useMemo(() => {
        return GapAnalysis.analyzeTeam(activeTeam.map(p => p.types));
    }, [team]);

    if (activeTeam.length === 0) {
        return (
            <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-500">
                Add Pokemon to see analysis
            </div>
        );
    }

    const majorWeaknesses = Object.entries(analysis.weaknessMap)
        .filter(([, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1]);

    const coverageGaps = analysis.missingCoverage;

    const getHelpfulMessage = (type: string, mode: 'defense' | 'offense') => {
        if (mode === 'defense') {
            // Suggest types that Resist this weakness
            // We want types T where T resists 'type' (Multiplier(type, T) < 1)
            const resistors = ALL_TYPES.filter(t => TypeCalculator.getMultiplier(type as any, t) < 1);
            return `Consider adding: ${resistors.slice(0, 3).join('/')} (Resists ${type})`;
        } else {
            // Suggest types that Hit this type Super Effectively
            // We want types T where Multiplier(T, type) > 1
            const hitters = ALL_TYPES.filter(t => TypeCalculator.getMultiplier(t, type as any) > 1);
            return `Consider adding: ${hitters.slice(0, 3).join('/')} (Hits ${type})`;
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Team Analysis</h3>

            <div className="space-y-6">
                <div>
                    <h4 className="text-red-400 text-sm font-semibold uppercase tracking-wider mb-2">Defensive Gaps</h4>
                    <p className="text-xs text-gray-400 mb-2">Types your team struggles against (Hover for tips):</p>
                    <div className="flex flex-wrap gap-2">
                        {majorWeaknesses.length === 0 && <span className="text-green-500 text-sm font-medium">Solid defense! No major shared weaknesses.</span>}
                        {majorWeaknesses.map(([type, count]) => (
                            <div
                                key={type}
                                className="group relative bg-red-900/50 border border-red-700 text-red-100 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 cursor-help transition-all hover:bg-red-800"
                                title={getHelpfulMessage(type, 'defense')}
                            >
                                <span>{type}</span>
                                <span className="bg-red-950 px-1.5 rounded text-xs text-red-200">{count}x</span>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/90 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl border border-gray-700">
                                    {getHelpfulMessage(type, 'defense')}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-2">Offensive Coverage (Missing)</h4>
                    <p className="text-xs text-gray-400 mb-2">Types you don't hit for super-effective damage (STAB):</p>
                    <div className="flex flex-wrap gap-2">
                        {coverageGaps.length === 0 ? (
                            <span className="text-green-500 text-sm font-medium">Perfect offensive coverage!</span>
                        ) : (
                            coverageGaps.map(type => (
                                <div
                                    key={type}
                                    className="group relative bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs cursor-help hover:bg-gray-600 transition-colors"
                                    title={getHelpfulMessage(type, 'offense')}
                                >
                                    {type}
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/90 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl border border-gray-700">
                                        {getHelpfulMessage(type, 'offense')}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
