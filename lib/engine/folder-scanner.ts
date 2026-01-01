import type { Layer, LayerElement } from './types';
import { getRarityWeight, cleanName } from './core';

export interface FolderStructure {
  name: string;
  files: File[];
}

/**
 * Scans a directory handle and extracts layer structure
 * Uses File System Access API
 */
export async function scanLayersFolder(
  directoryHandle: FileSystemDirectoryHandle
): Promise<Layer[]> {
  const layers: Layer[] = [];
  let layerIndex = 0;

  // Iterate through directory entries
  for await (const [name, handle] of directoryHandle.entries()) {
    if (handle.kind === 'directory') {
      const layerFiles: File[] = [];
      
      // Read files from the directory
      for await (const [fileName, fileHandle] of handle.entries()) {
        if (fileHandle.kind === 'file') {
          const file = await fileHandle.getFile();
          // Only include image files
          if (file.type.startsWith('image/')) {
            layerFiles.push(file);
          }
        }
      }

      if (layerFiles.length > 0) {
        // Sort files by name for consistency
        layerFiles.sort((a, b) => a.name.localeCompare(b.name));

        const elements: LayerElement[] = layerFiles.map((file, index) => ({
          id: index,
          name: cleanName(file.name),
          filename: file.name,
          file,
          weight: getRarityWeight(file.name),
        }));

        layers.push({
          id: layerIndex,
          name: name,
          displayName: name,
          elements,
          blend: 'source-over',
          opacity: 1,
          bypassDNA: false,
        });

        layerIndex++;
      }
    }
  }

  return layers;
}

/**
 * Opens a directory picker and scans for layers
 */
export async function openLayersFolder(): Promise<Layer[] | null> {
  try {
    // Check if File System Access API is supported
    if (!('showDirectoryPicker' in window)) {
      throw new Error(
        'File System Access API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.'
      );
    }

    const directoryHandle = await (window as any).showDirectoryPicker({
      mode: 'read',
    });

    return await scanLayersFolder(directoryHandle);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        // User cancelled the picker
        return null;
      }
      throw error;
    }
    throw new Error('Failed to open folder');
  }
}

/**
 * Processes a FileList from a directory input (fallback for browsers without File System Access API)
 */
export async function processLayersFromFiles(files: FileList): Promise<Layer[]> {
  const layerMap = new Map<string, File[]>();

  // Group files by their directory path (from webkitRelativePath)
  Array.from(files).forEach((file) => {
    if (!file.type.startsWith('image/')) return;

    // Extract folder name from webkitRelativePath
    // Format: "layers/FolderName/filename.png"
    const pathParts = (file as any).webkitRelativePath?.split('/') || [];
    if (pathParts.length >= 2) {
      const folderName = pathParts[pathParts.length - 2];
      if (!layerMap.has(folderName)) {
        layerMap.set(folderName, []);
      }
      layerMap.get(folderName)!.push(file);
    }
  });

  const layers: Layer[] = [];
  let layerIndex = 0;

  // Sort folders for consistent ordering
  const sortedFolders = Array.from(layerMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  sortedFolders.forEach(([folderName, files]) => {
    // Sort files by name
    files.sort((a, b) => a.name.localeCompare(b.name));

    const elements: LayerElement[] = files.map((file, index) => ({
      id: index,
      name: cleanName(file.name),
      filename: file.name,
      file,
      weight: getRarityWeight(file.name),
    }));

    layers.push({
      id: layerIndex,
      name: folderName,
      displayName: folderName,
      elements,
      blend: 'source-over',
      opacity: 1,
      bypassDNA: false,
    });

    layerIndex++;
  });

  return layers;
}

