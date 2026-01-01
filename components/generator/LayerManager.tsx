'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GripVertical, X, Upload, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { Layer, LayerConfig } from '@/lib/engine/types';
import { processLayerFolder, validateLayerFiles } from '@/lib/engine/layer-processor';
import { openLayersFolder, processLayersFromFiles } from '@/lib/engine/folder-scanner';
import { TraitEditor } from '@/components/generator/TraitEditor';

interface LayerManagerProps {
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
}

const BLEND_MODES = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
];

export function LayerManager({ layers, onLayersChange }: LayerManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [expandedLayers, setExpandedLayers] = useState<Set<number>>(new Set());

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = validateLayerFiles(e.target.files);
    if (files.length === 0) return;

    const layer = layers[index];
    const layerConfig: LayerConfig = {
      name: layer.name,
      options: {
        displayName: layer.displayName,
        blend: layer.blend,
        opacity: layer.opacity,
        bypassDNA: layer.bypassDNA,
      },
    };

    const processedLayer = await processLayerFolder(files, layerConfig, index);
    const newLayers = [...layers];
    newLayers[index] = processedLayer;
    onLayersChange(newLayers);
  }, [layers, onLayersChange]);

  const handleAddLayer = useCallback(() => {
    const newLayer: Layer = {
      id: layers.length,
      name: `Layer ${layers.length + 1}`,
      displayName: `Layer ${layers.length + 1}`,
      elements: [],
      blend: 'source-over',
      opacity: 1,
      bypassDNA: false,
    };
    onLayersChange([...layers, newLayer]);
  }, [layers, onLayersChange]);

  const handleScanFolder = useCallback(async () => {
    setIsScanning(true);
    try {
      const scannedLayers = await openLayersFolder();
      if (scannedLayers && scannedLayers.length > 0) {
        onLayersChange(scannedLayers);
        alert(`Successfully loaded ${scannedLayers.length} layer(s) with ${scannedLayers.reduce((sum, layer) => sum + layer.elements.length, 0)} total images.`);
      }
    } catch (error) {
      console.error('Error scanning folder:', error);
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          alert('File System Access API is not supported. Please use the file input below to upload your layers folder.');
        } else {
          alert(`Error: ${error.message}`);
        }
      } else {
        alert('Failed to scan folder. Please try again.');
      }
    } finally {
      setIsScanning(false);
    }
  }, [onLayersChange]);

  const handleFolderUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    try {
      const scannedLayers = await processLayersFromFiles(files);
      if (scannedLayers.length > 0) {
        onLayersChange(scannedLayers);
        alert(`Successfully loaded ${scannedLayers.length} layer(s) with ${scannedLayers.reduce((sum, layer) => sum + layer.elements.length, 0)} total images.`);
      } else {
        alert('No valid image files found in the selected folder. Make sure you selected a folder with image files.');
      }
    } catch (error) {
      console.error('Error processing folder:', error);
      alert('Failed to process folder. Please make sure you selected a folder with image files.');
    } finally {
      setIsScanning(false);
      // Reset input
      e.target.value = '';
    }
  }, [onLayersChange]);

  const handleRemoveLayer = useCallback((index: number) => {
    const newLayers = layers.filter((_, i) => i !== index).map((layer, i) => ({
      ...layer,
      id: i,
    }));
    onLayersChange(newLayers);
  }, [layers, onLayersChange]);

  const handleMoveLayer = useCallback((fromIndex: number, toIndex: number) => {
    const newLayers = [...layers];
    const [moved] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, moved);
    const reindexed = newLayers.map((layer, i) => ({ ...layer, id: i }));
    onLayersChange(reindexed);
  }, [layers, onLayersChange]);

  const handleLayerUpdate = useCallback((index: number, updates: Partial<Layer>) => {
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], ...updates };
    onLayersChange(newLayers);
  }, [layers, onLayersChange]);

  const handleElementsUpdate = useCallback((index: number, elements: typeof layers[0]['elements']) => {
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], elements };
    onLayersChange(newLayers);
  }, [layers, onLayersChange]);

  const toggleLayerExpanded = useCallback((index: number) => {
    setExpandedLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Layer Management</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleScanFolder}
              disabled={isScanning}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              {isScanning ? 'Scanning...' : 'Scan Folder'}
            </Button>
            <Button onClick={handleAddLayer} size="sm">
              Add Layer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
            <strong>Quick Start:</strong> Click &quot;Scan Folder&quot; to automatically load layers from your layers folder, or use the file input below to upload a folder.
          </p>
          <label className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Or upload layers folder (select folder with webkitdirectory):</span>
            <input
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleFolderUpload}
              className="hidden"
              id="folder-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('folder-upload')?.click()}
              disabled={isScanning}
            >
              Choose Folder
            </Button>
          </label>
        </div>
        {layers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No layers added yet. Click &quot;Add Layer&quot; to get started.</p>
          </div>
        ) : (
          layers.map((layer, index) => (
            <div key={layer.id} className="space-y-4">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <button
                      className="mt-2 cursor-move text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      draggable
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedIndex !== index) {
                          handleMoveLayer(draggedIndex, index);
                          setDraggedIndex(index);
                        }
                      }}
                      onDragEnd={() => setDraggedIndex(null)}
                    >
                      <GripVertical className="h-5 w-5" />
                    </button>

                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`layer-name-${index}`}>Layer Name</Label>
                          <Input
                            id={`layer-name-${index}`}
                            value={layer.name}
                            onChange={(e) => handleLayerUpdate(index, { name: e.target.value })}
                            placeholder="e.g., Background"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`display-name-${index}`}>Display Name</Label>
                          <Input
                            id={`display-name-${index}`}
                            value={layer.displayName}
                            onChange={(e) => handleLayerUpdate(index, { displayName: e.target.value })}
                            placeholder="e.g., Awesome Background"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`blend-${index}`}>Blend Mode</Label>
                          <select
                            id={`blend-${index}`}
                            className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                            value={layer.blend}
                            onChange={(e) => handleLayerUpdate(index, { blend: e.target.value })}
                          >
                            {BLEND_MODES.map((mode) => (
                              <option key={mode.value} value={mode.value}>
                                {mode.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`opacity-${index}`}>Opacity (0-1)</Label>
                          <Input
                            id={`opacity-${index}`}
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={layer.opacity}
                            onChange={(e) => handleLayerUpdate(index, { opacity: parseFloat(e.target.value) || 1 })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`files-${index}`} className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Upload Images
                        </Label>
                        <Input
                          id={`files-${index}`}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, index)}
                          className="mt-1"
                        />
                        {layer.elements.length > 0 && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {layer.elements.length} image{layer.elements.length !== 1 ? 's' : ''} loaded
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`bypass-dna-${index}`}
                          checked={layer.bypassDNA}
                          onChange={(e) => handleLayerUpdate(index, { bypassDNA: e.target.checked })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`bypass-dna-${index}`} className="font-normal cursor-pointer">
                          Bypass DNA uniqueness check
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLayerExpanded(index)}
                        className="text-gray-600 dark:text-gray-400"
                        title={expandedLayers.has(index) ? "Hide traits" : "Show traits"}
                      >
                        {expandedLayers.has(index) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLayer(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {expandedLayers.has(index) && (
                <TraitEditor
                  elements={layer.elements}
                  onElementsChange={(elements) => handleElementsUpdate(index, elements)}
                  layerName={layer.name}
                />
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

