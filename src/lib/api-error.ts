/**
 * Centralized API Error Handling
 * 
 * Provides consistent error responses across all API routes
 * with proper TypeScript types and error tracking.
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// Error codes for consistent API responses
export const ErrorCodes = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    CONFLICT: 'CONFLICT',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Custom API Error class for type-safe error handling
 */
export class ApiError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly code: ErrorCode,
        message: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }

    static unauthorized(message = 'Unauthorized'): ApiError {
        return new ApiError(401, ErrorCodes.UNAUTHORIZED, message);
    }

    static forbidden(message = 'Forbidden'): ApiError {
        return new ApiError(403, ErrorCodes.FORBIDDEN, message);
    }

    static notFound(resource = 'Resource'): ApiError {
        return new ApiError(404, ErrorCodes.NOT_FOUND, `${resource} not found.`);
    }

    static badRequest(message: string): ApiError {
        return new ApiError(400, ErrorCodes.BAD_REQUEST, message);
    }

    static conflict(message: string): ApiError {
        return new ApiError(409, ErrorCodes.CONFLICT, message);
    }

    static validationError(message: string, details?: unknown): ApiError {
        return new ApiError(400, ErrorCodes.VALIDATION_ERROR, message, details);
    }

    static internal(message = 'An internal server error occurred.'): ApiError {
        return new ApiError(500, ErrorCodes.INTERNAL_ERROR, message);
    }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

/**
 * Type guard for Prisma errors
 */
export function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
}

/**
 * Log error to console (and optionally to Sentry/external service)
 */
function logError(context: string, error: unknown): void {
    // In production, this would send to Sentry or similar
    if (process.env.NODE_ENV === 'development') {
        console.error(`[${context}]`, error);
    }

    // TODO: Add Sentry integration
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(error, { extra: { context } });
    // }
}

/**
 * Get a user-friendly message from various error types
 */
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}

interface ErrorResponseBody {
    code: ErrorCode;
    message: string;
    details?: unknown;
}

/**
 * Central error handler for API routes
 * 
 * Usage:
 * ```ts
 * try {
 *   // ... API logic
 * } catch (error) {
 *   return handleApiError(error, 'GET /api/products');
 * }
 * ```
 */
export function handleApiError(
    error: unknown,
    context: string
): NextResponse<ErrorResponseBody> {
    // Log the error
    logError(context, error);

    // Handle known ApiError
    if (isApiError(error)) {
        const body: ErrorResponseBody = {
            code: error.code,
            message: error.message,
        };
        if (error.details !== undefined) {
            body.details = error.details;
        }
        return NextResponse.json(body, { status: error.statusCode });
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                code: ErrorCodes.VALIDATION_ERROR,
                message: error.errors[0]?.message || 'Validation failed',
                details: error.errors,
            },
            { status: 400 }
        );
    }

    // Handle Prisma errors
    if (isPrismaError(error)) {
        switch (error.code) {
            case 'P2002': // Unique constraint violation
                return NextResponse.json(
                    {
                        code: ErrorCodes.CONFLICT,
                        message: 'A record with this value already exists.',
                    },
                    { status: 409 }
                );
            case 'P2025': // Record not found
                return NextResponse.json(
                    {
                        code: ErrorCodes.NOT_FOUND,
                        message: 'Record not found.',
                    },
                    { status: 404 }
                );
            default:
                // Fall through to generic error
                break;
        }
    }

    // Handle FORBIDDEN error from rbac.ts
    if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
            {
                code: ErrorCodes.FORBIDDEN,
                message: 'You do not have permission to perform this action.',
            },
            { status: 403 }
        );
    }

    // Generic internal server error
    return NextResponse.json(
        {
            code: ErrorCodes.INTERNAL_ERROR,
            message: 'An internal server error occurred.',
        },
        { status: 500 }
    );
}

/**
 * Wrapper for async route handlers with automatic error handling
 * 
 * Usage:
 * ```ts
 * export const GET = withErrorHandler(async (req) => {
 *   // ... your logic
 *   return NextResponse.json(data);
 * }, 'GET /api/products');
 * ```
 */
export function withErrorHandler<T>(
    handler: (req: Request, context?: { params: Promise<Record<string, string>> }) => Promise<NextResponse<T>>,
    routeContext: string
) {
    return async (req: Request, context?: { params: Promise<Record<string, string>> }): Promise<NextResponse<T | ErrorResponseBody>> => {
        try {
            return await handler(req, context);
        } catch (error) {
            return handleApiError(error, routeContext) as NextResponse<T | ErrorResponseBody>;
        }
    };
}
