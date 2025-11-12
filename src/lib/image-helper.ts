/**
 * Helper functions for handling product images
 * Database stores only filenames, these functions help construct full URLs
 */

const PRODUCT_IMAGES_PATH = '/uploads/products/';

/**
 * Convert filename to full URL for display
 * @param filename - The image filename stored in database
 * @returns Full URL path
 */
export function getProductImageUrl(filename: string): string {
  if (!filename) return '/placeholder.svg';
  
  // If already a full path/URL, return as is
  if (filename.startsWith('/') || filename.startsWith('http')) {
    return filename;
  }
  
  // Otherwise, prepend the products path
  return `${PRODUCT_IMAGES_PATH}${filename}`;
}

/**
 * Convert array of filenames to full URLs
 * @param filenames - Array of image filenames from database
 * @returns Array of full URL paths
 */
export function getProductImageUrls(filenames: string[]): string[] {
  return filenames.map(getProductImageUrl);
}

/**
 * Extract filename from full URL (for saving to database)
 * @param url - Full URL or filename
 * @returns Just the filename
 */
export function extractFilename(url: string): string {
  if (!url) return '';
  
  // If it's already just a filename (no path), return as is
  if (!url.includes('/')) return url;
  
  // Extract filename from path
  const parts = url.split('/');
  return parts[parts.length - 1];
}
