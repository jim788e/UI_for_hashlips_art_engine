'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Play, Square, Loader2 } from 'lucide-react';
import type { Layer, GenerationConfig, GeneratedArtwork, GenerationProgress } from '@/lib/engine/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface GenerationControlsProps {
  layers: Layer[];
  config: GenerationConfig;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  artworks: GeneratedArtwork[];
  onStart: () => void;
  onStop: () => void;
}

export function GenerationControls({
  layers,
  config,
  isGenerating,
  progress,
  artworks,
  onStart,
  onStop,
}: GenerationControlsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleStart = useCallback(() => {
    onStart();
  }, [onStart]);

  const handleStop = useCallback(() => {
    onStop();
  }, [onStop]);

  const handleDownload = useCallback(async () => {
    if (artworks.length === 0) {
      alert('No artworks generated yet.');
      return;
    }

    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const imagesFolder = zip.folder('images');
      const jsonFolder = zip.folder('json');

      if (!imagesFolder || !jsonFolder) {
        throw new Error('Failed to create folders in ZIP');
      }

      for (const artwork of artworks) {
        imagesFolder.file(`${artwork.edition}.png`, artwork.image);
        jsonFolder.file(
          `${artwork.edition}.json`,
          JSON.stringify(artwork.metadata, null, 2)
        );
      }

      const metadataArray = artworks.map(a => a.metadata);
      jsonFolder.file('_metadata.json', JSON.stringify(metadataArray, null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${config.namePrefix.replace(/\s+/g, '_')}_collection.zip`);

      setIsDownloading(false);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to create ZIP file. Check console for details.');
      setIsDownloading(false);
    }
  }, [artworks, config]);

  const canGenerate = layers.length > 0 && layers.every(l => l.elements.length > 0);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {isGenerating && progress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-900 dark:text-gray-100">
                  <span>Generating...</span>
                  <span>{progress.current} / {progress.total} ({progress.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}
            {!isGenerating && artworks.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {artworks.length} artwork{artworks.length !== 1 ? 's' : ''} generated
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {!isGenerating ? (
              <Button
                onClick={handleStart}
                disabled={!canGenerate}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Generate
              </Button>
            ) : (
              <Button
                onClick={handleStop}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}

            {artworks.length > 0 && (
              <Button
                onClick={handleDownload}
                disabled={isDownloading || isGenerating}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

