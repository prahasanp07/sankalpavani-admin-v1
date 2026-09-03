/**
 * Dynamic Authorization Engine Types & Contracts
 */

export interface AuthorizationRequest {
  subjectId: string; // User ID
  trustId: string;   // Tenant Root
  action: string;    // E.g. 'temple.seva.update', 'trust.finance.export'
  resourceType: string; // E.g. 'seva', 'booking', 'temple', 'report'
  resourceId?: string;
  scopeId?: string;  // Explicit target Temple ID or Trust ID
  context?: Record<string, unknown>;
}

export type GrantSource = 
  | 'DIRECT' 
  | 'INHERITED' 
  | 'CASCADE' 
  | 'DESIGNATION_BINDING' 
  | 'DELEGATION';

export interface MatchedGrant {
  roleId: string;
  roleName: string;
  permissionId: string;
  source: GrantSource;
  scopeMode: string;
  effect: 'ALLOW' | 'DENY';
}

export interface AuthorizationDecision {
  decision: 'ALLOW' | 'DENY' | 'CONDITIONAL';
  reasonCode: string;
  policyVersion: number;
  matchedGrants: MatchedGrant[];
}

export interface AuthorizationProvider {
  check(input: AuthorizationRequest): Promise<AuthorizationDecision>;
  batchCheck(inputs: AuthorizationRequest[]): Promise<AuthorizationDecision[]>;
  explain(input: AuthorizationRequest): Promise<AuthorizationDecision>;
  require(input: AuthorizationRequest): Promise<void>;
  listAuthorizedScopes(input: { subjectId: string; trustId: string; action: string }): Promise<string[]>;
}

export class AuthorizationError extends Error {
  public code: string;
  public details?: AuthorizationDecision;

  constructor(message: string, decision?: AuthorizationDecision) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = 'FORBIDDEN';
    this.details = decision;
  }
}
