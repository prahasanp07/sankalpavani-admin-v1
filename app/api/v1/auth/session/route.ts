import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const customToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    const authContext = await getAuthenticatedUser(customToken);

    if (!authContext) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'No active session' } },
        { status: 401 }
      );
    }

    return NextResponse.json({
      data: authContext,
      meta: {
        requestId: `req_${Date.now()}`
      }
    });
  } catch (err: any) {
    console.error('Session check error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve session' } },
      { status: 500 }
    );
  }
}
