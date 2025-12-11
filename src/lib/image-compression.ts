'use client';

/**
 * Client-Side Image Compression Utility
 * 
 * Provides functions to compress and resize images before upload.
 * Uses canvas API for browser-based compression.
 */

export interface CompressionOptions {
    maxWidth?: number;          // Max width in pixels (default: 1920)
    maxHeight?: number;         // Max height in pixels (default: 1080)
    maxSizeKB?: number;         // Target max file size in KB (default: 500)
    quality?: number;           // Initial quality 0-1 (default: 0.9)
    minQuality?: number;        // Minimum quality to try (default: 0.5)
    qualityStep?: number;       // Quality reduction step (default: 0.1)
    format?: 'jpeg' | 'webp' | 'png';  // Output format (default: 'webp')
}

export interface CompressionResult {
    file: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    width: number;
    height: number;
    format: string;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
    maxWidth: 1920,
    maxHeight: 1080,
    maxSizeKB: 500,
    quality: 0.9,
    minQuality: 0.5,
    qualityStep: 0.1,
    format: 'webp',
};

/**
 * Load an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
    width: number,
    height: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } {
    let newWidth = width;
    let newHeight = height;

    // Check if resizing is needed
    if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
            // Landscape
            newWidth = Math.min(width, maxWidth);
            newHeight = Math.round(newWidth / aspectRatio);

            if (newHeight > maxHeight) {
                newHeight = maxHeight;
                newWidth = Math.round(newHeight * aspectRatio);
            }
        } else {
            // Portrait or square
            newHeight = Math.min(height, maxHeight);
            newWidth = Math.round(newHeight * aspectRatio);

            if (newWidth > maxWidth) {
                newWidth = maxWidth;
                newHeight = Math.round(newWidth / aspectRatio);
            }
        }
    }

    return { width: newWidth, height: newHeight };
}

/**
 * Convert canvas to File with specified format and quality
 */
function canvasToFile(
    canvas: HTMLCanvasElement,
    filename: string,
    format: string,
    quality: number
): Promise<File> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Failed to create blob'));
                    return;
                }

                const extension = format === 'jpeg' ? 'jpg' : format;
                const newFilename = filename.replace(/\.[^.]+$/, `.${extension}`);
                const file = new File([blob], newFilename, { type: `image/${format}` });
                resolve(file);
            },
            `image/${format}`,
            quality
        );
    });
}

/**
 * Compress an image file
 * 
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise with compression result
 * 
 * @example
 * ```ts
 * const result = await compressImage(file, { maxSizeKB: 200 });
 * console.log(`Reduced from ${result.originalSize}KB to ${result.compressedSize}KB`);
 * ```
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<CompressionResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const originalSize = file.size;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        throw new Error('File is not an image');
    }

    // Load the image
    const img = await loadImage(file);
    const originalWidth = img.width;
    const originalHeight = img.height;

    // Calculate new dimensions
    const { width, height } = calculateDimensions(
        originalWidth,
        originalHeight,
        opts.maxWidth,
        opts.maxHeight
    );

    // Create canvas and draw resized image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    // Use high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Clean up the object URL
    URL.revokeObjectURL(img.src);

    // Try progressively lower quality until size target is met
    let currentQuality = opts.quality;
    let compressedFile = await canvasToFile(canvas, file.name, opts.format, currentQuality);

    // Reduce quality until file size is under target or min quality reached
    while (
        compressedFile.size > opts.maxSizeKB * 1024 &&
        currentQuality > opts.minQuality
    ) {
        currentQuality -= opts.qualityStep;
        compressedFile = await canvasToFile(canvas, file.name, opts.format, currentQuality);
    }

    return {
        file: compressedFile,
        originalSize,
        compressedSize: compressedFile.size,
        compressionRatio: originalSize / compressedFile.size,
        width,
        height,
        format: opts.format,
    };
}

/**
 * Compress multiple images
 */
export async function compressImages(
    files: File[],
    options: CompressionOptions = {}
): Promise<CompressionResult[]> {
    return Promise.all(files.map((file) => compressImage(file, options)));
}

/**
 * Check if a file needs compression
 */
export function needsCompression(
    file: File,
    options: CompressionOptions = {}
): boolean {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    return file.size > opts.maxSizeKB * 1024;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Preset compression configurations
 */
export const CompressionPresets = {
    // For product images
    product: {
        maxWidth: 1200,
        maxHeight: 1200,
        maxSizeKB: 300,
        quality: 0.85,
        format: 'webp' as const,
    },
    // For thumbnail images
    thumbnail: {
        maxWidth: 400,
        maxHeight: 400,
        maxSizeKB: 50,
        quality: 0.8,
        format: 'webp' as const,
    },
    // For avatar images
    avatar: {
        maxWidth: 200,
        maxHeight: 200,
        maxSizeKB: 30,
        quality: 0.8,
        format: 'webp' as const,
    },
    // For banner images
    banner: {
        maxWidth: 1920,
        maxHeight: 600,
        maxSizeKB: 500,
        quality: 0.9,
        format: 'webp' as const,
    },
    // High quality (minimal compression)
    highQuality: {
        maxWidth: 2560,
        maxHeight: 1440,
        maxSizeKB: 1000,
        quality: 0.95,
        format: 'webp' as const,
    },
};
