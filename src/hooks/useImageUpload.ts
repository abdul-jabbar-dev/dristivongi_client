import { useState } from 'react';
import { processImageToWebP, ImageProcessorOptions } from '@/lib/image-processor';

export type UploadState = 'idle' | 'selecting' | 'processing' | 'uploading' | 'success' | 'error';

export interface FileWithState {
  originalFile: File;
  processedFile?: File;
  previewUrl?: string;
  state: UploadState;
  error?: string;
  id: string;
}

export function useImageUpload(options?: ImageProcessorOptions) {
  const [files, setFiles] = useState<FileWithState[]>([]);

  const addFiles = async (newFiles: File[]) => {
    const fileEntries: FileWithState[] = newFiles.map((file) => ({
      originalFile: file,
      state: file.type.startsWith('image/') ? 'processing' : 'idle',
      previewUrl: URL.createObjectURL(file),
      id: crypto.randomUUID(),
    }));

    setFiles((prev) => [...prev, ...fileEntries]);

    // Process each file
    for (const entry of fileEntries) {
      if (entry.originalFile.type.startsWith('image/')) {
        try {
          const processed = await processImageToWebP(entry.originalFile, options);
          
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? {
                    ...f,
                    state: 'idle', // Ready for upload
                    processedFile: processed.file,
                    previewUrl: processed.previewUrl,
                  }
                : f
            )
          );
        } catch (error: any) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? { ...f, state: 'error', error: error.message }
                : f
            )
          );
        }
      } else {
        // Non-image files (videos, pdfs, etc.) don't get processed to WebP
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  state: 'idle',
                  processedFile: entry.originalFile,
                }
              : f
          )
        );
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const setFileState = (id: string, state: UploadState, error?: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, state, error } : f))
    );
  };

  const setAllFilesState = (state: UploadState) => {
    setFiles((prev) => prev.map((f) => ({ ...f, state })));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const validFiles = files.filter(f => f.state !== 'error' && f.state !== 'processing');

  return {
    files,
    validFiles,
    addFiles,
    removeFile,
    setFileState,
    setAllFilesState,
    clearFiles,
  };
}
