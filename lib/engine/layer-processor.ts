import type { Layer, LayerElement, LayerConfig } from './types';
import { getRarityWeight, cleanName } from './core';

export async function processLayerFolder(
  files: File[],
  layerConfig: LayerConfig,
  layerId: number
): Promise<Layer> {
  const elements: LayerElement[] = [];
  
  files.forEach((file, index) => {
    if (!file.type.startsWith('image/')) return;
    
    const weight = getRarityWeight(file.name);
    const name = cleanName(file.name);
    
    elements.push({
      id: index,
      name,
      filename: file.name,
      file,
      weight,
    });
  });

  return {
    id: layerId,
    name: layerConfig.name,
    displayName: layerConfig.options?.displayName || layerConfig.name,
    elements,
    blend: layerConfig.options?.blend || 'source-over',
    opacity: layerConfig.options?.opacity ?? 1,
    bypassDNA: layerConfig.options?.bypassDNA || false,
  };
}

export function validateLayerFiles(files: FileList | null): File[] {
  if (!files) return [];
  
  const fileArray = Array.from(files);
  return fileArray.filter(file => file.type.startsWith('image/'));
}

