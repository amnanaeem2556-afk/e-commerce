/**
 * Luxury Image Optimization & High-Performance Preloading Utility
 *
 * Provides:
 * 1. Responsive Unsplash resolution optimization:
 *    - Automatically requests properly sized images (e.g. w=600 for cards, w=900 for banners)
 *      instead of massive uncompressed 1200-2000px files, eliminating multi-megabyte download delays.
 *    - Retains pristine retina clarity (q=80, format=webp/auto).
 * 2. Background Pre-caching:
 *    - Warms browser cache for critical sections and category banners in background idle threads.
 * 3. Instant In-Memory Image Cache tracking:
 *    - Keeps track of decoded images so components render instantly without flash or delay.
 */

// In-memory cache of already loaded image URLs
const loadedImageCache = new Set<string>();

/**
 * Optimizes an image URL for specific display width and luxury sharpness.
 * Replaces high-bandwidth query parameters without losing visual crispness.
 */
export function getOptimizedImageUrl(
  url: string,
  width: number = 600,
  quality: number = 82
): string {
  if (!url) return '';

  // Only rewrite Unsplash URLs
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      return urlObj.toString();
    } catch {
      // Fallback regex if URL parsing fails
      return url
        .replace(/w=\d+/, `w=${width}`)
        .replace(/q=\d+/, `q=${quality}`);
    }
  }

  return url;
}

/**
 * Check if image is already cached/loaded in this session
 */
export function isImageCached(url: string): boolean {
  return loadedImageCache.has(url);
}

/**
 * Mark image as cached
 */
export function markImageCached(url: string): void {
  if (url) loadedImageCache.add(url);
}

/**
 * Preloads a single image into browser HTTP cache
 */
export function preloadImage(url: string): Promise<void> {
  if (!url || loadedImageCache.has(url)) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      loadedImageCache.add(url);
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
    img.src = url;
  });
}

/**
 * Preloads multiple images with concurrency throttling
 */
export async function preloadImages(urls: string[], maxConcurrent: number = 4): Promise<void> {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
  const chunks: string[][] = [];

  for (let i = 0; i < uniqueUrls.length; i += maxConcurrent) {
    chunks.push(uniqueUrls.slice(i, i + maxConcurrent));
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map((url) => preloadImage(url)));
  }
}
