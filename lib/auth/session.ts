import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from '../db/client';
import { users, trustMemberships, trusts, templeMemberships, temples } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

const SESSION_COOKIE_NAME = 'sankalpvani_session_token';
const SESSION_SECRET = process.env.SESSION_SECRET || 'sankalpvani-dev-secret-key-32chars-minimum!!';

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  issuedAt: number;
  expiresAt: number;
}

export interface AuthenticatedUserContext {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
    mobileNumber?: string | null;
  };
  trustMemberships: Array<{
    trustId: string;
    trustName: string;
    membershipType: string;
    status: string;
  }>;
  templeMemberships: Array<{
    trustId: string;
    templeId: string;
    templeName: string;
    templeCode: string;
    status: string;
  }>;
}

/**
 * Creates an encrypted/signed session token
 */
export function createSessionToken(payload: Omit<UserSessionPayload, 'issuedAt' | 'expiresAt'>): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + 7 * 24 * 60 * 60 * 1000; // 7 days validity

  const fullPayload: UserSessionPayload = {
    ...payload,
    issuedAt,
    expiresAt,
  };

  const payloadString = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadString)
    .digest('base64url');

  return `${payloadString}.${signature}`;
}

/**
 * Verifies and decodes a session token
 */
export function verifySessionToken(token: string): UserSessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadString, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadString)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadString, 'base64url').toString('utf-8')) as UserSessionPayload;
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves the current authenticated user from cookie or request header
 */
export async function getAuthenticatedUser(customToken?: string): Promise<AuthenticatedUserContext | null> {
  let token = customToken;
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  }

  if (!token) {
    // Development / Demo Fallback: auto-resolve or seed default Apex Trust Administrator
    let devUser = await db.query.users.findFirst({
      where: eq(users.email, 'dharmadhikari@sringeri.org')
    });

    if (!devUser) {
      devUser = await db.query.users.findFirst({
        where: eq(users.email, 'admin@temple1.com')
      });
    }

    if (!devUser) {
      const [seededUser] = await db.insert(users).values({
        id: 'usr_vidhushekhara',
        name: 'Sri Sringeri Dharmaadhikari',
        email: 'dharmadhikari@sringeri.org',
        mobileNumber: '+91 8265 250123',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvn8h5qEhb1tDXNVQmH_C-7Bf3AF9LFkxb3WKWAvVYmxKc-TcXh1fjMMz-WjPg9zbdjB7Yrhy9eiYGkJBLgHovr8GAsE2ft4v7PT9xcRcGGi3JzCKWBozxxFHni9LfCSubIqySEm5J4TesuWgBjdcdegth7w_Lsgvd39ZpYyq-IgCKk-0lzzWXTvduEcTeXKyNURY3AzLe-YP0InifLRv0R4KmiNUF_JDCpbPVweyINkAPtpA7Rfnc7ZfS2hPyvRu8cJGasIwQyYQ',
        status: 'ACTIVE'
      }).returning();
      devUser = seededUser;
    }

    // Ensure default trust exists
    let sringeriTrust = await db.query.trusts.findFirst({
      where: eq(trusts.id, 'trust_sringeri')
    });
    if (!sringeriTrust) {
      await db.insert(trusts).values({
        id: 'trust_sringeri',
        tenantId: 'tenant_sringeri',
        legalName: 'Sri Sringeri Sharada Peetham Trust',
        status: 'ACTIVE'
      });
    }

    // Ensure trust membership
    const allTrusts = await db.query.trusts.findMany();
    for (const tr of allTrusts) {
      const tm = await db.query.trustMemberships.findFirst({
        where: and(eq(trustMemberships.userId, devUser.id), eq(trustMemberships.trustId, tr.id))
      });
      if (!tm) {
        await db.insert(trustMemberships).values({
          id: `tm_${devUser.id}_${tr.id}`,
          trustId: tr.id,
          userId: devUser.id,
          membershipType: 'GOVERNANCE_HEAD',
          status: 'ACTIVE'
        });
      }
    }

    const tMemberships = await db.query.trustMemberships.findMany({
      where: and(
        eq(trustMemberships.userId, devUser.id),
        eq(trustMemberships.status, 'ACTIVE')
      )
    });

    const allTemples = await db.query.temples.findMany();
    const trustMembershipsList = tMemberships.map(tm => {
      const trustObj = allTrusts.find(t => t.id === tm.trustId);
      return {
        trustId: tm.trustId,
        trustName: trustObj?.legalName || tm.trustId,
        membershipType: tm.membershipType,
        status: tm.status,
      };
    });

    return {
      user: {
        id: devUser.id,
        email: devUser.email,
        name: devUser.name,
        avatarUrl: devUser.avatarUrl,
        mobileNumber: devUser.mobileNumber,
      },
      trustMemberships: trustMembershipsList,
      templeMemberships: allTemples.map(t => ({
        trustId: t.trustId,
        templeId: t.id,
        templeName: t.name,
        templeCode: t.code,
        status: 'ACTIVE'
      }))
    };
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  // Fetch live user and memberships from DB
  let user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId)
  });

  if (!user && payload.email) {
    user = await db.query.users.findFirst({
      where: eq(users.email, payload.email.toLowerCase().trim())
    });
  }

  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  const tMemberships = await db.query.trustMemberships.findMany({
    where: and(
      eq(trustMemberships.userId, user.id),
      eq(trustMemberships.status, 'ACTIVE')
    )
  });

  const allTrusts = await db.query.trusts.findMany();
  const allTemples = await db.query.temples.findMany();

  const trustMembershipsList = tMemberships.map(tm => {
    const trustObj = allTrusts.find(t => t.id === tm.trustId);
    return {
      trustId: tm.trustId,
      trustName: trustObj?.legalName || tm.trustId,
      membershipType: tm.membershipType,
      status: tm.status,
    };
  });

  const tmpMemberships = await db.query.templeMemberships.findMany({
    where: and(
      eq(templeMemberships.userId, user.id),
      eq(templeMemberships.status, 'ACTIVE')
    )
  });

  const templeMembershipsList = tmpMemberships.map(tm => {
    const templeObj = allTemples.find(t => t.id === tm.templeId);
    return {
      trustId: tm.trustId,
      templeId: tm.templeId,
      templeName: templeObj?.name || tm.templeId,
      templeCode: templeObj?.code || '',
      status: tm.status,
    };
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      mobileNumber: user.mobileNumber,
    },
    trustMemberships: trustMembershipsList,
    templeMemberships: templeMembershipsList,
  };
}

export { SESSION_COOKIE_NAME };
