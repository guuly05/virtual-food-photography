import React, { useState } from 'react';
import { Dish, StylePreset } from '../types';
import { Download, Camera, Filter, Sparkles, Maximize2, Tag, Layers } from 'lucide-react';

interface GalleryViewProps {
  dishes: Dish[];
  onOpenEditor: (dish: Dish) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ dishes, onOpenEditor }) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('all');

  const generatedDishes = dishes.filter((d) => d.imageUrl);

  const filteredDishes =
    selectedStyle === 'all'
      ? generatedDishes
      : generatedDishes.filter((d) => d.generatedStyle === selectedStyle);

  const handleDownloadSingle = (dish: Dish) => {
    if (!dish.imageUrl) return;
    const link = document.createElement('a');
    link.href = dish.imageUrl;
    link.download = `${dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_food_photo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    generatedDishes.forEach((dish, idx) => {
      setTimeout(() => {
        handleDownloadSingle(dish);
      }, idx * 300);
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            Food Photography Studio Gallery ({generatedDishes.length} Photos)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            All generated high-resolution food assets, ready for menu print and delivery app publishing.
          </p>
        </div>

        {generatedDishes.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download All ({generatedDishes.length}) Photos</span>
          </button>
        )}
      </div>

      {/* Style Filters */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        <span className="text-xs font-semibold text-slate-400 px-3 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-amber-400" /> Style Filter:
        </span>

        {[
          { id: 'all', label: 'All Styles' },
          { id: 'rustic', label: 'Rustic / Dark' },
          { id: 'bright', label: 'Bright / Modern' },
          { id: 'social', label: 'Social Media (Overhead)' },
          { id: 'dramatic_lounge', label: 'Midnight Lounge' },
          { id: 'outdoor_sunlit', label: 'Outdoor Sunlit' },
        ].map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setSelectedStyle(filter.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStyle === filter.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredDishes.length === 0 ? (
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800/80 p-12 text-center space-y-3">
          <Camera className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-serif">No Food Photos Captured Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Switch back to the Studio tab and click "Shoot Photo" on any dish to generate realistic high-end photography.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg group hover:border-slate-700 transition-all flex flex-col"
            >
              <div
                className="relative aspect-square bg-slate-950 overflow-hidden cursor-pointer"
                onClick={() => onOpenEditor(dish)}
              >
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-3 left-3 flex gap-1">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                    {dish.generatedResolution || '1K'}
                  </span>
                  <span className="text-[10px] font-semibold capitalize px-2 py-0.5 rounded bg-slate-950/80 text-slate-200 border border-slate-700 backdrop-blur-md">
                    {dish.generatedStyle || 'rustic'}
                  </span>
                </div>

                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditor(dish);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View / Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSingle(dish);
                    }}
                    className="p-1.5 rounded-lg bg-slate-950/90 text-slate-200 hover:text-white border border-slate-700"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white font-serif truncate">{dish.name}</h4>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold">{dish.price}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{dish.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
