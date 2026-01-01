import type { Layer, LayerElement, DNA } from './types';

const DNA_DELIMITER = '-';
const RARITY_DELIMITER = '#';

export function getRarityWeight(filename: string): number {
  const nameWithoutExtension = filename.slice(0, -4);
  const weightStr = nameWithoutExtension.split(RARITY_DELIMITER).pop();
  const weight = Number(weightStr);
  return isNaN(weight) ? 1 : weight;
}

export function cleanName(filename: string): string {
  const nameWithoutExtension = filename.slice(0, -4);
  return nameWithoutExtension.split(RARITY_DELIMITER).shift() || nameWithoutExtension;
}

export function cleanDna(dnaItem: string): number {
  const withoutOptions = removeQueryStrings(dnaItem);
  return Number(withoutOptions.split(':').shift()) || 0;
}

export function removeQueryStrings(dna: string): string {
  const query = /(\?.*$)/;
  return dna.replace(query, '');
}

export function filterDNAOptions(dna: string): string {
  const dnaItems = dna.split(DNA_DELIMITER);
  const filteredDNA = dnaItems.filter((element) => {
    const query = /(\?.*$)/;
    const querystring = query.exec(element);
    if (!querystring) {
      return true;
    }
    const options = querystring[1].split('&').reduce((r, setting) => {
      const keyPairs = setting.split('=');
      return { ...r, [keyPairs[0]]: keyPairs[1] };
    }, {} as Record<string, string>);

    return options.bypassDNA === 'true';
  });

  return filteredDNA.join(DNA_DELIMITER);
}

export function isDnaUnique(dnaList: Set<string>, dna: string): boolean {
  const filteredDNA = filterDNAOptions(dna);
  return !dnaList.has(filteredDNA);
}

export function createDna(layers: Layer[]): string {
  const randNum: string[] = [];
  
  layers.forEach((layer) => {
    let totalWeight = 0;
    layer.elements.forEach((element) => {
      totalWeight += element.weight;
    });

    let random = Math.floor(Math.random() * totalWeight);
    
    for (let i = 0; i < layer.elements.length; i++) {
      random -= layer.elements[i].weight;
      if (random < 0) {
        randNum.push(
          `${layer.elements[i].id}:${layer.elements[i].filename}${
            layer.bypassDNA ? '?bypassDNA=true' : ''
          }`
        );
        break;
      }
    }
  });
  
  return randNum.join(DNA_DELIMITER);
}

export function constructLayerToDna(dna: string, layers: Layer[]) {
  const dnaItems = dna.split(DNA_DELIMITER);
  return layers.map((layer, index) => {
    const dnaItem = dnaItems[index] || '';
    const elementId = cleanDna(dnaItem);
    const selectedElement = layer.elements.find((e) => e.id === elementId);
    
    return {
      name: layer.name,
      displayName: layer.displayName,
      blend: layer.blend,
      opacity: layer.opacity,
      selectedElement: selectedElement || layer.elements[0],
    };
  });
}

export async function hashDna(dna: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(dna);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

