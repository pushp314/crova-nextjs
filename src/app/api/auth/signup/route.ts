
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
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #FAF0E6; padding: 20px; border-radius: 8px;">
            <div style="background: linear-gradient(135deg, #FFDAB9 0%, #F08080 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2 style="color: #ffffff; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Welcome to Crova! ✨</h2>
            </div>
            <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #333;">Thanks for signing up with Crova!</p>
                <p style="font-size: 16px; color: #555;">Please verify your email address by clicking the button below to get started:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #F08080; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(240, 128, 128, 0.3);">
                        Verify Your Email 📧
                    </a>
                </p>
                <p style="font-size: 14px; color: #777;">If you did not sign up for an account, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999;">This link will expire in 24 hours.</p>
            </div>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: '✨ Verify your Crova account',
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
                userId: existingUser.id,
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
            userId: user.id,
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
