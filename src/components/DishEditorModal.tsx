import React, { useState, useEffect } from 'react';
import { Dish, StudioSettings, PhotoHistoryItem } from '../types';
import { X, Wand2, Download, Sparkles, Loader2, History, Check, ArrowRight, RefreshCw, ZoomIn, SlidersHorizontal, BookMarked, Plus, Trash2, Tag, ChevronDown, ChevronUp, Columns2, Eye } from 'lucide-react';

interface DishEditorModalProps {
  dish: Dish | null;
  settings: StudioSettings;
  onClose: () => void;
  onUpdateDishPhoto: (dishId: string, newImageUrl: string, editPrompt?: string) => void;
}

interface PromptSnippet {
  id: string;
  category: string;
  text: string;
  isCustom?: boolean;
}

const DEFAULT_SNIPPETS: PromptSnippet[] = [
  { id: '1', category: 'Lighting & Mood', text: 'Dramatic side spotlighting with deep shadows' },
  { id: '2', category: 'Lighting & Mood', text: 'Warm golden hour sunlight filtering through leaves' },
  { id: '3', category: 'Lighting & Mood', text: 'Moody midnight lounge ambience with soft amber backlight' },
  { id: '4', category: 'Close-up Details', text: 'Macro lens extreme detail showing crispy caramelized edges' },
  { id: '5', category: 'Close-up Details', text: 'Shallow depth of field with ultra-creamy background bokeh' },
  { id: '6', category: 'Food Action & Effects', text: 'Glowing melted cheese pull stretching upwards' },
  { id: '7', category: 'Food Action & Effects', text: 'Delicate wisps of steam gently rising from the hot plate' },
  { id: '8', category: 'Food Action & Effects', text: 'Rich glossy sauce dripping down the side of the dish' },
  { id: '9', category: 'Props & Styling', text: 'Dark Carrara marble surface with scattered Maldon sea salt flakes' },
  { id: '10', category: 'Props & Styling', text: 'Artisanal linen napkin with vintage brass cutlery and red wine glass' },
];

