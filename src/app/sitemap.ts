import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

const SITE_URL = 'https://crova.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${SITE_URL}/men`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/women`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/new-arrivals`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/search`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // Fetch all products
    let productPages: MetadataRoute.Sitemap = [];
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        productPages = products.map((product) => ({
            url: `${SITE_URL}/product/${product.id}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Failed to fetch products for sitemap:', error);
    }

    // Fetch all categories
    let categoryPages: MetadataRoute.Sitemap = [];
    try {
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                updatedAt: true,
            },
        });

        categoryPages = categories.map((category) => ({
            url: `${SITE_URL}/search?category=${category.id}`,
            lastModified: category.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Failed to fetch categories for sitemap:', error);
    }

    return [...staticPages, ...productPages, ...categoryPages];
}
