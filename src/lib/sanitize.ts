/**
 * Input Sanitization Utility
 * 
 * Provides functions to sanitize user input and prevent XSS attacks.
 */

/**
 * HTML entities to escape
 */
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
    return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize string for safe database storage and display
 */
export function sanitizeString(str: string): string {
    if (typeof str !== 'string') return '';

    return str
        .trim()
        // Remove null bytes
        .replace(/\0/g, '')
        // Remove control characters (except newlines and tabs)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ');
}

/**
 * Sanitize and escape HTML in string
 */
export function sanitizeAndEscape(str: string): string {
    return escapeHtml(sanitizeString(str));
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string | null {
    if (typeof email !== 'string') return null;

    const sanitized = email.trim().toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) return null;

    // Additional checks
    if (sanitized.length > 254) return null; // Max email length

    return sanitized;
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string | null {
    if (typeof url !== 'string') return null;

    const sanitized = url.trim();

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = sanitized.toLowerCase();

    for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
            return null;
        }
    }

    // Validate URL format
    try {
        new URL(sanitized);
        return sanitized;
    } catch {
        // Allow relative URLs
        if (sanitized.startsWith('/') && !sanitized.startsWith('//')) {
            return sanitized;
        }
        return null;
    }
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result = {} as T;

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            (result as Record<string, unknown>)[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
            (result as Record<string, unknown>)[key] = value.map((item) =>
                typeof item === 'string' ? sanitizeString(item) : item
            );
        } else if (value !== null && typeof value === 'object') {
            (result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
        } else {
            (result as Record<string, unknown>)[key] = value;
        }
    }

    return result;
}

/**
 * Sanitize search query
 * Removes special characters that could be used for injection
 */
export function sanitizeSearchQuery(query: string): string {
    if (typeof query !== 'string') return '';

    return query
        .trim()
        // Remove special regex characters
        .replace(/[.*+?^${}()|[\]\\]/g, '')
        // Remove SQL-like characters
        .replace(/['";%_]/g, '')
        // Limit length
        .slice(0, 200);
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
    if (typeof filename !== 'string') return '';

    return filename
        .trim()
        // Remove path separators
        .replace(/[/\\]/g, '')
        // Remove null bytes
        .replace(/\0/g, '')
        // Remove other dangerous characters
        .replace(/[<>:"|?*]/g, '')
        // Limit length
        .slice(0, 255);
}
