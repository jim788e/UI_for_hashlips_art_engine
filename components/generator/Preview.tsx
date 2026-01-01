'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Layer } from '@/lib/engine/types';
import { loadImageFromFile } from '@/lib/engine/canvas';
import { createDna, constructLayerToDna } from '@/lib/engine/core';

interface PreviewProps {
  layers: Layer[];
  width: number;
  height: number;
  background?: {
    generate: boolean;
    brightness?: string;
    static?: boolean;
    default?: string;
  };
}

export function Preview({ layers, width, height, background }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewDna, setPreviewDna] = useState<string>('');

  useEffect(() => {
    if (!canvasRef.current || layers.length === 0 || layers.some(l => l.elements.length === 0)) {
      return;
    }

    const generatePreview = async () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = false;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background
      if (background?.generate) {
        if (background.static && background.default) {
          ctx.fillStyle = background.default;
        } else {
          const hue = Math.floor(Math.random() * 360);
          const brightness = background.brightness || '80%';
          ctx.fillStyle = `hsl(${hue}, 100%, ${brightness})`;
        }
        ctx.fillRect(0, 0, width, height);
      }

      const dna = createDna(layers);
      setPreviewDna(dna);
      const layerResults = constructLayerToDna(dna, layers);

      const imageBitmaps: ImageBitmap[] = [];

      for (const layerResult of layerResults) {
        if (!layerResult.selectedElement) continue;
        
        const imageBitmap = await loadImageFromFile(layerResult.selectedElement.file);
        imageBitmaps.push(imageBitmap);
        
        ctx.globalAlpha = layerResult.opacity;
        ctx.globalCompositeOperation = layerResult.blend as GlobalCompositeOperation;
        ctx.drawImage(imageBitmap, 0, 0, width, height);
      }

      imageBitmaps.forEach((bitmap) => bitmap.close());
    };

    generatePreview();
  }, [layers, width, height, background]);

  if (layers.length === 0 || layers.some(l => l.elements.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-500 dark:text-gray-400">
            <p>Add layers and upload images to see preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-md"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          {previewDna && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
              DNA: {previewDna.substring(0, 50)}...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

