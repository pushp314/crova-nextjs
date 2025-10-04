import { NextResponse } from 'next/server';

// This endpoint is deprecated and functionality has been moved to /api/payment/webhook
// This file can be safely removed.
export async function POST(req: Request) {
    return NextResponse.json(
        { message: 'This endpoint is deprecated. Please use /api/payment/webhook' },
        { status: 404 }
    );
}
