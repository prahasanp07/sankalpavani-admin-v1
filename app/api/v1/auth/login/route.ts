import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { users } from '@/db/schema';
import { createSessionToken, getAuthenticatedUser, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(), // For development prototype compatibility
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = LoginSchema.parse(body);

    // Find active user
    let user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim())
    });

    // Development auto-provision for default admin email if database is not seeded
    if (!user && email.toLowerCase() === 'admin@temple1.com') {
      const [newUser] = await db.insert(users).values({
        id: 'user_vidyaranya',
        name: 'Sri Vidyaranya Shastri',
        email: 'admin@temple1.com',
        mobileNumber: '+91 98450 11000',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvn8h5qEhb1tDXNVQmH_C-7Bf3AF9LFkxb3WKWAvVYmxKc-TcXh1fjMMz-WjPg9zbdjB7Yrhy9eiYGkJBLgHovr8GAsE2ft4v7PT9xcRcGGi3JzCKWBozxxFHni9LfCSubIqySEm5J4TesuWgBjdcdegth7w_Lsgvd39ZpYyq-IgCKk-0lzzWXTvduEcTeXKyNURY3AzLe-YP0InifLRv0R4KmiNUF_JDCpbPVweyINkAPtpA7Rfnc7ZfS2hPyvRu8cJGasIwQyYQ',
        status: 'ACTIVE'
      }).returning();
      user = newUser;
    }

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or user account is not active' } },
        { status: 401 }
      );
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || undefined,
    });

    const authContext = await getAuthenticatedUser(token);

    const response = NextResponse.json({
      data: {
        token,
        user: authContext?.user || user,
        trustMemberships: authContext?.trustMemberships || [],
        templeMemberships: authContext?.templeMemberships || [],
      },
      meta: {
        requestId: `req_${Date.now()}`
      }
    });

    // Set secure HTTP-only cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Authentication failed' } },
      { status: 500 }
    );
  }
}
