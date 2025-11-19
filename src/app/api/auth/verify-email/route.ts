
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/mail';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ message: 'Token is missing.' }, { status: 400 });
        }

        const verificationToken = await prisma.verificationToken.findFirst({
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
                data: { 
                  emailVerified: new Date(),
                  welcomeEmailSent: true, // Mark welcome email as sent
                },
            });
            await tx.verificationToken.delete({
                where: { id: verificationToken.id },
            });
        });
        
        // Send welcome email after successful verification
        try {
          const firstName = user.name?.split(' ')[0] || 'there';
          await sendWelcomeEmail(user.email!, firstName);
        } catch (emailError) {
          // Log error but don't fail the verification
          console.error('Failed to send welcome email:', emailError);
        }
        
        // Redirect to a success page or login page
        const redirectUrl = new URL(`${process.env.APP_URL}/login`);
        redirectUrl.searchParams.set('verified', 'true');
        return NextResponse.redirect(redirectUrl);

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
