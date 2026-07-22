import React from 'react';
import { Camera, Sparkles, BookOpen, LayoutGrid, Image as ImageIcon, SlidersHorizontal, Share2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'editor' | 'menu' | 'gallery' | 'social';
  setActiveTab: (tab: 'editor' | 'menu' | 'gallery' | 'social') => void;
  dishCount: number;
  generatedCount: number;
  onOpenGlobalSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  dishCount,
  generatedCount,
  onOpenGlobalSettings,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Camera className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-serif">
                  Aperture <span className="text-amber-400 font-sans font-medium text-lg">Food Studio</span>
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-3 h-3" />
                  Gemini 3 Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Virtual Food Photographer for Restaurant Menus
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Studio & Menu</span>
              {dishCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === 'editor' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {dishCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'menu'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Visual Menu</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'gallery'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Gallery</span>
              {generatedCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === 'gallery' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {generatedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'social'
                  ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Social Studio</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenGlobalSettings}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
              title="Global Photography Studio Settings"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Studio Setup</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
