
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'Token is missing.' }, { status: 400 });
        }

        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken) {
            return NextResponse.json({ message: 'Invalid token.' }, { status: 400 });
        }

        if (new Date() > verificationToken.expires) {
            return NextResponse.json({ message: 'Token has expired.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: verificationToken.userId },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() },
            });
            await tx.verificationToken.delete({
                where: { id: verificationToken.id },
            });
        });
        
        // Redirect to a success page or login page
        const url = req.url.replace('/api/auth/verify-email', '/login');
        const redirectUrl = new URL(url);
        redirectUrl.searchParams.set('verified', 'true');
        return NextResponse.redirect(redirectUrl);

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
