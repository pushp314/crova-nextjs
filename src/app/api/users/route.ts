import { NextResponse } from 'next/server';

// This route has been moved to /api/admin/users
// Keeping it here to avoid breaking old links, but it should not be used in the new code.
export async function GET(req: Request) {
    return NextResponse.json({ message: 'This endpoint is deprecated. Please use /api/admin/users' }, { status: 404 });
}
