
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { hash } from 'bcrypt';

const resetSchema = z.object({
  token: z.string().min(1, 'Token is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = resetSchema.parse(body);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || new Date() > resetToken.expires) {
      return NextResponse.json({ message: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: resetToken.userId },
    });

    if (!user) {
      // This should theoretically not happen if the token is valid, but good to have a check
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const hashedPassword = await hash(password, 10);

    // Use a transaction to update user and delete the token
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await tx.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
    });

    return NextResponse.json({ message: 'Password has been reset successfully.' }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error('Password Reset Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
