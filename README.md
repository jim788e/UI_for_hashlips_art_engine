# HashLips Art Engine v2.0

A modern, browser-based NFT art generation tool built with Next.js 16, TypeScript, and React 19. Generate unique NFT art collections with layer-based composition directly in your browser.

**This is a modernized, standalone version** - completely rewritten for the browser with a modern web interface.

## Features

- 🎨 **Browser-Based Generation** - No server required, runs entirely in the browser
- 🖼️ **Layer Management** - Drag & drop layer folders, reorder layers, configure blend modes and opacity
- 🎲 **Rarity System** - Weight-based rarity system using filename patterns (e.g., `Element#70.png`)
- 🔄 **Real-Time Preview** - See a preview of your generated artwork before full generation
- 📦 **ZIP Export** - Download your complete collection as a ZIP file with images and metadata
- ⚡ **Async Generation** - Non-blocking generation with progress tracking
- 🎯 **TypeScript** - Fully typed for better developer experience
- 🎨 **Modern UI** - Clean, responsive interface built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20.9+ and npm/yarn/pnpm
- TypeScript 5.1+

### Installation

1. Clone this repository:
```bash
git clone https://github.com/jim788e/UI_for_hashlips_art_engine.git
cd UI_for_hashlips_art_engine
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Add Layers

- Click "Add Layer" to create a new layer
- Enter a layer name (e.g., "Background", "Eyes", "Hat")
- Optionally set a display name for metadata
- Upload images for the layer using the file input

### 2. Configure Rarity

Set rarity weights in filenames using the `#` delimiter:
- `Common#50.png` - 50% weight (common)
- `Rare#20.png` - 20% weight (rare)
- `Legendary#1.png` - 1% weight (legendary)

The weight determines how likely an element is to be selected during generation.

### 3. Configure Settings

- **Collection Name**: Prefix for your NFT names (e.g., "My NFT Collection")
- **Description**: Description for your NFT metadata
- **Edition Size**: Number of unique artworks to generate
- **Dimensions**: Width and height in pixels (default: 512x512)
- **Background**: Configure background generation (static color or random HSL)

### 4. Generate

- Click "Generate" to start creating your collection
- Watch the progress bar as artworks are generated
- Each artwork is guaranteed to have unique DNA (combination of traits)

### 5. Download

- Once generation is complete, click "Download" to get a ZIP file containing:
  - `images/` - All generated PNG images
  - `json/` - Individual metadata files and `_metadata.json`

## Layer Options

Each layer supports the following options:

- **Blend Mode**: Canvas blend mode (normal, multiply, screen, overlay, etc.)
- **Opacity**: Layer opacity (0-1)
- **Bypass DNA**: Exclude this layer from uniqueness checking (useful for backgrounds)

## Technical Details

### Architecture

- **Frontend**: Next.js 16 with App Router
- **Language**: TypeScript 5.3+
- **React**: React 19
- **Styling**: Tailwind CSS
- **Canvas**: HTML5 Canvas API with OffscreenCanvas for performance
- **Generation**: Async generator pattern for non-blocking generation
- **Bundler**: Webpack (configurable, Turbopack available)

### File Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/
│   ├── generator/         # Generator components
│   │   ├── LayerManager.tsx
│   │   ├── Settings.tsx
│   │   ├── Preview.tsx
│   │   └── GenerationControls.tsx
│   └── ui/                # Reusable UI components
├── lib/
│   ├── engine/            # Core generation logic
│   │   ├── types.ts       # TypeScript types
│   │   ├── core.ts        # DNA generation logic
│   │   ├── canvas.ts      # Canvas operations
│   │   ├── generator.ts   # Main generator
│   │   └── layer-processor.ts
│   └── utils.ts           # Utility functions
└── layers/                # Example layer folders (keep your layers here)
```

## Migration from v1.x (Original HashLips)

This is a complete rewrite of the original HashLips Art Engine. Key differences:

- **Browser-based**: No Node.js required, runs entirely in the browser
- **Web UI**: Full graphical interface instead of CLI
- **TypeScript**: Fully typed codebase
- **Modern Stack**: Next.js 16, React 19, Tailwind CSS
- **No Server**: Everything runs client-side

Your existing layer folders from v1.x can still be used - just upload them through the web interface.

## What's New in v2.0

- ✅ **Next.js 16** - Latest version with improved performance
- ✅ **React 19** - Latest React with improved features
- ✅ **ESLint 9** - Modern linting with flat config support
- ✅ **TypeScript 5.3+** - Enhanced type safety
- ✅ **Fixed TypeScript errors** - All type definitions updated
- ✅ **Improved build system** - Webpack configuration optimized

## License

MIT License - see LICENSE file for details

## Credits

**Original Concept:**
- HashLips Art Engine v1.x by Daniel Eugene Botha (HashLips)

**Modernized Version (v2.0):**
- Developed by [@jim788e](https://github.com/jim788e)
- [X (Twitter)](https://x.com/d_misios)
- Complete rewrite with Next.js 16, React 19, and TypeScript
- Browser-based architecture - no Node.js required
- Upgraded to Next.js 16 with all latest dependencies

## Support

- [📺 YouTube](https://www.youtube.com/channel/UC1LV4_VQGBJHTJjEWUmy8nA)
- [👄 Discord](https://discord.com/invite/qh6MWhMJDN)
- [💬 Telegram](https://t.me/hashlipsnft)
- [🐦 Twitter](https://twitter.com/hashlipsnft)
