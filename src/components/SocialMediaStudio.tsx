import React, { useState, useEffect, useRef } from 'react';
import { Dish, MenuData } from '../types';
import {
  Share2,
  Instagram,
  Video,
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Type as TypeIcon,
  Palette,
  Layout,
  RefreshCw,
  Tag,
  MessageSquare,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

interface SocialMediaStudioProps {
  dishes: Dish[];
  menuData: MenuData;
}

type AspectPreset = '1:1' | '4:5' | '9:16' | '16:9';

interface CaptionOption {
  title: string;
  captionText: string;
  hashtags: string[];
}

export const SocialMediaStudio: React.FC<SocialMediaStudioProps> = ({ dishes, menuData }) => {
  const generatedDishes = dishes.filter((d) => d.imageUrl);
  const initialDish = generatedDishes.length > 0 ? generatedDishes[0] : dishes[0] || null;

  const [selectedDish, setSelectedDish] = useState<Dish | null>(initialDish);
  const [aspect, setAspect] = useState<AspectPreset>('1:1');
  const [restaurantTitle, setRestaurantTitle] = useState<string>(menuData.restaurantName || 'Bella Vista Trattoria');
  const [badgeText, setBadgeText] = useState<string>('CHEF\'S SPECIAL ⭐');
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [ctaText, setCtaText] = useState<string>('Link in bio to reserve table 📲');
  const [themeStyle, setThemeStyle] = useState<'dark_luxury' | 'neon_gold' | 'bistro_burgundy' | 'minimal_light'>('dark_luxury');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.85);
  
  // Crop & Adjustments
  const [scale, setScale] = useState<number>(1);
  const [offsetY, setOffsetY] = useState<number>(0);

  // Caption state
  const [captions, setCaptions] = useState<CaptionOption[]>([]);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState<boolean>(false);
  const [copiedCaptionIndex, setCopiedCaptionIndex] = useState<number | null>(null);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const badgePresets = [
    'CHEF\'S SPECIAL ⭐',
    'MUST TRY 🌶️',
    'NEW MENU ITEM ✨',
    'LIMITED EDITION 🔥',
    'TODAY\'S FEATURE 🍷',
    'ORDER ONLINE 📲',
  ];

  // Draw composite social graphic on canvas
  useEffect(() => {
    if (!selectedDish || !selectedDish.imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions based on preset
    let width = 1080;
    let height = 1080;
    if (aspect === '4:5') {
      width = 1080;
      height = 1350;
    } else if (aspect === '9:16') {
      width = 1080;
      height = 1920;
    } else if (aspect === '16:9') {
      width = 1200;
      height = 675;
    }

    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedDish.imageUrl;

    img.onload = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background image scaled & cropped
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;

      let drawW, drawH, drawX, drawY;

      if (imgAspect > canvasAspect) {
        drawH = height * scale;
        drawW = drawH * imgAspect;
      } else {
        drawW = width * scale;
        drawH = drawW / imgAspect;
      }

      drawX = (width - drawW) / 2;
      drawY = (height - drawH) / 2 + offsetY;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Apply Dark/Gradient Overlays depending on theme
      if (themeStyle === 'dark_luxury') {
        // Bottom gradient for text contrast
        const grad = ctx.createLinearGradient(0, height * 0.4, 0, height);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, `rgba(15,23,42,${overlayOpacity * 0.7})`);
        grad.addColorStop(1, `rgba(15,23,42,${overlayOpacity})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Top gradient for badge & brand
        const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.25);
        topGrad.addColorStop(0, `rgba(15,23,42,${overlayOpacity * 0.8})`);
        topGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, width, height * 0.25);
      } else if (themeStyle === 'neon_gold') {
        const grad = ctx.createLinearGradient(0, height * 0.5, 0, height);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(0,0,0,${overlayOpacity})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (themeStyle === 'bistro_burgundy') {
        const grad = ctx.createLinearGradient(0, height * 0.45, 0, height);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(45,10,18,${overlayOpacity})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (themeStyle === 'minimal_light') {
        const grad = ctx.createLinearGradient(0, height * 0.5, 0, height);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, `rgba(255,255,255,${overlayOpacity})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Top Brand Bar
      const margin = width * 0.05;

      // Brand Title Top Left
      ctx.fillStyle = themeStyle === 'minimal_light' ? '#0f172a' : '#ffffff';
      ctx.font = `700 ${Math.round(width * 0.038)}px "Playfair Display", Georgia, serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(restaurantTitle.toUpperCase(), margin, margin);

      // Top Right Badge Sticker
      if (badgeText) {
        ctx.save();
        ctx.font = `bold ${Math.round(width * 0.028)}px sans-serif`;
        const badgeMetrics = ctx.measureText(badgeText);
        const badgeW = badgeMetrics.width + 30;
        const badgeH = width * 0.055;
        const badgeX = width - margin - badgeW;
        const badgeY = margin;

        // Badge pill background
        ctx.fillStyle = themeStyle === 'neon_gold' ? '#f59e0b' : '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);
        ctx.restore();
      }

      // Draw Bottom Dish Info Card
      const bottomY = height - margin;

      // Dish Price Pill
      let priceOffset = 0;
      if (showPrice && selectedDish.price) {
        ctx.save();
        ctx.font = `bold ${Math.round(width * 0.038)}px sans-serif`;
        const priceText = selectedDish.price;
        const pMetrics = ctx.measureText(priceText);
        const pW = pMetrics.width + 36;
        const pH = width * 0.07;
        const pY = bottomY - pH - (ctaText ? width * 0.08 : 0);

        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(margin, pY, pW, pH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(priceText, margin + pW / 2, pY + pH / 2);
        ctx.restore();

        priceOffset = pH + 16;
      }

      // Dish Title
      ctx.save();
      const titleY = bottomY - priceOffset - (ctaText ? width * 0.08 : 0) - width * 0.06;
      ctx.fillStyle = themeStyle === 'minimal_light' ? '#0f172a' : '#ffffff';
      ctx.font = `bold ${Math.round(width * 0.06)}px "Playfair Display", Georgia, serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(selectedDish.name, margin, titleY);

      // Dish Description line
      if (selectedDish.description) {
        ctx.fillStyle = themeStyle === 'minimal_light' ? '#334155' : '#cbd5e1';
        ctx.font = `${Math.round(width * 0.032)}px sans-serif`;
        const shortDesc =
          selectedDish.description.length > 70
            ? selectedDish.description.slice(0, 67) + '...'
            : selectedDish.description;
        ctx.fillText(shortDesc, margin, titleY + width * 0.045);
      }

      // CTA Line at bottom
      if (ctaText) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = `600 ${Math.round(width * 0.03)}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(ctaText, margin, bottomY);
      }

      ctx.restore();
    };
  }, [selectedDish, aspect, restaurantTitle, badgeText, showPrice, ctaText, themeStyle, overlayOpacity, scale, offsetY]);

  // Handle AI Caption Generation
  const handleGenerateCaptions = async () => {
    if (!selectedDish) return;
    setIsGeneratingCaptions(true);

    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName: selectedDish.name,
          description: selectedDish.description,
          price: selectedDish.price,
          restaurantName: restaurantTitle,
          platform: aspect === '9:16' ? 'tiktok' : 'instagram',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data?.captions) {
        setCaptions(json.data.captions);
      }
    } catch (err) {
      console.error('Error generating captions:', err);
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  const handleDownloadGraphic = () => {
    if (!canvasRef.current || !selectedDish) return;
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `${restaurantTitle.toLowerCase().replace(/\s+/g, '_')}_${selectedDish.name.toLowerCase().replace(/\s+/g, '_')}_social.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCaption = (text: string, hashtags: string[], index: number) => {
    const fullText = `${text}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCaptionIndex(index);
    setTimeout(() => setCopiedCaptionIndex(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Studio Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Share2 className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white font-serif">
              Social Media Post & Reel Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auto-crop dish photography, add branded badges & text overlays, and generate AI Instagram/TikTok captions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadGraphic}
            disabled={!selectedDish}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download Social Post PNG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Canvas Preview */}
        <div className="lg:col-span-6 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 flex flex-col items-center justify-center space-y-4 shadow-xl">
          
          <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-400" />
              Live Graphic Composite Preview ({aspect})
            </span>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
              Ready to Export
            </span>
          </div>

          {/* Canvas Box */}
          <div className="relative w-full max-w-md aspect-square flex items-center justify-center bg-slate-950 rounded-2xl p-2 border border-slate-800/80 shadow-2xl overflow-hidden">
            {selectedDish ? (
              <canvas
                ref={canvasRef}
                className="max-h-[460px] w-auto h-auto object-contain rounded-xl shadow-lg border border-slate-800"
              />
            ) : (
              <p className="text-xs text-slate-500">Select a dish photo to begin styling.</p>
            )}
          </div>

          {/* Dish Selector Thumbnails */}
          {generatedDishes.length > 0 && (
            <div className="w-full pt-2">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Dish Photo to Format:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {generatedDishes.map((dish) => {
                  const isSelected = selectedDish?.id === dish.id;
                  return (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => setSelectedDish(dish)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border shrink-0 transition-all ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-500/40 scale-105'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Style & Brand Controls */}
        <div className="lg:col-span-6 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-xl">
          
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-serif">Brand Overlay & Layout Controls</h3>
          </div>

          {/* 1. Aspect Ratio Format */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Social Platform Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '1:1', label: '1:1 Square', desc: 'Insta Feed' },
                { id: '4:5', label: '4:5 Portrait', desc: 'Insta Post' },
                { id: '9:16', label: '9:16 Story', desc: 'Reels / TikTok' },
                { id: '16:9', label: '16:9 Banner', desc: 'FB / Header' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAspect(item.id as AspectPreset)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    aspect === item.id
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[9px] opacity-80">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Restaurant Name & Sticker Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Restaurant Title
              </label>
              <input
                type="text"
                value={restaurantTitle}
                onChange={(e) => setRestaurantTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sticker Badge Text
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Badge Chips */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">Preset Sticker Badges:</span>
            <div className="flex flex-wrap gap-1.5">
              {badgePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBadgeText(preset)}
                  className="text-[10px] bg-slate-950 hover:bg-amber-500/20 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Theme & Frame Aesthetics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Overlay Aesthetic Theme
              </label>
              <select
                value={themeStyle}
                onChange={(e) => setThemeStyle(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="dark_luxury">Dark Luxury (Slate & Gold)</option>
                <option value="neon_gold">Midnight Black & Amber Glow</option>
                <option value="bistro_burgundy">Bistro Burgundy Vignette</option>
                <option value="minimal_light">Pristine Minimal Light</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bottom Call to Action
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. Link in bio to reserve table"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Crop & Scale Controls */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Photo Scale ({Math.round(scale * 100)}%)</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.8"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Vertical Shift ({offsetY}px)</span>
              </div>
              <input
                type="range"
                min="-300"
                max="300"
                step="10"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* 4. AI Social Captions Generator */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-serif flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Social Caption & Hashtag Writer
              </span>
              <button
                type="button"
                onClick={handleGenerateCaptions}
                disabled={isGeneratingCaptions || !selectedDish}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingCaptions ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing Captions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Captions</span>
                  </>
                )}
              </button>
            </div>

            {/* Rendered AI Captions list */}
            {captions.length > 0 && (
              <div className="space-y-3 pt-2">
                {captions.map((cap, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 uppercase font-mono">{cap.title}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCaption(cap.captionText, cap.hashtags, idx)}
                        className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-800"
                      >
                        {copiedCaptionIndex === idx ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{copiedCaptionIndex === idx ? 'Copied!' : 'Copy Caption'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {cap.captionText}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {cap.hashtags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] text-amber-400 font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
