/**
 * Tenant & Request Context
 * Authoritative context attached to every server-side service boundary, API, and database operation.
 */
export interface RequestContext {
  requestId: string;
  userId: string;
  trustId: string;
  templeId?: string;
  sessionId: string;
  policyVersion?: number;
  userEmail?: string;
  userName?: string;
}

export function createRequestContext(params: Partial<RequestContext> & { userId: string; trustId: string }): RequestContext {
  return {
    requestId: params.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId: params.userId,
    trustId: params.trustId,
    templeId: params.templeId,
    sessionId: params.sessionId || `sess_${Date.now()}`,
    policyVersion: params.policyVersion,
    userEmail: params.userEmail,
    userName: params.userName,
  };
}
