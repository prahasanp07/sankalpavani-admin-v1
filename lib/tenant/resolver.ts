import { getAuthenticatedUser } from '../auth/session';
import { createRequestContext, RequestContext } from './context';
import { db } from '../db/client';
import { temples } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export class TenantResolutionError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, code: string = 'FORBIDDEN', status: number = 403) {
    super(message);
    this.name = 'TenantResolutionError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Resolves and validates the tenant context from server route parameters or headers
 */
export async function resolveRequestContext(params: {
  trustId: string;
  templeId?: string;
  customToken?: string;
}): Promise<RequestContext> {
  const authContext = await getAuthenticatedUser(params.customToken);

  if (!authContext) {
    throw new TenantResolutionError('Authentication required to access tenant resource', 'UNAUTHORIZED', 401);
  }

  const { user, trustMemberships, templeMemberships } = authContext;

  // Verify Active Trust Membership
  const hasTrustMembership = trustMemberships.some(
    tm => tm.trustId === params.trustId && tm.status === 'ACTIVE'
  );

  if (!hasTrustMembership) {
    throw new TenantResolutionError(
      `User '${user.email}' is not an active member of Trust '${params.trustId}'`,
      'TRUST_ACCESS_DENIED',
      403
    );
  }

  // If Temple context is specified, validate Temple ownership and membership
  if (params.templeId) {
    const temple = await db.query.temples.findFirst({
      where: and(
        eq(temples.id, params.templeId),
        eq(temples.trustId, params.trustId)
      )
    });

    if (!temple) {
      throw new TenantResolutionError(
        `Temple '${params.templeId}' does not exist or does not belong to Trust '${params.trustId}'`,
        'TEMPLE_NOT_FOUND',
        404
      );
    }
  }

  return createRequestContext({
    userId: user.id,
    trustId: params.trustId,
    templeId: params.templeId,
    userEmail: user.email,
    userName: user.name,
  });
}
