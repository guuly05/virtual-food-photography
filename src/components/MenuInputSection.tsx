import React, { useState } from 'react';
import { SAMPLE_MENUS } from '../data/sampleMenus';
import { SampleMenu } from '../types';
import { Sparkles, Upload, FileText, UtensilsCrossed, ArrowRight, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';

interface MenuInputSectionProps {
  onMenuParsed: (menuData: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const MenuInputSection: React.FC<MenuInputSectionProps> = ({
  onMenuParsed,
  isLoading,
  setIsLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'sample' | 'text' | 'upload'>('sample');
  const [selectedSample, setSelectedSample] = useState<SampleMenu>(SAMPLE_MENUS[0]);
  const [customMenuText, setCustomMenuText] = useState<string>('');
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle sample selection
  const handleSelectSample = (sample: SampleMenu) => {
    setSelectedSample(sample);
    setCustomMenuText(sample.menuText);
  };

  // Handle file upload (txt or image)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setErrorMessage(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedImageBase64(base64);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCustomMenuText(text);
        setUploadedImageBase64(null);
      };
      reader.readAsText(file);
    }
  };

  // Process menu parsing
  const handleParseSubmit = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const payload: any = {};
      if (activeTab === 'sample') {
        payload.menuText = selectedSample.menuText;
      } else if (activeTab === 'text') {
        if (!customMenuText.trim()) {
          throw new Error('Please paste or type your restaurant menu text.');
        }
        payload.menuText = customMenuText;
      } else if (activeTab === 'upload') {
        if (uploadedImageBase64) {
          payload.imageBase64 = uploadedImageBase64;
        } else if (customMenuText) {
          payload.menuText = customMenuText;
        } else {
          throw new Error('Please upload a menu image or file.');
        }
      }

      const res = await fetch('/api/parse-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to parse menu.');
      }

      onMenuParsed(json.data);
    } catch (err: any) {
      console.error('Parse error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while parsing the menu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
            1. Load or Upload Your Restaurant Menu
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gemini AI will extract all dishes, categories, pricing, and ingredients automatically.
          </p>
        </div>

        {/* Input Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sample')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sample'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sample Menus</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File / Photo</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Sample Menus */}
      {activeTab === 'sample' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SAMPLE_MENUS.map((menu) => {
              const isSelected = selectedSample.id === menu.id;
              return (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => handleSelectSample(menu)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-amber-500 bg-slate-950 ring-2 ring-amber-500/30'
                      : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white font-serif">{menu.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block mb-2">
                    {menu.cuisine}
                  </span>
                  <p className="text-xs text-slate-400 line-clamp-2">{menu.description}</p>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Selected Menu Preview:</span>
              <span className="text-[11px] text-amber-400 font-medium">{selectedSample.cuisine}</span>
            </div>
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto bg-slate-900/80 p-3 rounded-lg border border-slate-800/50">
              {selectedSample.menuText}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Paste Custom Text */}
      {activeTab === 'text' && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-300">
            Paste raw text menu (dishes, descriptions, prices):
          </label>
          <textarea
            rows={8}
            value={customMenuText}
            onChange={(e) => setCustomMenuText(e.target.value)}
            placeholder={`Example Menu Format:

APPETIZERS:
- Pan-Seared Scallops ($18): Fresh diver scallops, cauliflower puree, crispy pancetta, herb oil.

MAINS:
- Grilled Ribeye Steak ($38): Prime Angus ribeye, truffle butter, rosemary roasted potatoes, chimichurri sauce.

DESSERTS:
- Dark Chocolate Fondant ($12): Warm molten chocolate cake with Madagascar vanilla gelato.`}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>
      )}

      {/* Tab 3: Upload File or Photo */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-8 text-center bg-slate-950/50 transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept="image/*,.txt,.md"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-sm font-semibold text-white">
                Drag & Drop or Click to Upload Menu File
              </p>
              <p className="text-xs text-slate-400">
                Supports physical menu photos (.jpg, .png) or text documents (.txt)
              </p>
              {uploadedFileName && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/30">
                  <FileText className="w-4 h-4" />
                  <span>{uploadedFileName}</span>
                </div>
              )}
            </div>
          </div>

          {uploadedImageBase64 && (
            <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <img
                src={uploadedImageBase64}
                alt="Uploaded menu"
                className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-xs font-semibold text-white flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  Scanned Physical Menu Photo Ready
                </p>
                <p className="text-[11px] text-slate-400">
                  Gemini OCR vision model will read and parse all items automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {errorMessage && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 underline hover:text-red-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Submit Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleParseSubmit}
          disabled={isLoading}
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              <span>Analyzing Menu with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Parse Menu & Setup Food Photography Studio</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
