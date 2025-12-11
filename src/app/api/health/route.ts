import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * 
 * Used by Docker, Kubernetes, and load balancers to check application health.
 * Returns 200 if the application is healthy, 503 if unhealthy.
 */
export async function GET() {
    try {
        // Basic health check - application is running
        const healthCheck = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version || '1.0.0',
        };

        return NextResponse.json(healthCheck, { status: 200 });
    } catch {
        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
            },
            { status: 503 }
        );
    }
}
