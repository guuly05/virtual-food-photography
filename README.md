# Aperture Food Studio 📸  
### *Virtual Food Photographer for Restaurant Owners & Culinary Brands*

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.1_Flash_Image-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 🌟 Overview

**Aperture Food Studio** transforms text-based restaurant menus into hyper-realistic, studio-grade food photography using server-side **Google Gemini AI**. Restaurant owners and chefs can paste plain text, choose sample menus, or upload menu photos to instantly generate mouth-watering commercial imagery for delivery apps, print menus, and social media marketing.

---

## ✨ Key Features

### 📜 1. AI Menu Parsing Engine
- Upload raw text or image-based menus.
- Gemini 3.6 Flash extracts dish titles, rich descriptions, prices, categories, dietary tags, and optimal food photography prompts automatically.

### 🎨 2. Aesthetic Style Presets
- **Rustic / Dark:** Deep side lighting, dark slate/oak wood textures, moody artisan bistro vibe.
- **Bright / Modern:** Clean high-key daylight studio lighting, white Carrara marble, vibrant natural colors.
- **Social Media (Top-Down):** 90° flat-lay overhead view with curated table linens, garnishes, and cutlery.
- **Midnight Lounge:** Dramatic amber spotlighting, dark velvet plating, luxury fine dining atmosphere.
- **Outdoor Sunlit:** Alfresco golden hour sunlight with dappled leaf shadows.

### 📐 3. Flexible Output Resolutions & Aspect Ratios
- **1K, 2K, and 4K Ultra HD** studio output options via `gemini-3.1-flash-image`.
- Supports **1:1 Square**, **4:3 Classic Menu**, **16:9 Wide Banner**, and **3:4 Mobile Portrait**.

### 🪄 4. AI Lightbox & Retouching Suite
- 1-click retouch presets (rising steam, wine pairings, microgreen garnishes, glossy sauces).
- Natural language image-to-image editing powered by Gemini vision models.
- Full revision history and high-res PNG downloads for every dish.

### 📱 5. Social Media Graphic & Caption Generator
- Interactive post canvas for Instagram Posts (1:1 / 4:5), TikTok/Reels (9:16), and Web Banners (16:9).
- Custom sticker badges (`CHEF'S SPECIAL`, `MUST TRY`, `NEW MENU ITEM`).
- Scale, crop, and vertical pan adjustments.
- **AI Social Caption Writer:** Generates 3 catchy social media captions with hashtags and call-to-action hooks.

### 🍽️ 6. Digital Visual Menu Export
- Formatted digital menu board grouped by categories.
- Dark Luxury and Pristine Light display themes.
- One-click PDF print and share options.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, HTML5 Canvas API
- **Backend:** Node.js, Express.js
- **AI SDK:** `@google/genai` (Server-side proxy pattern keeping keys secure)
- **AI Models:**
  - `gemini-3.6-flash`: Menu OCR & extraction, AI social captions
  - `gemini-3.1-flash-image`: Text-to-Image & Image-to-Image high-res food photography

---

## 🚀 Getting Started

### Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### Installation & Development

```bash
# Install dependencies
npm install

# Start local dev server (Express + Vite)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🛡️ Architecture & Security

- **Server-Side API Proxy:** All Gemini API key requests are handled strictly on the Express backend (`/api/*`), ensuring secret keys are never exposed to browser clients.
- **Container Host Ready:** Binds to `0.0.0.0:3000` with automated esbuild CommonJS bundling for Cloud Run and containerized environments.
