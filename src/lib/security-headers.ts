/**
 * Security Headers Utility
 * 
 * Provides security headers for Next.js responses.
 * These headers help protect against common web vulnerabilities.
 */

/**
 * Security headers configuration
 */
export const securityHeaders = [
    // Content Security Policy - Restrict where resources can be loaded from
    {
        key: 'Content-Security-Policy',
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://fonts.googleapis.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https: http:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
            "frame-src 'self' https://api.razorpay.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests",
        ].join('; '),
    },
    // Prevent XSS attacks - tells browser to block reflected XSS
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
    },
    // Prevent clickjacking - don't allow page to be embedded in frames
    {
        key: 'X-Frame-Options',
        value: 'DENY',
    },
    // Prevent MIME type sniffing
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    // Control what information is sent in Referer header
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    // Permissions Policy - restrict browser features
    {
        key: 'Permissions-Policy',
        value: [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'interest-cohort=()', // Opt out of FLoC
        ].join(', '),
    },
    // Strict Transport Security - force HTTPS
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
    },
];

/**
 * Get security headers as an object (for middleware)
 */
export function getSecurityHeadersObject(): Record<string, string> {
    return securityHeaders.reduce((acc, header) => {
        acc[header.key] = header.value;
        return acc;
    }, {} as Record<string, string>);
}

/**
 * Apply security headers to a Response
 */
export function withSecurityHeaders(response: Response): Response {
    const headers = new Headers(response.headers);

    for (const header of securityHeaders) {
        headers.set(header.key, header.value);
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}
