export interface LayerElement {
  id: number;
  name: string;
  filename: string;
  file: File;
  weight: number;
}

export interface Layer {
  id: number;
  name: string;
  displayName: string;
  elements: LayerElement[];
  blend: string;
  opacity: number;
  bypassDNA: boolean;
}

export interface LayerConfig {
  name: string;
  options?: {
    displayName?: string;
    blend?: string;
    opacity?: number;
    bypassDNA?: boolean;
  };
}

export interface GenerationConfig {
  namePrefix: string;
  description: string;
  editionSize: number;
  width: number;
  height: number;
  layersOrder: LayerConfig[];
  background?: {
    generate: boolean;
    brightness?: string;
    static?: boolean;
    default?: string;
  };
}

export interface DNA {
  raw: string;
  hash: string;
}

export interface GeneratedArtwork {
  edition: number;
  dna: DNA;
  image: Blob;
  metadata: {
    name: string;
    description: string;
    image: string;
    dna: string;
    edition: number;
    date: number;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
    compiler: string;
  };
}

export interface GenerationProgress {
  current: number;
  total: number;
  percentage: number;
  currentDna?: string;
}

