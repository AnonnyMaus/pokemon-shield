import React, { useState } from 'react';
import { TeamBuilder } from './components/team/TeamBuilder';
import { SettingsModal } from './components/settings/SettingsModal';
import { Settings } from 'lucide-react';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <header className="mb-8 text-center relative">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-500">
          Galar Tactician
        </h1>
        <p className="text-gray-500 mt-2">Pokemon Shield Team Optimizer</p>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
          title="Settings"
        >
          <Settings size={24} />
        </button>
      </header>

      <div className="max-w-6xl mx-auto">
        <TeamBuilder />
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}

export default App;
