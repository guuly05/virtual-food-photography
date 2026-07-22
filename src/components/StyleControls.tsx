import React from 'react';
import { StudioSettings, StylePreset, Resolution, AspectRatio, BackgroundSurface } from '../types';
import { Sun, Moon, Compass, Sparkles, Sliders, Maximize2, Flame, Layers } from 'lucide-react';

interface StyleControlsProps {
  settings: StudioSettings;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
  compact?: boolean;
}

export const StyleControls: React.FC<StyleControlsProps> = ({
  settings,
  onUpdateSettings,
  compact = false,
}) => {

  const stylePresets: Array<{
    id: StylePreset;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgBadge: string;
  }> = [
    {
      id: 'rustic',
      title: 'Rustic / Dark',
      description: 'Warm mood side lighting, deep soft shadows, dark wood & slate textures.',
      icon: <Moon className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-200',
      bgBadge: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'bright',
      title: 'Bright / Modern',
      description: 'Clean diffused studio light, white marble, vibrant natural food colors.',
      icon: <Sun className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/50 bg-sky-950/20 text-sky-200',
      bgBadge: 'bg-sky-500/20 text-sky-300',
    },
    {
      id: 'social',
      title: 'Social Media (Top-Down)',
      description: 'Flat-lay 90° overhead view, curated table layout with linen & garnishes.',
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200',
      bgBadge: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'dramatic_lounge',
      title: 'Midnight Lounge',
      description: 'Focused spotlighting, dark moody velvet, high-end fine dining luxury.',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/50 bg-purple-950/20 text-purple-200',
      bgBadge: 'bg-purple-500/20 text-purple-300',
    },
    {
      id: 'outdoor_sunlit',
      title: 'Outdoor Sunlit',
      description: 'Alfresco dining, golden hour sunlight with dappled foliage shadows.',
      icon: <Sun className="w-5 h-5 text-orange-400" />,
      color: 'border-orange-500/50 bg-orange-950/20 text-orange-200',
      bgBadge: 'bg-orange-500/20 text-orange-300',
    },
  ];

  const resolutions: Array<{ id: Resolution; label: string; desc: string }> = [
    { id: '1K', label: '1K Standard', desc: 'Fast render • Web & Delivery' },
    { id: '2K', label: '2K High-Res', desc: 'Print Ready • Social & Print' },
    { id: '4K', label: '4K Ultra HD', desc: 'Fine Detail • Billboard & Menu' },
  ];

  const aspectRatios: Array<{ id: AspectRatio; label: string; ratioText: string }> = [
    { id: '1:1', label: 'Square (1:1)', ratioText: 'Instagram / App Cards' },
    { id: '4:3', label: 'Standard (4:3)', ratioText: 'Classic Menu Display' },
    { id: '16:9', label: 'Wide Banner (16:9)', ratioText: 'Header / Kiosk Screen' },
    { id: '3:4', label: 'Portrait (3:4)', ratioText: 'Mobile / Digital Board' },
  ];

  const surfaces: Array<{ id: BackgroundSurface; name: string }> = [
    { id: 'dark_slate', name: 'Dark Slate Stone' },
    { id: 'marble', name: 'Carrara White Marble' },
    { id: 'rustic_wood', name: 'Reclaimed Oak Wood' },
    { id: 'terrazzo', name: 'Modern Terrazzo Tile' },
    { id: 'ceramic_tile', name: 'Artisanal Ceramic Tile' },
    { id: 'dark_oak', name: 'Rich Dark Walnut' },
  ];

  return (
    <div className={`bg-slate-900 rounded-2xl border border-slate-800 p-5 ${compact ? 'space-y-4' : 'space-y-6'}`}>
      
      {/* Title & Badge */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-semibold text-white font-serif">
            Food Photography Style & Studio Setup
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
          Model: gemini-3.1-flash-image
        </span>
      </div>

      {/* 1. Primary Style Toggles */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          Aesthetic Photography Style Preset
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stylePresets.map((preset) => {
            const isSelected = settings.style === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onUpdateSettings({ style: preset.id })}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? `${preset.color} ring-2 ring-amber-500/40 shadow-lg shadow-black/40`
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-2">
                    {preset.icon}
                    <span className="font-semibold text-sm text-white">{preset.title}</span>
                  </div>
                  {isSelected && (
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${preset.bgBadge}`}>
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Resolution & Aspect Ratio Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        
        {/* Resolution Affordance (1K, 2K, 4K) */}
        <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 mb-2">
            <Maximize2 className="w-4 h-4 text-amber-400" />
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Output Resolution
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {resolutions.map((res) => {
              const isSelected = settings.resolution === res.id;
              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => onUpdateSettings({ resolution: res.id })}
                  className={`px-2.5 py-2 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{res.label}</div>
                  <div className="text-[9px] opacity-80 mt-0.5 leading-tight">{res.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Aspect Ratio
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {aspectRatios.map((ar) => {
              const isSelected = settings.aspectRatio === ar.id;
              return (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => onUpdateSettings({ aspectRatio: ar.id })}
                  className={`px-2.5 py-2 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{ar.label}</div>
                  <div className="text-[9px] opacity-80 mt-0.5">{ar.ratioText}</div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Surface & Lighting Tweak Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        
        {/* Table Background Surface */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Table Background Surface
          </label>
          <select
            value={settings.surface}
            onChange={(e) => onUpdateSettings({ surface: e.target.value as BackgroundSurface })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {surfaces.map((surf) => (
              <option key={surf.id} value={surf.id}>
                {surf.name}
              </option>
            ))}
          </select>
        </div>

        {/* Depth of Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Lens Depth of Field
          </label>
          <select
            value={settings.depthOfField}
            onChange={(e) =>
              onUpdateSettings({ depthOfField: e.target.value as 'shallow' | 'balanced' | 'deep' })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="shallow">Macro Bokeh (f/1.8 - Shallow Focus)</option>
            <option value="balanced">Balanced Studio (f/2.8)</option>
            <option value="deep">Crisp Plating Overview (f/8 - Full Focus)</option>
          </select>
        </div>

        {/* Toggles (Rising Steam & Garnish) */}
        <div className="flex items-center gap-3 pt-4">
          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.steamEffect}
              onChange={(e) => onUpdateSettings({ steamEffect: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
            />
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Rising Steam Effect</span>
          </label>
        </div>

      </div>

      {/* 4. Custom Studio Tweaks Input */}
      {!compact && (
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Additional Studio Photography Instructions (Optional)
          </label>
          <input
            type="text"
            value={settings.customInstructions}
            onChange={(e) => onUpdateSettings({ customInstructions: e.target.value })}
            placeholder="e.g. Include a vintage silver fork, a small glass of Pinot Noir, and scattered coarse sea salt..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      )}

    </div>
  );
};
