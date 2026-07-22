import React, { useState } from 'react';
import { MenuData, Dish, StudioSettings, StylePreset } from './types';
import { SAMPLE_MENUS } from './data/sampleMenus';
import { Header } from './components/Header';
import { StyleControls } from './components/StyleControls';
import { MenuInputSection } from './components/MenuInputSection';
import { DishCard } from './components/DishCard';
import { DishEditorModal } from './components/DishEditorModal';
import { MenuExportView } from './components/MenuExportView';
import { GalleryView } from './components/GalleryView';
import { SocialMediaStudio } from './components/SocialMediaStudio';
import { Camera, Sparkles, Wand2, RefreshCw, Layers, CheckCircle2, SlidersHorizontal, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'menu' | 'gallery' | 'social'>('editor');
  const [isMenuParsing, setIsMenuParsing] = useState<boolean>(false);
  const [selectedDishForEdit, setSelectedDishForEdit] = useState<Dish | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // Default initial studio settings
  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    style: 'rustic',
    resolution: '1K',
    aspectRatio: '1:1',
    surface: 'dark_slate',
    depthOfField: 'shallow',
    steamEffect: true,
    garnishLevel: 'generous',
    lighting: 'natural_side',
    customInstructions: '',
  });

  // Default initial menu state (parsed from sample 1)
  const [menuData, setMenuData] = useState<MenuData>({
    restaurantName: 'Bella Vista Trattoria',
    cuisineType: 'Modern Italian Fine Casual',
    tagline: 'Authentic handmade pasta, wood-fired pizzas, and Italian artisanal dolci.',
    dishes: [
      {
        id: '1',
        name: 'Truffle Tagliatelle',
        description: 'Hand-rolled egg pasta, wild forest mushrooms, shaved black winter truffle, Parmigiano-Reggiano, sage butter sauce.',
        category: 'Mains',
        price: '$28',
        dietary: ['Vegetarian', 'Chef Special'],
        keyIngredients: ['Handmade Pasta', 'Black Truffle', 'Wild Mushrooms', 'Parmigiano'],
      },
      {
        id: '2',
        name: 'Burrata Caprese',
        description: 'Creamy Puglia burrata, heirloom vine tomatoes, fresh basil pesto, 25-year aged balsamic reduction, extra virgin olive oil drizzle.',
        category: 'Appetizers',
        price: '$18',
        dietary: ['Vegetarian', 'Gluten-Free'],
        keyIngredients: ['Puglia Burrata', 'Heirloom Tomatoes', 'Basil Pesto'],
      },
      {
        id: '3',
        name: 'Neapolitan Margherita Pizza',
        description: 'San Marzano tomato sauce, fior di latte mozzarella, fresh basil leaves, wood-fired blistered crust.',
        category: 'Mains',
        price: '$24',
        dietary: ['Vegetarian'],
        keyIngredients: ['San Marzano Tomatoes', 'Fior di Latte', 'Fresh Basil'],
      },
      {
        id: '4',
        name: 'Tiramisu Tradizionale',
        description: 'Espresso-soaked ladyfingers, velvety mascarpone cream, dark cocoa dust, toasted hazelnut crunch.',
        category: 'Desserts',
        price: '$12',
        dietary: ['Classic Dessert'],
        keyIngredients: ['Espresso', 'Mascarpone', 'Cocoa Powder'],
      },
      {
        id: '5',
        name: 'Crispy Calamari Fritti',
        description: 'Fresh squid rings, charred lemon wheel, spicy calabrian chili aioli.',
        category: 'Appetizers',
        price: '$19',
        dietary: ['Seafood'],
        keyIngredients: ['Fresh Squid', 'Lemon', 'Calabrian Aioli'],
      },
      {
        id: '6',
        name: 'Espresso Martini',
        description: 'Freshly brewed espresso, premium vodka, Kahlua, vanilla bean foam, roasted coffee beans.',
        category: 'Cocktails',
        price: '$16',
        dietary: ['Signature Cocktail'],
        keyIngredients: ['Espresso', 'Vodka', 'Kahlua'],
      },
    ],
  });

  // Handle Settings Update
  const handleUpdateSettings = (newSettings: Partial<StudioSettings>) => {
    setStudioSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Handle New Parsed Menu Data
  const handleMenuParsed = (parsedData: any) => {
    const formattedDishes: Dish[] = (parsedData.dishes || []).map((d: any, idx: number) => ({
      id: `${Date.now()}_${idx}`,
      name: d.name,
      description: d.description || '',
      category: d.category || 'Mains',
      price: d.price || '',
      dietary: d.dietary || [],
      keyIngredients: d.keyIngredients || [],
      suggestedPrompt: d.suggestedPrompt || '',
    }));

    setMenuData({
      restaurantName: parsedData.restaurantName || 'Custom Restaurant',
      cuisineType: parsedData.cuisineType || 'Gourmet Dining',
      tagline: parsedData.tagline || '',
      dishes: formattedDishes,
    });
    setActiveCategoryFilter('all');
  };

  // Generate Photo for a Single Dish
  const handleGenerateDishPhoto = async (dishId: string) => {
    const targetDish = menuData.dishes.find((d) => d.id === dishId);
    if (!targetDish) return;

    // Set Dish isGenerating flag
    setMenuData((prev) => ({
      ...prev,
      dishes: prev.dishes.map((d) => (d.id === dishId ? { ...d, isGenerating: true, error: undefined } : d)),
    }));

    try {
      const payload = {
        dishName: targetDish.name,
        description: targetDish.description,
        category: targetDish.category,
        style: studioSettings.style,
        resolution: studioSettings.resolution,
        aspectRatio: studioSettings.aspectRatio,
        surface: studioSettings.surface,
        depthOfField: studioSettings.depthOfField,
        steamEffect: studioSettings.steamEffect,
        garnishLevel: studioSettings.garnishLevel,
        lighting: studioSettings.lighting,
        customInstructions: studioSettings.customInstructions,
        customPrompt: targetDish.suggestedPrompt,
      };

      const res = await fetch('/api/generate-dish-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate dish photograph.');
      }

      const generatedUrl = json.imageUrl;

      setMenuData((prev) => ({
        ...prev,
        dishes: prev.dishes.map((d) => {
          if (d.id === dishId) {
            const newHistoryItem = {
              id: Date.now().toString(),
              imageUrl: generatedUrl,
              prompt: json.prompt,
              style: json.style,
              resolution: json.resolution,
              timestamp: Date.now(),
            };
            return {
              ...d,
              imageUrl: generatedUrl,
              generatedStyle: json.style,
              generatedResolution: json.resolution,
              isGenerating: false,
              history: [newHistoryItem, ...(d.history || [])],
            };
          }
          return d;
        }),
      }));
    } catch (error: any) {
      console.error('Single dish photo generation error:', error);
      setMenuData((prev) => ({
        ...prev,
        dishes: prev.dishes.map((d) =>
          d.id === dishId ? { ...d, isGenerating: false, error: error.message || 'Generation failed' } : d
        ),
      }));
    }
  };

  // Batch Shoot Entire Menu
  const handleBatchShootEntireMenu = async () => {
    setIsBatchGenerating(true);
    const unshotDishes = menuData.dishes.filter((d) => !d.imageUrl);
    const targetList = unshotDishes.length > 0 ? unshotDishes : menuData.dishes;

    setBatchProgress({ current: 0, total: targetList.length });

    for (let i = 0; i < targetList.length; i++) {
      const dish = targetList[i];
      setBatchProgress({ current: i + 1, total: targetList.length });
      await handleGenerateDishPhoto(dish.id);
    }

    setIsBatchGenerating(false);
  };

  // Handle Photo Retouch Update
  const handleUpdateDishPhotoFromRetouch = (dishId: string, newImageUrl: string, editPrompt?: string) => {
    setMenuData((prev) => ({
      ...prev,
      dishes: prev.dishes.map((d) => {
        if (d.id === dishId) {
          const newHistoryItem = {
            id: Date.now().toString(),
            imageUrl: newImageUrl,
            prompt: editPrompt || 'Retouched photo',
            style: studioSettings.style,
            resolution: studioSettings.resolution,
            timestamp: Date.now(),
          };
          return {
            ...d,
            imageUrl: newImageUrl,
            history: [newHistoryItem, ...(d.history || [])],
          };
        }
        return d;
      }),
    }));
  };

  const categories = ['all', ...Array.from(new Set(menuData.dishes.map((d) => d.category || 'Mains')))];
  const filteredDishes =
    activeCategoryFilter === 'all'
      ? menuData.dishes
      : menuData.dishes.filter((d) => (d.category || 'Mains') === activeCategoryFilter);

  const generatedCount = menuData.dishes.filter((d) => d.imageUrl).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dishCount={menuData.dishes.length}
        generatedCount={generatedCount}
        onOpenGlobalSettings={() => setShowSettingsDrawer(!showSettingsDrawer)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* VIEW TAB 1: STUDIO & MENU EDITOR */}
        {activeTab === 'editor' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* 1. Menu Input Section */}
            <MenuInputSection
              onMenuParsed={handleMenuParsed}
              isLoading={isMenuParsing}
              setIsLoading={setIsMenuParsing}
            />

            {/* 2. Global Style & Studio Settings Bar */}
            <StyleControls
              settings={studioSettings}
              onUpdateSettings={handleUpdateSettings}
            />

            {/* 3. Restaurant Header & Batch Action Controls */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold font-serif text-white">{menuData.restaurantName}</h2>
                  <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {menuData.cuisineType}
                  </span>
                </div>
                {menuData.tagline && (
                  <p className="text-xs text-slate-400 mt-1 italic">"{menuData.tagline}"</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
                  <span>Total Items: <strong className="text-white">{menuData.dishes.length}</strong></span>
                  <span>Photos Shot: <strong className="text-amber-400">{generatedCount} / {menuData.dishes.length}</strong></span>
                </div>
              </div>

              {/* Batch Shoot Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBatchShootEntireMenu}
                  disabled={isBatchGenerating}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-slate-950" />
                  <span>
                    {isBatchGenerating
                      ? `Shooting (${batchProgress.current}/${batchProgress.total})...`
                      : generatedCount === 0
                      ? 'Shoot Entire Menu Photography'
                      : 'Reshoot Remaining Menu'}
                  </span>
                </button>
              </div>
            </div>

            {/* 4. Category Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 pr-2">
                Categories:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 capitalize ${
                    activeCategoryFilter === cat
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 5. Dish Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  settings={studioSettings}
                  onGeneratePhoto={handleGenerateDishPhoto}
                  onOpenEditor={setSelectedDishForEdit}
                />
              ))}
            </div>

          </div>
        )}

        {/* VIEW TAB 2: VISUAL MENU PREVIEW */}
        {activeTab === 'menu' && (
          <div className="animate-fade-in">
            <MenuExportView menuData={menuData} />
          </div>
        )}

        {/* VIEW TAB 3: PHOTO GALLERY */}
        {activeTab === 'gallery' && (
          <div className="animate-fade-in">
            <GalleryView
              dishes={menuData.dishes}
              onOpenEditor={setSelectedDishForEdit}
            />
          </div>
        )}

        {/* VIEW TAB 4: SOCIAL MEDIA STUDIO */}
        {activeTab === 'social' && (
          <div className="animate-fade-in">
            <SocialMediaStudio
              dishes={menuData.dishes}
              menuData={menuData}
            />
          </div>
        )}

      </main>

      {/* Dish Lightbox & Retouching Studio Modal */}
      {selectedDishForEdit && (
        <DishEditorModal
          dish={selectedDishForEdit}
          settings={studioSettings}
          onClose={() => setSelectedDishForEdit(null)}
          onUpdateDishPhoto={handleUpdateDishPhotoFromRetouch}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Aperture Virtual Food Photographer • Powered by Google Gemini 3 Image Models & AI Studio
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Server-side GenAI SDK</span>
            <span>•</span>
            <span>1K / 2K / 4K Resolution</span>
            <span>•</span>
            <span>3 Style Presets</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
