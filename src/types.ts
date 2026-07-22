export type StylePreset = 'rustic' | 'bright' | 'social' | 'dramatic_lounge' | 'outdoor_sunlit';

export type Resolution = '1K' | '2K' | '4K';

export type AspectRatio = '1:1' | '4:3' | '16:9' | '3:4';

export type BackgroundSurface = 'dark_slate' | 'marble' | 'rustic_wood' | 'terrazzo' | 'ceramic_tile' | 'dark_oak';

export interface StudioSettings {
  style: StylePreset;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  surface: BackgroundSurface;
  depthOfField: 'shallow' | 'balanced' | 'deep'; // shallow (f/1.8 macro bokeh) vs deep (f/8 clear)
  steamEffect: boolean;
  garnishLevel: 'minimal' | 'balanced' | 'generous';
  lighting: 'natural_side' | 'soft_diffused' | 'dramatic_spot' | 'overhead_ring';
  customInstructions: string;
}

export interface PhotoHistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  style: StylePreset;
  resolution: Resolution;
  timestamp: number;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: string;
  dietary?: string[];
  keyIngredients?: string[];
  suggestedPrompt?: string;
  imageUrl?: string;
  generatedStyle?: StylePreset;
  generatedResolution?: Resolution;
  isGenerating?: boolean;
  error?: string;
  history?: PhotoHistoryItem[];
}

export interface MenuData {
  restaurantName: string;
  cuisineType: string;
  tagline?: string;
  dishes: Dish[];
}

export interface SampleMenu {
  id: string;
  name: string;
  cuisine: string;
  badge: string;
  description: string;
  menuText: string;
}
