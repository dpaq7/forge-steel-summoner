// Image processing utilities for character portraits

/**
 * Compress and convert image file to base64
 * Target: max 500KB, max 800px dimension
 */
export async function processPortraitImage(file: File): Promise<string> {
  // Check file size - warn if over 5MB
  if (file.size > 5 * 1024 * 1024) {
    console.warn('Large image detected, compressing...');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let { width, height } = img;

        // Scale down if needed
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG, quality 0.8
        const base64 = canvas.toDataURL('image/jpeg', 0.8);

        // Check final size
        const sizeKB = Math.round((base64.length * 3) / 4 / 1024);
        if (sizeKB > 500) {
          // Try with lower quality
          const lowQualityBase64 = canvas.toDataURL('image/jpeg', 0.5);
          resolve(lowQualityBase64);
        } else {
          resolve(base64);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate external image URL by attempting to load it
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = setTimeout(() => {
      img.src = '';
      resolve(false);
    }, 10000); // 10 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    img.src = url;
  });
}

/**
 * Check if a string is likely a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Check for common image extensions
    const path = parsed.pathname.toLowerCase();
    return (
      path.endsWith('.jpg') ||
      path.endsWith('.jpeg') ||
      path.endsWith('.png') ||
      path.endsWith('.gif') ||
      path.endsWith('.webp') ||
      path.endsWith('.svg') ||
      // Also allow URLs without extensions (could be dynamic images)
      !path.includes('.')
    );
  } catch {
    return false;
  }
}

/**
 * Get estimated base64 size in KB
 */
export function getBase64SizeKB(base64: string): number {
  // Remove data URL prefix if present
  const data = base64.includes(',') ? base64.split(',')[1] : base64;
  // Base64 is ~4/3 the size of original binary
  return Math.round((data.length * 3) / 4 / 1024);
}

/**
 * Check if aspect ratio is portrait-oriented
 */
export function checkAspectRatio(
  width: number,
  height: number
): { isPortrait: boolean; ratio: number } {
  const ratio = height / width;
  return {
    isPortrait: ratio >= 1,
    ratio: Math.round(ratio * 100) / 100,
  };
}
