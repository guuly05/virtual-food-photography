import React, { useState } from 'react';
import { MenuData, Dish } from '../types';
import { Printer, Download, Sparkles, Utensils, Share2, Check, Copy } from 'lucide-react';

interface MenuExportViewProps {
  menuData: MenuData;
}

export const MenuExportView: React.FC<MenuExportViewProps> = ({ menuData }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copied, setCopied] = useState<boolean>(false);

  // Group dishes by category
  const categories = Array.from(new Set(menuData.dishes.map((d) => d.category || 'Featured Dishes')));

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Action Bar (Hidden during printing) */}
      <div className="print:hidden bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-base font-bold text-white font-serif">
            Digital Visual Menu Preview
          </h2>
          <p className="text-xs text-slate-400">
            Formatted menu layout with your generated high-resolution food photography.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                theme === 'dark' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark Luxury
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                theme === 'light' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pristine White
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Actual Menu Board Area */}
      <div
        className={`rounded-3xl p-8 sm:p-12 shadow-2xl transition-colors ${
          theme === 'dark'
            ? 'bg-slate-950 text-slate-100 border border-slate-800'
            : 'bg-stone-50 text-stone-900 border border-stone-200'
        }`}
      >
        
        {/* Menu Header */}
        <div className="text-center max-w-2xl mx-auto border-b pb-8 mb-10 border-amber-500/30">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-3 border border-amber-500/20">
            <Utensils className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
            {menuData.restaurantName}
          </h1>
          <p className="text-xs uppercase font-semibold tracking-widest text-amber-500 mt-2">
            {menuData.cuisineType}
          </p>
          {menuData.tagline && (
            <p className={`text-sm italic mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-stone-600'}`}>
              "{menuData.tagline}"
            </p>
          )}
        </div>

        {/* Categories Grid */}
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryDishes = menuData.dishes.filter((d) => (d.category || 'Featured Dishes') === category);
            if (categoryDishes.length === 0) return null;

            return (
              <div key={category} className="space-y-6">
                
                {/* Category Heading */}
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold font-serif tracking-wide text-amber-500 uppercase border-b-2 border-amber-500/40 pb-1">
                    {category}
                  </h2>
                  <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-stone-300'}`} />
                </div>

                {/* Dishes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className={`rounded-2xl p-4 flex gap-4 border transition-all ${
                        theme === 'dark'
                          ? 'bg-slate-900/60 border-slate-800/80'
                          : 'bg-white border-stone-200/80 shadow-sm'
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/50">
                        {dish.imageUrl ? (
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-500">
                            <Utensils className="w-5 h-5 mb-1 text-slate-600" />
                            <span className="text-[9px]">No Photo</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-sm font-serif">{dish.name}</h3>
                            {dish.price && (
                              <span className="font-mono font-bold text-xs text-amber-500 shrink-0">
                                {dish.price}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-1 leading-relaxed ${
                              theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                            }`}
                          >
                            {dish.description}
                          </p>
                        </div>

                        {/* Dietary Tags */}
                        {dish.dietary && dish.dietary.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {dish.dietary.map((tag, i) => (
                              <span
                                key={i}
                                className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                                  theme === 'dark'
                                    ? 'bg-slate-800 text-slate-300'
                                    : 'bg-stone-100 text-stone-700'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-amber-500/20 text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-stone-500'}`}>
            Shot with Aperture AI Virtual Food Photography • High-Res Commercial Menu Presentation
          </p>
        </div>

      </div>

    </div>
  );
};
