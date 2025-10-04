import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const requestSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

// This is a mock email function. In a real app, you would use a service like Nodemailer or SendGrid.
async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/password-reset/reset?token=${token}`;
  console.log(`
    ================================================
    PASSWORD RESET REQUEST
    
    THIS IS A MOCK EMAIL. IN A REAL APP, THIS WOULD BE SENT TO THE USER'S INBOX.

    Please click the link below to reset your password.
    
    Reset URL: ${resetUrl}

    If you did not request a password reset, please ignore this email.
    ================================================
  `);
  // In a real app:
  // await sendEmail({ to: email, subject: 'Reset Your Password', html: ... });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = requestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // We don't want to reveal if a user exists or not for security reasons.
    // So, we'll send a success response even if the user is not found.
    if (user) {
      // Create a password reset token
      const passwordResetToken = await prisma.passwordResetToken.create({
        data: {
          identifier: email,
          token: uuidv4(),
          expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
        },
      });
      
      // Send the email
      await sendPasswordResetEmail(email, passwordResetToken.token);
    }

    return NextResponse.json({ message: 'If an account with that email exists, we have sent a password reset link.' }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error('Password Reset Request Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