export const DishEditorModal: React.FC<DishEditorModalProps> = ({
  dish,
  settings,
  onClose,
  onUpdateDishPhoto,
}) => {
  if (!dish) return null;

  const [editPrompt, setEditPrompt] = useState<string>('');
  const [isRetouching, setIsRetouching] = useState<boolean>(false);
  const [activeImage, setActiveImage] = useState<string>(dish.imageUrl || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<PhotoHistoryItem[]>(dish.history || []);

  // Comparison State
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [compareImage, setCompareImage] = useState<string | null>(null);

  // Prompt Library Drawer state
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [customSnippets, setCustomSnippets] = useState<PromptSnippet[]>([]);
  const [newSnippetText, setNewSnippetText] = useState<string>('');
  const [newSnippetCategory, setNewSnippetCategory] = useState<string>('Custom Snippets');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('All');

  // Load custom snippets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aperture_prompt_library');
      if (stored) {
        setCustomSnippets(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load prompt library from localStorage', e);
    }
  }, []);

  // Save custom snippet to library
  const handleAddCustomSnippet = () => {
    if (!newSnippetText.trim()) return;
    const snippet: PromptSnippet = {
      id: Date.now().toString(),
      category: newSnippetCategory || 'Custom Snippets',
      text: newSnippetText.trim(),
      isCustom: true,
    };
    const updated = [snippet, ...customSnippets];
    setCustomSnippets(updated);
    setNewSnippetText('');
    try {
      localStorage.setItem('aperture_prompt_library', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save prompt snippet', e);
    }
  };

  // Remove custom snippet
  const handleRemoveCustomSnippet = (id: string) => {
    const updated = customSnippets.filter((s) => s.id !== id);
    setCustomSnippets(updated);
    try {
      localStorage.setItem('aperture_prompt_library', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete prompt snippet', e);
    }
  };

  // Insert snippet into edit prompt
  const handleInsertSnippet = (snippetText: string) => {
    setEditPrompt((prev) => {
      if (!prev.trim()) return snippetText;
      if (prev.trim().endsWith(',')) return `${prev.trim()} ${snippetText}`;
      return `${prev.trim()}, ${snippetText}`;
    });
  };

  const allSnippets = [...customSnippets, ...DEFAULT_SNIPPETS];
  const categories = ['All', 'Saved Custom', ...Array.from(new Set(DEFAULT_SNIPPETS.map((s) => s.category)))];

  const filteredSnippets = allSnippets.filter((s) => {
    if (activeCategoryTab === 'All') return true;
    if (activeCategoryTab === 'Saved Custom') return s.isCustom;
    return s.category === activeCategoryTab;
  });

  const retouchPresets = [
    'Add rising steam wisps above the dish',
    'Include a glass of red wine in the background',
    'Sprinkle vibrant microgreens & cracked black pepper',
    'Make the sauce extra glossy and rich',
    'Swap background to dark Carrara marble slate',
    'Add artisanal linen napkin and vintage brass cutlery',
  ];

  // Apply AI Edit / Retouch
  const handleApplyRetouch = async (promptToUse?: string) => {
    const finalPrompt = promptToUse || editPrompt;
    if (!finalPrompt.trim() || !activeImage) return;

    setIsRetouching(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/edit-dish-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: activeImage,
          editPrompt: finalPrompt,
          resolution: settings.resolution,
          aspectRatio: settings.aspectRatio,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to retouch image.');
      }

      const newUrl = json.imageUrl;
      setActiveImage(newUrl);

      // Save to local history state
      const newItem: PhotoHistoryItem = {
        id: Date.now().toString(),
        imageUrl: newUrl,
        prompt: finalPrompt,
        style: settings.style,
        resolution: settings.resolution,
        timestamp: Date.now(),
      };
      setHistoryItems((prev) => [newItem, ...prev]);

      // Notify parent component
      onUpdateDishPhoto(dish.id, newUrl, finalPrompt);
      setEditPrompt('');
    } catch (err: any) {
      console.error('Retouch error:', err);
      setErrorMessage(err.message || 'An error occurred while editing the image.');
    } finally {
      setIsRetouching(false);
    }
  };

  const handleDownloadActive = () => {
    const link = document.createElement('a');
    link.href = activeImage;
    link.download = `${dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_retouched.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleCompare = () => {
    if (!isComparing) {
      const prevImage = historyItems.find((item) => item.imageUrl !== activeImage)?.imageUrl || historyItems[1]?.imageUrl || activeImage;
      setCompareImage(prevImage);
      setIsComparing(true);
    } else {
      setIsComparing(false);
    }
  };

  const handleSelectActiveFromCompare = (selectedUrl: string) => {
    setActiveImage(selectedUrl);
    onUpdateDishPhoto(dish.id, selectedUrl, 'Selected from comparison');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-serif">{dish.name}</h2>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {dish.price}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Studio Photography Lightbox & AI Retouching Suite
            </p>
          </div>

          <div className="flex items-center gap-3">
            {historyItems.length > 1 && (
              <button
                type="button"
                onClick={handleToggleCompare}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isComparing
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>{isComparing ? 'Close Compare' : 'Side-by-Side Compare'}</span>
              </button>
            )}

            <button
              onClick={handleDownloadActive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download Photo</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          
          {/* Left Column: Image Canvas Lightbox / Comparison */}
          <div className="lg:col-span-7 bg-slate-950 p-6 flex flex-col items-center justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800 min-h-[360px]">
            {isRetouching ? (
              <div className="flex flex-col items-center justify-center my-auto space-y-3 p-8 text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
                  <Wand2 className="w-6 h-6 text-amber-400 absolute inset-0 m-auto" />
                </div>
                <p className="text-sm font-bold text-amber-300">Applying AI Retouching...</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Gemini 3.1 Flash Vision model is updating food textures, lighting, and requested garnishes.
                </p>
              </div>
            ) : isComparing ? (
              /* SIDE BY SIDE COMPARISON VIEW */
              <div className="w-full h-full flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-900 pb-2">
                  <span className="font-bold text-amber-400 font-mono uppercase flex items-center gap-1.5">
                    <Columns2 className="w-4 h-4 text-amber-400" /> Side-by-Side Shot Comparison
                  </span>
                  <span className="text-[11px] text-slate-500">Click "Set Active" to pick winning photo</span>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1 items-center">
                  {/* Left: Baseline / Version A */}
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex flex-col items-center space-y-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Version A (Baseline)
                      </span>
                      {compareImage !== activeImage && (
                        <button
                          type="button"
                          onClick={() => handleSelectActiveFromCompare(compareImage || activeImage)}
                          className="text-[10px] font-bold text-slate-300 hover:text-amber-400 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                        >
                          Set Active
                        </button>
                      )}
                    </div>
                    <div className="relative aspect-square w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
                      <img
                        src={compareImage || activeImage}
                        alt="Version A"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Right: Active / Version B */}
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-amber-500/30 flex flex-col items-center space-y-2 shadow-lg">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Version B (Current Active)
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    </div>
                    <div className="relative aspect-square w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-amber-500/30">
                      <img
                        src={activeImage}
                        alt="Version B"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center">
                  Select baseline to compare against:
                  <div className="flex items-center justify-center gap-2 mt-1.5 overflow-x-auto pb-1">
                    {historyItems.map((item, idx) => (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => setCompareImage(item.imageUrl)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                          compareImage === item.imageUrl
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Shot #{historyItems.length - idx}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeImage ? (
              <div className="relative w-full h-full flex items-center justify-center group my-auto">
                <img
                  src={activeImage}
                  alt={dish.name}
                  className="max-h-[500px] w-auto object-contain rounded-2xl shadow-2xl border border-slate-800"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <p className="text-slate-500 text-xs">No image available.</p>
            )}

            {/* History Thumbnails */}
            {historyItems.length > 0 && !isComparing && (
              <div className="w-full mt-4 pt-3 border-t border-slate-900 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <History className="w-3 h-3 text-amber-400" /> History:
                </span>
                {historyItems.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => setActiveImage(item.imageUrl)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border transition-all shrink-0 ${
                      activeImage === item.imageUrl ? 'border-amber-400 ring-2 ring-amber-500/30' : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={item.imageUrl} alt="History shot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Retouching Controls */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6 bg-slate-900">
            
            <div className="space-y-5">
              
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-serif">AI Food Photo Retouching Studio</h3>
              </div>

              {/* Quick Retouch Preset Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  1-Click Retouch Adjustments
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {retouchPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isRetouching}
                      onClick={() => handleApplyRetouch(preset)}
                      className="text-[11px] bg-slate-950 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 transition-all text-left flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{preset}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Text Prompt Retouch */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Custom AI Retouch Instructions
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowLibrary(!showLibrary)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>Prompt Snippet Library ({allSnippets.length})</span>
                    {showLibrary ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* PROMPT LIBRARY DRAWER PANEL */}
                {showLibrary && (
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3.5 animate-fade-in my-2">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                        <Tag className="w-3 h-3 text-amber-400" /> Reusable Food Photography Snippets
                      </span>
                      <span className="text-[10px] text-slate-500">Click snippet to insert</span>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategoryTab(cat)}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                            activeCategoryTab === cat
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Snippet Items List */}
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {filteredSnippets.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic py-2">No snippets found in this category.</p>
                      ) : (
                        filteredSnippets.map((snippet) => (
                          <div
                            key={snippet.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 text-left transition-colors group"
                          >
                            <button
                              type="button"
                              onClick={() => handleInsertSnippet(snippet.text)}
                              className="flex-1 text-left text-xs text-slate-300 group-hover:text-amber-300 flex items-center gap-2"
                            >
                              <Plus className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{snippet.text}</span>
                            </button>

                            {snippet.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomSnippet(snippet.id)}
                                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                                title="Delete saved snippet"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Save New Snippet Input Form */}
                    <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
                      <input
                        type="text"
                        value={newSnippetText}
                        onChange={(e) => setNewSnippetText(e.target.value)}
                        placeholder="Save custom phrase (e.g. dramatic lighting)..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSnippet();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSnippet}
                        disabled={!newSnippetText.trim()}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  rows={3}
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g. Add a dusting of powdered sugar on top, make the chocolate glaze dripping down the side, add a mint leaf garnish..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-red-400 bg-red-950/50 p-2.5 rounded-lg border border-red-500/30">
                  {errorMessage}
                </p>
              )}

            </div>

            {/* Submit Retouch Action */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleApplyRetouch()}
                disabled={isRetouching || !editPrompt.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isRetouching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Retouching in Studio...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Apply Custom AI Retouching</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
