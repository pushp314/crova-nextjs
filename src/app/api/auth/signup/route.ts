import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcrypt';
import { z } from 'zod';

const signupFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = signupFormSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
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
    
    // Omit password from the response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error('Signup Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
