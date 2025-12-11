'use client';

import { useState, useCallback } from 'react';
import {
    compressImage,
    compressImages,
    CompressionOptions,
    CompressionResult,
    CompressionPresets,
    formatFileSize,
    needsCompression,
} from '@/lib/image-compression';

export interface UseImageCompressionOptions extends CompressionOptions {
    autoCompress?: boolean;  // Automatically compress when file is added
    showProgress?: boolean;  // Track compression progress
}

export interface UseImageCompressionReturn {
    compress: (file: File) => Promise<CompressionResult>;
    compressMultiple: (files: File[]) => Promise<CompressionResult[]>;
    isCompressing: boolean;
    progress: number;
    lastResult: CompressionResult | null;
    error: string | null;
    reset: () => void;
}

/**
 * React hook for image compression
 * 
 * @example
 * ```tsx
 * const { compress, isCompressing, lastResult } = useImageCompression({
 *   ...CompressionPresets.product,
 *   autoCompress: true,
 * });
 * 
 * const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (file) {
 *     const result = await compress(file);
 *     console.log(`Compressed: ${formatFileSize(result.compressedSize)}`);
 *   }
 * };
 * ```
 */
export function useImageCompression(
    options: UseImageCompressionOptions = {}
): UseImageCompressionReturn {
    const [isCompressing, setIsCompressing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [lastResult, setLastResult] = useState<CompressionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const compress = useCallback(
        async (file: File): Promise<CompressionResult> => {
            setIsCompressing(true);
            setError(null);
            setProgress(0);

            try {
                setProgress(50);
                const result = await compressImage(file, options);
                setProgress(100);
                setLastResult(result);
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Compression failed';
                setError(message);
                throw err;
            } finally {
                setIsCompressing(false);
            }
        },
        [options]
    );

    const compressMultiple = useCallback(
        async (files: File[]): Promise<CompressionResult[]> => {
            setIsCompressing(true);
            setError(null);
            setProgress(0);

            try {
                const results: CompressionResult[] = [];

                for (let i = 0; i < files.length; i++) {
                    const result = await compressImage(files[i], options);
                    results.push(result);
                    setProgress(Math.round(((i + 1) / files.length) * 100));
                }

                if (results.length > 0) {
                    setLastResult(results[results.length - 1]);
                }

                return results;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Compression failed';
                setError(message);
                throw err;
            } finally {
                setIsCompressing(false);
            }
        },
        [options]
    );

    const reset = useCallback(() => {
        setIsCompressing(false);
        setProgress(0);
        setLastResult(null);
        setError(null);
    }, []);

    return {
        compress,
        compressMultiple,
        isCompressing,
        progress,
        lastResult,
        error,
        reset,
    };
}

// Re-export utilities for convenience
export { CompressionPresets, formatFileSize, needsCompression };
