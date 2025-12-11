import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const siteUrl = 'https://crova.in';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/delivery/',
                    '/login',
                    '/signup',
                    '/password-reset',
                    '/cart',
                    '/checkout',
                    '/orders',
                    '/profile',
                    '/_next/',
                    '/private/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/delivery/',
                    '/login',
                    '/signup',
                    '/password-reset',
                    '/cart',
                    '/checkout',
                    '/orders',
                    '/profile',
                ],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
