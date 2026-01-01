'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GenerationConfig } from '@/lib/engine/types';

interface SettingsProps {
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
  hasBackgroundLayer?: boolean;
}

export function Settings({ config, onConfigChange, hasBackgroundLayer = false }: SettingsProps) {
  const updateConfig = (updates: Partial<GenerationConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name-prefix">Collection Name Prefix</Label>
          <Input
            id="name-prefix"
            value={config.namePrefix}
            onChange={(e) => updateConfig({ namePrefix: e.target.value })}
            placeholder="e.g., My NFT Collection"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            className="flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ring-offset-white dark:ring-offset-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={config.description}
            onChange={(e) => updateConfig({ description: e.target.value })}
            placeholder="Describe your NFT collection..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edition-size">Edition Size</Label>
            <Input
              id="edition-size"
              type="number"
              min="1"
              value={config.editionSize}
              onChange={(e) => updateConfig({ editionSize: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <Label htmlFor="width">Width (px)</Label>
            <Input
              id="width"
              type="number"
              min="1"
              value={config.width}
              onChange={(e) => updateConfig({ width: parseInt(e.target.value) || 512 })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            min="1"
            value={config.height}
            onChange={(e) => updateConfig({ height: parseInt(e.target.value) || 512 })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="generate-background"
              checked={config.background?.generate || false}
              onChange={(e) => updateConfig({
                background: {
                  ...config.background,
                  generate: e.target.checked,
                  brightness: config.background?.brightness || '80%',
                  static: config.background?.static || false,
                  default: config.background?.default || '#000000',
                },
              })}
              disabled={hasBackgroundLayer}
              className="h-4 w-4"
            />
            <Label htmlFor="generate-background" className={`font-normal ${hasBackgroundLayer ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              Generate Background
            </Label>
          </div>
          {hasBackgroundLayer && (
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
              Background generation is disabled because you have a Background layer. Use your layer images instead.
            </p>
          )}

          {config.background?.generate && (
            <div className="ml-6 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="static-background"
                  checked={config.background.static || false}
                  onChange={(e) => updateConfig({
                    background: {
                      ...config.background!,
                      static: e.target.checked,
                    },
                  })}
                  className="h-4 w-4"
                />
                <Label htmlFor="static-background" className="font-normal cursor-pointer">
                  Use Static Color
                </Label>
              </div>

              {config.background.static ? (
                <div>
                  <Label htmlFor="background-color">Background Color</Label>
                  <Input
                    id="background-color"
                    type="color"
                    value={config.background.default || '#000000'}
                    onChange={(e) => updateConfig({
                      background: {
                        ...config.background!,
                        default: e.target.value,
                      },
                    })}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="background-brightness">Brightness</Label>
                  <Input
                    id="background-brightness"
                    value={config.background.brightness || '80%'}
                    onChange={(e) => updateConfig({
                      background: {
                        ...config.background!,
                        brightness: e.target.value,
                      },
                    })}
                    placeholder="80%"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

