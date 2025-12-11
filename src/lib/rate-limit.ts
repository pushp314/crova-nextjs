/**
 * Rate Limiting Utility for API Routes
 * 
 * Provides in-memory rate limiting for Next.js API routes.
 * For production, consider using Redis or Upstash for distributed rate limiting.
 */

interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Max requests per window
    message?: string;      // Custom error message
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (now > entry.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }, 60000); // Clean up every minute
}

/**
 * Rate limit configuration presets
 */
export const RateLimitPresets = {
    // Strict: 10 requests per minute
    strict: { windowMs: 60 * 1000, maxRequests: 10 },
    // Standard: 60 requests per minute
    standard: { windowMs: 60 * 1000, maxRequests: 60 },
    // Lenient: 100 requests per minute
    lenient: { windowMs: 60 * 1000, maxRequests: 100 },
    // Auth: 5 requests per minute (for login/signup)
    auth: { windowMs: 60 * 1000, maxRequests: 5 },
    // Search: 30 requests per minute
    search: { windowMs: 60 * 1000, maxRequests: 30 },
} as const;

/**
 * Get client identifier from request
 */
function getClientId(req: Request): string {
    // Try to get real IP from headers (for proxied requests)
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfIp = req.headers.get('cf-connecting-ip');

    // Use the first available IP
    const ip = cfIp || realIp || forwarded?.split(',')[0]?.trim() || 'unknown';

    // Include the route in the key for per-route limiting
    const url = new URL(req.url);
    return `${ip}:${url.pathname}`;
}

/**
 * Check if request is rate limited
 */
export function checkRateLimit(
    req: Request,
    config: RateLimitConfig = RateLimitPresets.standard
): { limited: boolean; remaining: number; resetIn: number } {
    const clientId = getClientId(req);
    const now = Date.now();

    let entry = rateLimitStore.get(clientId);

    // Create new entry if doesn't exist or expired
    if (!entry || now > entry.resetTime) {
        entry = {
            count: 0,
            resetTime: now + config.windowMs,
        };
    }

    entry.count++;
    rateLimitStore.set(clientId, entry);

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetIn = Math.max(0, entry.resetTime - now);

    return {
        limited: entry.count > config.maxRequests,
        remaining,
        resetIn,
    };
}

/**
 * Rate limit response with headers
 */
export function rateLimitResponse(
    remaining: number,
    resetIn: number,
    message = 'Too many requests. Please try again later.'
): Response {
    return new Response(
        JSON.stringify({
            code: 'RATE_LIMITED',
            message,
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': Math.ceil(resetIn / 1000).toString(),
                'Retry-After': Math.ceil(resetIn / 1000).toString(),
            },
        }
    );
}

/**
 * Rate limiting middleware for API routes
 * 
 * Usage in API route:
 * ```ts
 * import { withRateLimit, RateLimitPresets } from '@/lib/rate-limit';
 * 
 * export async function POST(req: Request) {
 *   const rateLimitResult = withRateLimit(req, RateLimitPresets.auth);
 *   if (rateLimitResult) return rateLimitResult;
 *   
 *   // ... your route logic
 * }
 * ```
 */
export function withRateLimit(
    req: Request,
    config: RateLimitConfig = RateLimitPresets.standard
): Response | null {
    const { limited, remaining, resetIn } = checkRateLimit(req, config);

    if (limited) {
        return rateLimitResponse(remaining, resetIn, config.message);
    }

    return null;
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(
    response: Response,
    req: Request,
    config: RateLimitConfig = RateLimitPresets.standard
): Response {
    const { remaining, resetIn } = checkRateLimit(req, config);

    const headers = new Headers(response.headers);
    headers.set('X-RateLimit-Remaining', remaining.toString());
    headers.set('X-RateLimit-Reset', Math.ceil(resetIn / 1000).toString());

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}
