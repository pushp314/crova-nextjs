'use client';

import Image, { ImageProps } from 'next/image';

/**
 * SafeImage - A wrapper component for handling images
 * 
 * Uses native <img> for local uploads (/uploads/*) to avoid Next.js Image optimization issues
 * Uses Next.js Image for external URLs to benefit from optimization
 */
interface SafeImageProps extends Omit<ImageProps, 'src'> {
    src: string;
    fallback?: string;
}

export default function SafeImage({
    src,
    alt,
    fallback = '/placeholder.svg',
    fill,
    width,
    height,
    className,
    sizes,
    priority,
    ...rest
}: SafeImageProps) {
    // Check if this is a local upload path
    const isLocalUpload = src?.startsWith('/uploads/');

    // If no src or empty, use fallback
    const imageSrc = src || fallback;

    // For local uploads, use native <img> to avoid Next.js optimization issues
    if (isLocalUpload) {
        if (fill) {
            return (
                <img
                    src={imageSrc}
                    alt={alt}
                    className={`${className || ''} absolute inset-0 w-full h-full object-cover`}
                    loading={priority ? 'eager' : 'lazy'}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = fallback;
                    }}
                />
            );
        }

        return (
            <img
                src={imageSrc}
                alt={alt}
                width={typeof width === 'number' ? width : undefined}
                height={typeof height === 'number' ? height : undefined}
                className={className}
                loading={priority ? 'eager' : 'lazy'}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = fallback;
                }}
            />
        );
    }

    // For external URLs, use Next.js Image for optimization benefits
    return (
        <Image
            src={imageSrc}
            alt={alt}
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            className={className}
            sizes={sizes}
            priority={priority}
            {...rest}
        />
    );
}
