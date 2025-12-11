import { Metadata } from 'next';

const SITE_URL = 'https://crova.in';
const SITE_NAME = 'CROVA';

/**
 * Default SEO metadata for the site
 */
export const defaultMetadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'CROVA - Premium Fashion Store | Shop Men & Women Clothing',
        template: '%s | CROVA',
    },
    description:
        'Discover the latest fashion trends at CROVA. Shop premium quality clothing for men and women. Free shipping on orders above ₹999. New arrivals every week!',
    keywords: [
        'fashion',
        'clothing',
        'men fashion',
        'women fashion',
        'online shopping',
        'premium clothing',
        'CROVA',
        'fashion store',
        'India fashion',
        'trendy clothes',
        'affordable fashion',
        'designer wear',
    ],
    authors: [{ name: 'CROVA' }],
    creator: 'CROVA',
    publisher: 'CROVA',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: SITE_URL,
        siteName: SITE_NAME,
        title: 'CROVA - Premium Fashion Store',
        description:
            'Discover the latest fashion trends at CROVA. Shop premium quality clothing for men and women.',
        images: [
            {
                url: `${SITE_URL}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: 'CROVA - Premium Fashion Store',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CROVA - Premium Fashion Store',
        description:
            'Discover the latest fashion trends at CROVA. Shop premium quality clothing for men and women.',
        images: [`${SITE_URL}/og-image.jpg`],
        creator: '@crova_in',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    alternates: {
        canonical: SITE_URL,
    },
    verification: {
        // Add your verification codes here
        // google: 'your-google-verification-code',
        // yandex: 'your-yandex-verification-code',
    },
};

/**
 * Generate metadata for product pages
 */
export function generateProductMetadata({
    name,
    description,
    price,
    images,
    category,
    id,
}: {
    name: string;
    description: string;
    price: number;
    images: string[];
    category?: string;
    id: string;
}): Metadata {
    const productUrl = `${SITE_URL}/product/${id}`;
    const imageUrl = images[0]
        ? images[0].startsWith('http')
            ? images[0]
            : `${SITE_URL}${images[0]}`
        : `${SITE_URL}/og-image.jpg`;

    return {
        title: name,
        description: description.slice(0, 160),
        keywords: [name, category || 'fashion', 'CROVA', 'buy online'].filter(Boolean) as string[],
        openGraph: {
            type: 'website',
            url: productUrl,
            title: name,
            description: description.slice(0, 160),
            siteName: SITE_NAME,
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 800,
                    alt: name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: name,
            description: description.slice(0, 160),
            images: [imageUrl],
        },
        alternates: {
            canonical: productUrl,
        },
    };
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata({
    name,
    description,
}: {
    name: string;
    description?: string;
}): Metadata {
    const categoryDescription = description || `Shop the latest ${name} collection at CROVA. Find premium quality ${name} at affordable prices.`;

    return {
        title: `${name} Collection`,
        description: categoryDescription,
        keywords: [name, 'fashion', 'CROVA', 'collection', 'shop online'],
        openGraph: {
            title: `${name} Collection | CROVA`,
            description: categoryDescription,
            type: 'website',
        },
    };
}

/**
 * JSON-LD structured data for the organization
 */
export const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CROVA',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
        'https://www.facebook.com/crova.in',
        'https://www.instagram.com/crova.in',
        'https://twitter.com/crova_in',
    ],
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-XXXXXXXXXX',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
    },
};

/**
 * JSON-LD structured data for the website
 */
export const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CROVA',
    url: SITE_URL,
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
    },
};

/**
 * Generate JSON-LD for a product
 */
export function generateProductJsonLd({
    name,
    description,
    price,
    images,
    id,
    inStock,
    rating,
    reviewCount,
}: {
    name: string;
    description: string;
    price: number;
    images: string[];
    id: string;
    inStock: boolean;
    rating?: number;
    reviewCount?: number;
}) {
    const productUrl = `${SITE_URL}/product/${id}`;
    const imageUrls = images.map(img =>
        img.startsWith('http') ? img : `${SITE_URL}${img}`
    );

    const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image: imageUrls,
        url: productUrl,
        sku: id,
        offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'INR',
            price: price,
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            availability: inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'CROVA',
            },
        },
    };

    if (rating && reviewCount) {
        jsonLd.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount: reviewCount,
        };
    }

    return jsonLd;
}
