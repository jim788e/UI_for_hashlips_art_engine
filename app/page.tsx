'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { LayerManager } from '@/components/generator/LayerManager';
import { Settings } from '@/components/generator/Settings';
import { Preview } from '@/components/generator/Preview';
import { GenerationControls } from '@/components/generator/GenerationControls';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { generateCollection, stopGenerator } from '@/lib/engine/generator';
import type { Layer, GenerationConfig, GeneratedArtwork, GenerationProgress } from '@/lib/engine/types';

const DEFAULT_CONFIG: GenerationConfig = {
  namePrefix: 'My NFT Collection',
  description: 'A unique NFT collection',
  editionSize: 5,
  width: 512,
  height: 512,
  layersOrder: [],
  background: {
    generate: true,
    brightness: '80%',
    static: false,
    default: '#000000',
  },
};

export default function Home() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [config, setConfig] = useState<GenerationConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [artworks, setArtworks] = useState<GeneratedArtwork[]>([]);
  const generatorRef = useRef<AsyncGenerator<GeneratedArtwork, void, unknown> | null>(null);

  const handleLayersChange = useCallback((newLayers: Layer[]) => {
    setLayers(newLayers);

    // Auto-disable background generation if Background/Backgrounds layer exists
    const hasBackgroundLayer = newLayers.some(
      (layer) =>
        layer.name.toLowerCase() === 'background' ||
        layer.name.toLowerCase() === 'backgrounds' ||
        layer.name.toLowerCase().includes('background')
    );

    if (hasBackgroundLayer) {
      setConfig((prev) => ({
        ...prev,
        background: {
          ...prev.background,
          generate: false,
        },
      }));
    }
  }, []);

  const handleStart = useCallback(async () => {
    if (layers.length === 0 || layers.some(l => l.elements.length === 0)) {
      alert('Please add layers and upload images before generating.');
      return;
    }

    setIsGenerating(true);
    setProgress({ current: 0, total: config.editionSize, percentage: 0 });
    setArtworks([]);

    try {
      const generator = generateCollection(
        config,
        layers,
        (prog, artwork) => {
          setProgress(prog);
          if (artwork) {
            setArtworks(prev => [...prev, artwork]);
          }
        }
      );

      generatorRef.current = generator;

      for await (const artwork of generator) {
        // Artwork is already added via onProgress callback
      }

      setIsGenerating(false);
      generatorRef.current = null;
    } catch (error) {
      alert(`Generation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsGenerating(false);
      generatorRef.current = null;
    }
  }, [layers, config]);

  const handleStop = useCallback(() => {
    stopGenerator();
    setIsGenerating(false);
    generatorRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (generatorRef.current) {
        stopGenerator();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                HashLips Art Engine
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Generate unique NFT art collections with layer-based composition
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Modernized by <a href="https://github.com/jim788e" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">@jim788e</a> • 
                <a href="https://x.com/d_misios" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">X</a>
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-6">
            <LayerManager layers={layers} onLayersChange={handleLayersChange} />
            <Settings
              config={config}
              onConfigChange={setConfig}
              hasBackgroundLayer={layers.some(
                (layer) =>
                  layer.name.toLowerCase() === 'background' ||
                  layer.name.toLowerCase() === 'backgrounds' ||
                  layer.name.toLowerCase().includes('background')
              )}
            />
          </div>
          <div className="space-y-6">
            <Preview
              layers={layers}
              width={config.width}
              height={config.height}
              background={config.background}
            />
            <GenerationControls
              layers={layers}
              config={config}
              isGenerating={isGenerating}
              progress={progress}
              artworks={artworks}
              onStart={handleStart}
              onStop={handleStop}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

