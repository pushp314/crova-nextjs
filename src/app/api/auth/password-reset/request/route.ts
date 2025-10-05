
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/lib/mail';

const requestSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/password-reset/reset?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset for your NOVA account. Please click the link below to set a new password:</p>
        <p>
            <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Reset Your Password
            </a>
        </p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <hr />
        <p style="font-size: 0.8em; color: #888;">This link will expire in 1 hour.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset your NOVA password',
    html,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = requestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && user.email) { // Check if user and user.email exist
       const existingToken = await prisma.passwordResetToken.findFirst({
        where: {
          userId: user.id,
          expires: {
            gt: new Date(),
          },
        },
      });
      
      let tokenValue: string;

      if (existingToken) {
        tokenValue = existingToken.token;
      } else {
        // Invalidate any old tokens for this user
        await prisma.passwordResetToken.deleteMany({
          where: { userId: user.id },
        });
        
        // Create a new token
        const newPasswordResetToken = await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            // The user.email is now guaranteed to be a string here.
            identifier: user.email, 
            token: uuidv4(),
            expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
          },
        });
        tokenValue = newPasswordResetToken.token;
      }
      
      await sendPasswordResetEmail(email, tokenValue);
    }

    // Always return a success message to prevent user enumeration
    return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error('Password Reset Request Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
