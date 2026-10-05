export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_INPUT_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

export interface ProcessedImage {
  file: File;
  previewUrl: string;
  originalName: string;
  originalSize: number;
  width: number;
  height: number;
}

export interface ImageProcessorOptions {
  quality?: number;
  maxSize?: number;
}

/**
 * Validates and converts an image to WebP format using Canvas API.
 * @param file The original image file
 * @param options Processing options like quality and maxSize
 * @returns A promise resolving to the processed image data
 */
export const processImageToWebP = (
  file: File, 
  options: ImageProcessorOptions = {}
): Promise<ProcessedImage> => {
  const quality = options.quality ?? 0.85;
  const maxSize = options.maxSize ?? MAX_FILE_SIZE;

  return new Promise((resolve, reject) => {
    // 1. Validate File Type
    if (!SUPPORTED_INPUT_FORMATS.includes(file.type)) {
      return reject(new Error(`Unsupported file format: ${file.type}. Please upload JPG, PNG, GIF, BMP, or WEBP.`));
    }

    // 2. Validate File Size
    if (file.size > maxSize) {
      return reject(new Error(`File size exceeds limit: ${(file.size / 1024 / 1024).toFixed(2)}MB`));
    }

    // Read the file as data URL to load into an Image object
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // 3. Validate Dimensions (example constraints, can be customized)
        if (img.width === 0 || img.height === 0) {
          return reject(new Error('Invalid image dimensions.'));
        }

        // 4. Convert to WebP via Canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const fallbackResolve = () => {
          resolve({
            file,
            previewUrl: URL.createObjectURL(file),
            originalName: file.name,
            originalSize: file.size,
            width: img.width,
            height: img.height,
          });
        };

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return fallbackResolve();
        }

        // Draw image onto canvas
        try {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to WebP Blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return fallbackResolve();
              }

            // Generate filename: original-name.webp or fallback to uuid
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const safeName = originalNameWithoutExt.replace(/[^a-zA-Z0-9-_\.]/g, '_');
            const newFilename = `${safeName || crypto.randomUUID()}.webp`;

            // Create new File object
            const webpFile = new File([blob], newFilename, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            const previewUrl = URL.createObjectURL(webpFile);

            resolve({
              file: webpFile,
              previewUrl,
              originalName: file.name,
              originalSize: file.size,
              width: img.width,
              height: img.height,
            });
          },
          'image/webp',
          quality
        );
        } catch (err) {
          return fallbackResolve();
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image. The file may be corrupted.'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Processes an array of files, optimizing images to WebP and leaving other files untouched.
 * Uses processImageToWebP internally.
 * @param files Array of files to process
 * @param options Processing options
 * @returns Array of processed files
 */
export const processFilesForUpload = async (
  files: File[],
  options: ImageProcessorOptions = {}
): Promise<File[]> => {
  const processedFiles: File[] = [];
  
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      try {
        const result = await processImageToWebP(file, options);
        processedFiles.push(result.file);
      } catch (err) {
        // If validation fails (e.g., size too large, unsupported type, corrupted image),
        // we can choose to either omit the file or throw.
        // For simplicity, we throw to let the caller handle it (e.g., show an alert).
        throw err;
      }
    } else {
      // Non-image files are untouched
      processedFiles.push(file);
    }
  }
  
  return processedFiles;
};
