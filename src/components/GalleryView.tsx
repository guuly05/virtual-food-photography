import React, { useState } from 'react';
import { Dish, StylePreset } from '../types';
import { Download, Camera, Filter, Sparkles, Maximize2, Tag, Layers, Loader2, Archive } from 'lucide-react';
import JSZip from 'jszip';

interface GalleryViewProps {
  dishes: Dish[];
  onOpenEditor: (dish: Dish) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ dishes, onOpenEditor }) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<{
    current: number;
    total: number;
    currentName: string;
    percent: number;
    phase: 'fetching' | 'compressing' | 'complete';
  }>({ current: 0, total: 0, currentName: '', percent: 0, phase: 'fetching' });

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

  const handleDownloadAllZip = async () => {
    if (generatedDishes.length === 0 || isZipping) return;

    setIsZipping(true);
    setZipProgress({
      current: 0,
      total: generatedDishes.length,
      currentName: 'Preparing images...',
      percent: 0,
      phase: 'fetching',
    });

    try {
      const zip = new JSZip();
      const folder = zip.folder('food_photography_gallery');

      for (let i = 0; i < generatedDishes.length; i++) {
        const dish = generatedDishes[i];
        const fetchPercent = Math.round(((i + 0.5) / generatedDishes.length) * 70);

        setZipProgress({
          current: i + 1,
          total: generatedDishes.length,
          currentName: dish.name,
          percent: fetchPercent,
          phase: 'fetching',
        });

        if (!dish.imageUrl) continue;

        const sanitizedName = dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const fileName = `${sanitizedName}_${dish.generatedStyle || 'photo'}.png`;

        if (dish.imageUrl.startsWith('data:')) {
          // Base64 data URL
          const base64Data = dish.imageUrl.split(',')[1];
          folder?.file(fileName, base64Data, { base64: true });
        } else {
          // Regular URL
          const response = await fetch(dish.imageUrl);
          const blob = await response.blob();
          folder?.file(fileName, blob);
        }
      }

      setZipProgress((prev) => ({
        ...prev,
        phase: 'compressing',
        currentName: 'Compressing high-resolution ZIP package...',
        percent: 75,
      }));

      const zipContent = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        const totalPercent = Math.round(75 + (metadata.percent * 0.25));
        setZipProgress((prev) => ({
          ...prev,
          percent: Math.min(totalPercent, 100),
        }));
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipContent);
      link.download = `aperture_food_photography_gallery_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setZipProgress((prev) => ({
        ...prev,
        phase: 'complete',
        currentName: 'ZIP Download Started!',
        percent: 100,
      }));

      setTimeout(() => {
        setIsZipping(false);
      }, 1500);
    } catch (err) {
      console.error('Error generating ZIP archive:', err);
      setIsZipping(false);
    }
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
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting ZIP ({zipProgress.percent}%)...</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>Download All as ZIP Archive ({generatedDishes.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Real-time ZIP Progress Bar Card */}
      {isZipping && (
        <div className="bg-slate-900/90 rounded-2xl border border-amber-500/30 p-5 space-y-3 shadow-xl backdrop-blur animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-white">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              <span>
                {zipProgress.phase === 'fetching'
                  ? `Packaging Photo ${zipProgress.current} of ${zipProgress.total}: `
                  : zipProgress.phase === 'compressing'
                  ? 'Compressing Archive: '
                  : 'Complete: '}
                <strong className="text-amber-400">{zipProgress.currentName}</strong>
              </span>
            </div>
            <span className="text-amber-400 font-mono font-bold">{zipProgress.percent}%</span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${zipProgress.percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>High-Res PNG Assets • Uncompressed Studio Quality</span>
            <span>{zipProgress.current} / {zipProgress.total} Items Processed</span>
          </div>
        </div>
      )}

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
