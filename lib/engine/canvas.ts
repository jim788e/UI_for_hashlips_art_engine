import type { Layer, LayerElement } from './types';

export class CanvasGenerator {
  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas = new OffscreenCanvas(width, height);
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2d context');
    }
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawBackground(config?: { generate: boolean; brightness?: string; static?: boolean; default?: string }): void {
    if (!config?.generate) return;

    if (config.static && config.default) {
      this.ctx.fillStyle = config.default;
    } else {
      const hue = Math.floor(Math.random() * 360);
      const brightness = config.brightness || '80%';
      this.ctx.fillStyle = `hsl(${hue}, 100%, ${brightness})`;
    }
    
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  async drawLayer(
    image: ImageBitmap,
    blend: string,
    opacity: number
  ): Promise<void> {
    this.ctx.globalAlpha = opacity;
    this.ctx.globalCompositeOperation = blend as GlobalCompositeOperation;
    this.ctx.drawImage(image, 0, 0, this.width, this.height);
  }

  async getBlob(): Promise<Blob> {
    return await this.canvas.convertToBlob({ type: 'image/png' });
  }

  getImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.width, this.height);
  }
}

export async function loadImageFromFile(file: File): Promise<ImageBitmap> {
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer]);
  const imageBitmap = await createImageBitmap(blob);
  return imageBitmap;
}

