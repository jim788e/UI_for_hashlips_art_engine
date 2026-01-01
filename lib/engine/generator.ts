import type { GenerationConfig, GeneratedArtwork, GenerationProgress, Layer } from './types';
import { CanvasGenerator, loadImageFromFile } from './canvas';
import { createDna, isDnaUnique, constructLayerToDna, filterDNAOptions, hashDna } from './core';

let isStopped = false;
let dnaList = new Set<string>();

export function resetGenerator() {
  isStopped = false;
  dnaList.clear();
}

export function stopGenerator() {
  isStopped = true;
}

export async function* generateCollection(
  config: GenerationConfig,
  layers: Layer[],
  onProgress?: (progress: GenerationProgress, artwork?: GeneratedArtwork) => void
): AsyncGenerator<GeneratedArtwork, void, unknown> {
  resetGenerator();
  const uniqueDnaTorrance = 10000;
  let failedCount = 0;
  let editionCount = 1;

  const generator = new CanvasGenerator(config.width, config.height);

  while (editionCount <= config.editionSize) {
    if (isStopped) {
      return;
    }

    let newDna = createDna(layers);
    let attempts = 0;

    while (!isDnaUnique(dnaList, newDna) && attempts < uniqueDnaTorrance) {
      newDna = createDna(layers);
      attempts++;
      failedCount++;
    }

    if (attempts >= uniqueDnaTorrance) {
      throw new Error(
        `Failed to generate unique DNA after ${uniqueDnaTorrance} attempts. You need more layers or elements.`
      );
    }

    try {
      const artwork = await generateArtwork(generator, newDna, layers, config, editionCount);
      dnaList.add(filterDNAOptions(newDna));

      const progress: GenerationProgress = {
        current: editionCount,
        total: config.editionSize,
        percentage: Math.round((editionCount / config.editionSize) * 100),
        currentDna: await hashDna(newDna),
      };

      if (onProgress) {
        onProgress(progress, artwork);
      }

      yield artwork;
      editionCount++;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }
}

async function generateArtwork(
  generator: CanvasGenerator,
  dna: string,
  layers: Layer[],
  config: GenerationConfig,
  edition: number
): Promise<GeneratedArtwork> {
  generator.clear();

  if (config.background?.generate) {
    generator.drawBackground(config.background);
  }

  const layerResults = constructLayerToDna(dna, layers);
  const imageBitmaps: ImageBitmap[] = [];

  for (const layerResult of layerResults) {
    if (!layerResult.selectedElement) continue;
    
    const imageBitmap = await loadImageFromFile(layerResult.selectedElement.file);
    imageBitmaps.push(imageBitmap);
    await generator.drawLayer(imageBitmap, layerResult.blend, layerResult.opacity);
  }

  const imageBlob = await generator.getBlob();
  const dnaHash = await hashDna(dna);

  const attributes = layerResults.map((lr) => ({
    trait_type: lr.displayName,
    value: lr.selectedElement?.name || '',
  }));

  const metadata = {
    name: `${config.namePrefix} #${edition}`,
    description: config.description,
    image: `${edition}.png`,
    dna: dnaHash,
    edition,
    date: Date.now(),
    attributes,
    compiler: 'HashLips Art Engine v2.0',
  };

  imageBitmaps.forEach((bitmap) => bitmap.close());

  return {
    edition,
    dna: {
      raw: dna,
      hash: dnaHash,
    },
    image: imageBlob,
    metadata,
  };
}

