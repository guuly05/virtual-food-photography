import React from 'react';
import { Dish, StudioSettings } from '../types';
import { Camera, RefreshCw, Wand2, Download, Maximize2, Sparkles, Loader2, Tag, Utensils } from 'lucide-react';

interface DishCardProps {
  dish: Dish;
  settings: StudioSettings;
  onGeneratePhoto: (dishId: string) => void;
  onOpenEditor: (dish: Dish) => void;
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  settings,
  onGeneratePhoto,
  onOpenEditor,
}) => {
  // Download generated image
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dish.imageUrl) return;

    const link = document.createElement('a');
    link.href = dish.imageUrl;
    link.download = `${dish.name.toLowerCase().replace(/[^a-z0-0]+/g, '_')}_food_photo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStyleBadgeColor = (style?: string) => {
    switch (style) {
      case 'rustic':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/30';
      case 'bright':
        return 'bg-sky-950/80 text-sky-300 border-sky-500/30';
      case 'social':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30';
      case 'dramatic_lounge':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/30';
      case 'outdoor_sunlit':
        return 'bg-orange-950/80 text-orange-300 border-orange-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col group">
      
      {/* Top Image Preview Studio Area */}
      <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
        
        {dish.isGenerating ? (
          /* Generating State */
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 animate-pulse">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin flex items-center justify-center" />
              <Camera className="w-6 h-6 text-amber-400 absolute inset-0 m-auto" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Shooting Dish Photography
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Applying {settings.style.replace('_', ' ')} style • {settings.resolution} Studio HD
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Rendering food textures & specular highlights...</span>
            </div>
          </div>
        ) : dish.imageUrl ? (
          /* Generated Photo Display */
          <div className="relative w-full h-full group/img cursor-pointer" onClick={() => onOpenEditor(dish)}>
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
              referrerPolicy="no-referrer"
            />

            {/* Overlays & Badges */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 opacity-90 transition-opacity" />

            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border backdrop-blur-md ${getStyleBadgeColor(dish.generatedStyle)}`}>
                {dish.generatedStyle || settings.style}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border border-amber-500/30 bg-slate-950/80 text-amber-400 backdrop-blur-md">
                {dish.generatedResolution || settings.resolution}
              </span>
            </div>

            {/* Hover Actions Bar */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between opacity-100 sm:opacity-0 group-hover/img:opacity-100 transition-all duration-200 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditor(dish);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Retouch & Edit</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:text-white backdrop-blur-md transition-colors"
                  title="Download High-Res Photo"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditor(dish);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:text-white backdrop-blur-md transition-colors"
                  title="Fullscreen Studio Lightbox"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Placeholder / Empty State */
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:border-amber-500/50 group-hover:text-amber-400 transition-colors">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">Ready to Shoot</p>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 px-2">
                Click shoot to capture in <span className="text-amber-400 capitalize">{settings.style.replace('_', ' ')}</span> style.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onGeneratePhoto(dish.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-md cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400 group-hover:text-slate-950" />
              <span>Shoot Photo</span>
            </button>
          </div>
        )}

      </div>

      {/* Bottom Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-white font-serif group-hover:text-amber-300 transition-colors">
              {dish.name}
            </h3>
            {dish.price && (
              <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {dish.price}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
            {dish.description}
          </p>

          {/* Dietary Tags */}
          {dish.dietary && dish.dietary.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {dish.dietary.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  <Tag className="w-2.5 h-2.5 text-amber-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            {dish.category}
          </span>

          <div className="flex items-center gap-2">
            {dish.imageUrl && (
              <button
                type="button"
                onClick={() => onGeneratePhoto(dish.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
                title="Reshoot with current style settings"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                <span>Reshoot</span>
              </button>
            )}

            {!dish.imageUrl && (
              <button
                type="button"
                onClick={() => onGeneratePhoto(dish.id)}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-bold transition-all"
              >
                <Sparkles className="w-3 h-3" />
                <span>Shoot</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
