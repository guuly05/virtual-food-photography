import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size limits for base64 image transfers
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Shared Gemini client setup
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. Parse Menu API (Extract structured dishes from raw text or uploaded menu)
  app.post('/api/parse-menu', async (req, res) => {
    try {
      const { menuText, imageBase64 } = req.body;
      if (!menuText && !imageBase64) {
        return res.status(400).json({ error: 'Please provide either menu text or a menu image.' });
      }

      const ai = getGenAI();

      const parts: any[] = [];

      if (imageBase64) {
        let mimeType = 'image/png';
        let rawBase64 = imageBase64;
        if (imageBase64.includes(';base64,')) {
          const split = imageBase64.split(';base64,');
          mimeType = split[0].replace('data:', '') || 'image/png';
          rawBase64 = split[1];
        }
        parts.push({
          inlineData: {
            mimeType,
            data: rawBase64,
          },
        });
      }

      const systemPrompt = `You are an expert culinary menu analyst for high-end restaurant food photography.
Analyze the provided menu text/image and extract all dishes into structured categories (Appetizers, Mains, Desserts, Cocktails, Specials, Side Dishes, etc.).
For each dish, provide:
1. Full dish name
2. Clear appetizing description detailing key ingredients, sauces, and cooking techniques
3. Category
4. Estimated price string (e.g. "$18" if provided or blank)
5. Dietary tags array (e.g., ["Vegan", "Gluten-Free", "Chef Special", "Spicy", "Vegetarian", "Dairy-Free"])
6. Key ingredients list
7. Suggested studio photography prompt (describing how this specific dish should be plated and presented for commercial food photography).`;

      if (menuText) {
        parts.push({
          text: `Here is the menu text to parse:\n\n${menuText}`,
        });
      } else {
        parts.push({
          text: 'Parse all dishes from this menu image into structured categories.',
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: { parts },
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              restaurantName: { type: Type.STRING, description: 'Name of the restaurant or detected cuisine title' },
              cuisineType: { type: Type.STRING, description: 'Cuisine style (e.g., Modern Italian, Japanese Izakaya, Bistro)' },
              tagline: { type: Type.STRING, description: 'Short catchy tagline for the restaurant' },
              dishes: {
                type: Type.ARRAY,
                description: 'List of parsed menu dishes',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING },
                    price: { type: Type.STRING },
                    dietary: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    keyIngredients: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    suggestedPrompt: { type: Type.STRING },
                  },
                  required: ['name', 'description', 'category'],
                },
              },
            },
            required: ['restaurantName', 'cuisineType', 'dishes'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);

      res.json({
        success: true,
        data: parsedData,
      });
    } catch (error: any) {
      console.error('Error parsing menu:', error);
      res.status(500).json({
        error: error.message || 'Failed to parse menu text.',
      });
    }
  });

  // 2. Generate Dish Photography API
  app.post('/api/generate-dish-image', async (req, res) => {
    try {
      const {
        dishName,
        description,
        category,
        style = 'rustic',
        resolution = '1K',
        aspectRatio = '1:1',
        surface = 'dark_slate',
        depthOfField = 'shallow',
        steamEffect = true,
        garnishLevel = 'generous',
        lighting = 'natural_side',
        customInstructions = '',
        customPrompt = '',
      } = req.body;

      if (!dishName) {
        return res.status(400).json({ error: 'Dish name is required.' });
      }

      const ai = getGenAI();

      // Build style specific environment description
      let styleText = '';
      if (style === 'rustic') {
        styleText = 'Rustic dark restaurant food photography aesthetic. Warm mood side lighting, deep soft shadows, artisanal handcrafted stoneware plate, dark rustic wood or slate table background, scattered micro herbs and raw ingredients around the dish, cozy authentic bistro ambiance.';
      } else if (style === 'bright') {
        styleText = 'Bright modern high-key editorial food photography. Clean soft diffused daylight studio lighting, pristine white marble surface, vibrant saturated fresh natural food colors, sleek minimalist ceramic plating, airy high-end magazine food presentation.';
      } else if (style === 'social') {
        styleText = 'Trending social media flat-lay food photography shot directly from a 90-degree top-down overhead perspective. Perfectly arranged table composition with dish in center, rustic linen napkin, elegant cutlery, garnishes, and side dipping sauces. Balanced ambient lighting.';
      } else if (style === 'dramatic_lounge') {
        styleText = 'Dramatic midnight lounge luxury dining photography. Dark moody backdrop, focused amber spotlight illumination on the hero dish, golden highlights, matte black slate plating, dark velvet napkin, opulent night-out atmosphere.';
      } else if (style === 'outdoor_sunlit') {
        styleText = 'Sun-drenched patio outdoor food photography. Golden hour direct sunlight creating long soft foliage shadows, rustic outdoor wooden tabletop, fresh alfresco dining vibe, vibrant natural sunlight reflections.';
      }

      // Background surface details
      const surfaceDetails: Record<string, string> = {
        dark_slate: 'dark textured slate stone surface',
        marble: 'polished white Italian Carrara marble surface',
        rustic_wood: 'reclaimed dark oak wooden tabletop',
        terrazzo: 'modern terrazzo stone tile tabletop',
        ceramic_tile: 'glaze ceramic artisanal tile surface',
        dark_oak: 'rich dark walnut wood table',
      };
      const backgroundDesc = surfaceDetails[surface] || 'high-end restaurant table surface';

      // Lighting text
      const lightingText: Record<string, string> = {
        natural_side: 'soft natural side window lighting with gentle rim lights',
        soft_diffused: 'even studio softbox diffusion lighting',
        dramatic_spot: 'focused high-contrast directional spotlight',
        overhead_ring: 'balanced soft top lighting with minimal harsh shadow',
      };
      const lightDesc = lightingText[lighting] || 'professional studio food photography lighting';

      // Steam & Garnish effects
      const steamDesc = steamEffect ? 'delicate wisps of hot steam rising appetizingly from the dish, ' : '';
      const garnishDesc =
        garnishLevel === 'generous'
          ? 'generously garnished with vibrant fresh herbs, edible microgreens, micro-sprouts, and cracked black pepper, '
          : garnishLevel === 'minimal'
          ? 'elegantly minimalist garnish, clean plating, '
          : 'carefully placed fresh herb garnishes and sauce drizzle, ';

      const dofDesc =
        depthOfField === 'shallow'
          ? 'shot with a macro lens at f/1.8 shallow depth of field, creamy background blur (bokeh), tack-sharp focus on the hero food texture, '
          : depthOfField === 'deep'
          ? 'shot at f/8 aperture with crisp edge-to-edge sharpness across the entire plating composition, '
          : 'balanced f/2.8 focus highlighting key food details with smooth background drop-off, ';

      // Final Master Prompt Construction
      const fullPrompt = customPrompt
        ? customPrompt
        : `Commercial high-end food photography of ${dishName}. ${description ? `Dish description: ${description}.` : ''}
${styleText} Plated on a beautiful artisan plate placed on a ${backgroundDesc}. ${lightDesc}. ${steamDesc}${garnishDesc}${dofDesc} Mouth-watering realistic glossy sauces, rich textures, professional food styling, photorealistic 8k commercial restaurant photography. ${customInstructions ? `Additional styling notes: ${customInstructions}` : ''}`.trim();

      // Use gemini-3.1-flash-image for image generation
      // Supports imageSize: "1K" | "2K" | "4K"
      const validResolution = ['1K', '2K', '4K'].includes(resolution) ? resolution : '1K';
      const validAspectRatio = ['1:1', '4:3', '16:9', '3:4'].includes(aspectRatio) ? aspectRatio : '1:1';

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: validAspectRatio as any,
            imageSize: validResolution as any,
          },
        },
      });

      let generatedImageUrl = '';
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!generatedImageUrl) {
        throw new Error('No image was returned from the Gemini model.');
      }

      res.json({
        success: true,
        imageUrl: generatedImageUrl,
        prompt: fullPrompt,
        style,
        resolution: validResolution,
        aspectRatio: validAspectRatio,
      });
    } catch (error: any) {
      console.error('Error generating dish photo:', error);
      res.status(500).json({
        error: error.message || 'Failed to generate dish photograph.',
      });
    }
  });

  // 3. Edit / Retouch Existing Dish Photo API (Image-to-Image Editing)
  app.post('/api/edit-dish-image', async (req, res) => {
    try {
      const {
        imageBase64,
        editPrompt,
        resolution = '1K',
        aspectRatio = '1:1',
      } = req.body;

      if (!imageBase64 || !editPrompt) {
        return res.status(400).json({ error: 'Both imageBase64 and editPrompt are required.' });
      }

      const ai = getGenAI();

      let mimeType = 'image/png';
      let rawBase64 = imageBase64;
      if (imageBase64.includes(';base64,')) {
        const split = imageBase64.split(';base64,');
        mimeType = split[0].replace('data:', '') || 'image/png';
        rawBase64 = split[1];
      }

      const fullEditInstructions = `You are an expert digital food stylist and photo editor.
Edit the provided food photograph according to these instructions: "${editPrompt}".
Maintain the core identity, plating composition, and high commercial food photography quality of the original dish while seamlessly executing the requested changes. Keep the lighting photorealistic, glossy, and appetizing.`;

      const validResolution = ['1K', '2K', '4K'].includes(resolution) ? resolution : '1K';
      const validAspectRatio = ['1:1', '4:3', '16:9', '3:4'].includes(aspectRatio) ? aspectRatio : '1:1';

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: rawBase64,
              },
            },
            {
              text: fullEditInstructions,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: validAspectRatio as any,
            imageSize: validResolution as any,
          },
        },
      });

      let updatedImageUrl = '';
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            updatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!updatedImageUrl) {
        throw new Error('No edited image was returned from Gemini.');
      }

      res.json({
        success: true,
        imageUrl: updatedImageUrl,
        editPrompt,
      });
    } catch (error: any) {
      console.error('Error editing dish photo:', error);
      res.status(500).json({
        error: error.message || 'Failed to retouch food photo.',
      });
    }
  });

  // 4. Generate AI Social Media Captions API
  app.post('/api/generate-caption', async (req, res) => {
    try {
      const { dishName, description, price, restaurantName, platform = 'instagram' } = req.body;
      if (!dishName) {
        return res.status(400).json({ error: 'Dish name is required.' });
      }

      const ai = getGenAI();

      const prompt = `You are a social media manager for a high-end restaurant (${restaurantName || 'Our Restaurant'}).
Write 3 engaging, mouth-watering social media captions for ${platform === 'tiktok' ? 'TikTok / Reels' : 'Instagram / Facebook'} featuring the dish "${dishName}".
Dish Description: ${description || ''}
Price: ${price || ''}

For each option, include:
1. Hook line to grab attention
2. Delicious sensory description
3. Call-to-action (e.g., "Reserve your table", "Order on DoorDash", "Tag a friend who needs this!")
4. 5-8 relevant trending food hashtags (#foodie, #foodporn, #${(restaurantName || 'restaurant').toLowerCase().replace(/\s+/g, '')}, etc.)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              captions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'Style style title (e.g., Short & Punchy, Storytelling, Promo Special)' },
                    captionText: { type: Type.STRING, description: 'The complete social media caption post with emojis' },
                    hashtags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['title', 'captionText', 'hashtags'],
                },
              },
            },
            required: ['captions'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      res.json({
        success: true,
        data: parsed,
      });
    } catch (error: any) {
      console.error('Error generating social caption:', error);
      res.status(500).json({
        error: error.message || 'Failed to generate social media caption.',
      });
    }
  });

  // --- VITE MIDDLEWARE / PRODUCTION STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Virtual Food Photographer Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
