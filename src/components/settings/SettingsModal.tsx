import React from 'react';
import { X, Info } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TIER_DESCRIPTIONS: Record<string, string> = {
    'Uber': 'Uber: The highest tier. Contains Pokemon that are too powerful for standard play (Directly Banned).',
    'OU': 'OU (OverUsed): The standard competitive tier. The strongest non-banned Pokemon.',
    'UUBL': 'UUBL (UnderUsed Banlist): Pokemon too strong for UU but not quite OU.',
    'UU': 'UU (UnderUsed): Strong Pokemon that are not quite popular enough for OU.',
    'RUBL': 'RUBL (RarelyUsed Banlist): Pokemon too strong for RU but not UU.',
    'RU': 'RU (RarelyUsed): Decent Pokemon that see use in lower power levels.',
    'NUBL': 'NUBL (NeverUsed Banlist): Pokemon that dominate NU.',
    'NU': 'NU (NeverUsed): Niche picks.',
    'PU': 'PU: The lowest usage tier.',
    'LC': 'LC (Little Cup): Un-evolved Pokemon.',
};

const ALL_TIERS = ['Uber', 'OU', 'UUBL', 'UU', 'RUBL', 'RU', 'NUBL', 'NU', 'PU', 'LC'];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { allowedTiers, toggleTier, showCatchRadar, toggleCatchRadar } = useSettingsStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Catch Radar Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-400">Catch Radar</h3>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={showCatchRadar}
                                onChange={toggleCatchRadar}
                                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500/50"
                            />
                            <span className="text-gray-200 group-hover:text-white transition-colors">Enable Catch Radar</span>
                        </label>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Included Tiers</label>
                            <div className="grid grid-cols-2 gap-2">
                                {ALL_TIERS.map(tier => (
                                    <div key={tier} className="relative group/tooltip">
                                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={allowedTiers.includes(tier)}
                                                onChange={() => toggleTier(tier)}
                                                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500/50"
                                            />
                                            <span className="text-gray-300 text-sm font-medium w-12">{tier}</span>
                                            <Info size={14} className="text-gray-500" />
                                        </label>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 text-xs text-gray-300 rounded shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 pointer-events-none">
                                            {TIER_DESCRIPTIONS[tier]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-800/50 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
