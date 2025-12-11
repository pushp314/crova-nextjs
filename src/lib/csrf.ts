/**
 * CSRF Protection Utility
 * 
 * Provides CSRF token generation and validation for forms.
 * Uses a combination of server-side tokens and the double-submit cookie pattern.
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        // Use crypto.randomUUID for modern environments
        return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    }

    // Fallback for older environments
    const array = new Uint8Array(CSRF_TOKEN_LENGTH);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(array);
    } else {
        // Very basic fallback (not recommended for production)
        for (let i = 0; i < CSRF_TOKEN_LENGTH; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create CSRF token from cookies
 */
export async function getCsrfToken(): Promise<string> {
    const cookieStore = await cookies();
    let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;

    if (!token) {
        token = generateToken();
        // Note: Cookie will be set in the response
    }

    return token;
}

/**
 * Set CSRF cookie in response
 */
export function getCsrfCookieHeader(token: string): string {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
        `${CSRF_COOKIE_NAME}=${token}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Strict',
        isProduction ? 'Secure' : '',
        `Max-Age=${60 * 60 * 24}`, // 24 hours
    ].filter(Boolean).join('; ');

    return cookieOptions;
}

/**
 * Validate CSRF token from request
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
    // Skip for safe methods
    const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
    if (safeMethod) return true;

    // Get token from cookie
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
    if (!cookieToken) return false;

    // Get token from header
    const headerToken = request.headers.get(CSRF_HEADER_NAME);

    // Get token from body (for form submissions)
    let bodyToken: string | undefined;
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/x-www-form-urlencoded')) {
        try {
            const formData = await request.clone().formData();
            bodyToken = formData.get('_csrf') as string | undefined;
        } catch {
            // Ignore form parsing errors
        }
    } else if (contentType?.includes('application/json')) {
        try {
            const body = await request.clone().json();
            bodyToken = body._csrf;
        } catch {
            // Ignore JSON parsing errors
        }
    }

    // Validate: header token or body token must match cookie token
    const submittedToken = headerToken || bodyToken;

    if (!submittedToken) return false;

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(cookieToken, submittedToken);
}

/**
 * Constant-time string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

/**
 * CSRF validation middleware for API routes
 * 
 * Usage:
 * ```ts
 * import { withCsrfProtection } from '@/lib/csrf';
 * 
 * export async function POST(req: NextRequest) {
 *   const csrfError = await withCsrfProtection(req);
 *   if (csrfError) return csrfError;
 *   
 *   // ... your route logic
 * }
 * ```
 */
export async function withCsrfProtection(request: NextRequest): Promise<Response | null> {
    const isValid = await validateCsrfToken(request);

    if (!isValid) {
        return new Response(
            JSON.stringify({
                code: 'INVALID_CSRF_TOKEN',
                message: 'Invalid or missing CSRF token',
            }),
            {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }

    return null;
}
