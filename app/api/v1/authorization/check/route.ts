import { NextResponse } from 'next/server';
import { authorization } from '@/lib/authorization/service';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { z } from 'zod';

const AuthCheckSchema = z.object({
  trustId: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string().optional(),
  scopeId: z.string().optional(),
  subjectId: z.string().optional(), // Optional override for simulator/explainer
});

export async function POST(request: Request) {
  try {
    const authContext = await getAuthenticatedUser();
    const body = await request.json();
    const validated = AuthCheckSchema.parse(body);

    const subjectId = validated.subjectId || authContext?.user.id;
    if (!subjectId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Subject ID or active authentication required' } },
        { status: 401 }
      );
    }

    const decision = await authorization.check({
      subjectId,
      trustId: validated.trustId,
      action: validated.action,
      resourceType: validated.resourceType,
      resourceId: validated.resourceId,
      scopeId: validated.scopeId,
    });

    return NextResponse.json({
      data: decision,
      meta: {
        requestId: `req_${Date.now()}`
      }
    });
  } catch (err: any) {
    console.error('Authorization check API error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to process authorization check' } },
      { status: 500 }
    );
  }
}
