import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcrypt';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/lib/mail';

const signupFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Welcome to NOVA!</h2>
            <p>Thanks for signing up. Please verify your email address by clicking the link below:</p>
            <p>
                <a href="${verificationUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Verify Your Email
                </a>
            </p>
            <p>If you did not sign up for an account, please ignore this email.</p>
            <hr />
            <p style="font-size: 0.8em; color: #888;">This link will expire in 24 hours.</p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: 'Verify your NOVA account',
        html,
    });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = signupFormSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        // Resend verification email if user exists but is not verified
        const verificationToken = await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: uuidv4(),
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            }
        });
        await sendVerificationEmail(email, verificationToken.token);
        return NextResponse.json({ message: 'Verification email sent. Please check your inbox.' }, { status: 200 });
      }
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
    });
    
    const verificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token: uuidv4(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
    });

    await sendVerificationEmail(email, verificationToken.token);

    return NextResponse.json({ message: 'Account created. Please check your email to verify your account.' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error('Signup Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
