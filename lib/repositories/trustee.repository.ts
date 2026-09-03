import { db } from '../db/client';
import { 
  trusts, 
  users, 
  personProfiles, 
  trustMemberships, 
  designations, 
  officeBearers, 
  auditEvents 
} from '../../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface AppointTrusteeInput {
  name: string;
  email: string;
  phone?: string;
  gotra?: string;
  avatarUrl?: string;
  designationId?: string;
  customDesignationName?: string;
  trusteeType: string;
  cadreRank?: string;
  termStart: string; // ISO string
  termEnd?: string | null; // ISO string
  resolutionNo?: string;
  responsibilities?: string;
  notes?: string;
}

export interface UpdateTrusteeInput {
  name?: string;
  email?: string;
  phone?: string;
  gotra?: string;
  avatarUrl?: string;
  designationId?: string;
  trusteeType?: string;
  cadreRank?: string;
  termStart?: string;
  termEnd?: string | null;
  resolutionNo?: string;
  appointmentStatus?: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED';
  responsibilities?: string;
  notes?: string;
}

export interface CreateDesignationInput {
  name: string;
  description?: string;
  scopeType?: 'TRUST' | 'TEMPLE';
  scopeId?: string;
}

export class TrusteeRepository {
  /**
   * List all dynamic designations for a Trust
   */
  async listDesignations(ctx: RequestContext, scopeType: 'TRUST' | 'TEMPLE' = 'TRUST', scopeId?: string) {
    const targetScopeId = scopeId || ctx.trustId;

    const items = await db.query.designations.findMany({
      where: and(
        eq(designations.trustId, ctx.trustId),
        eq(designations.scopeType, scopeType),
        eq(designations.scopeId, targetScopeId)
      ),
      orderBy: (designations, { asc }) => [asc(designations.name)]
    });

    // If no designations exist yet, seed common initial presets
    if (items.length === 0 && scopeType === 'TRUST') {
      const defaultTitles = [
        { name: 'President / Chairman', description: 'Apex head of Trust Board' },
        { name: 'Managing Trustee / Dharmadhikari', description: 'Managing trustee with operational & traditional authority' },
        { name: 'Vice President', description: 'Deputy presiding officer' },
        { name: 'General Secretary', description: 'Chief secretarial trustee' },
        { name: 'Treasurer / Bhandari', description: 'Custodian of sacred treasury and financial accounts' },
        { name: 'Joint Secretary', description: 'Joint secretarial administration' },
        { name: 'Executive Trustee', description: 'Standing executive board trustee' },
        { name: 'Trustee Member', description: 'General board of trustees member' },
        { name: 'Advisory Committee Member', description: 'External traditional or legal advisor' }
      ];

      const inserted = await Promise.all(
        defaultTitles.map(async (t) => {
          const id = `desig_${t.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
          const [res] = await db.insert(designations).values({
            id,
            trustId: ctx.trustId,
            scopeType: 'TRUST',
            scopeId: ctx.trustId,
            name: t.name,
            description: t.description,
            status: 'ACTIVE',
            createdBy: ctx.userId
          }).returning();
          return res;
        })
      );
      return inserted;
    }

    return items;
  }

  /**
   * Dynamically create a new designation / title
   */
  async createDesignation(ctx: RequestContext, input: CreateDesignationInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const scopeType = input.scopeType || 'TRUST';
    const scopeId = input.scopeId || ctx.trustId;
    const name = input.name.trim();

    const existing = await db.query.designations.findFirst({
      where: and(
        eq(designations.trustId, ctx.trustId),
        eq(designations.scopeType, scopeType),
        eq(designations.scopeId, scopeId),
        eq(designations.name, name)
      )
    });

    if (existing) {
      return existing;
    }

    const id = `desig_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
    const [created] = await db.insert(designations).values({
      id,
      trustId: ctx.trustId,
      scopeType,
      scopeId,
      name,
      description: input.description || '',
      status: 'ACTIVE',
      createdBy: ctx.userId
    }).returning();

    return created;
  }

  /**
   * List all trustees and trust board members
   */
  async listTrustees(ctx: RequestContext) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.view',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const appointments = await db.query.officeBearers.findMany({
      where: and(
        eq(officeBearers.trustId, ctx.trustId),
        eq(officeBearers.scopeId, ctx.trustId)
      ),
      orderBy: (officeBearers, { desc }) => [desc(officeBearers.createdAt)]
    });

    const results = await Promise.all(
      appointments.map(async (app) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, app.userId)
        });

        const profile = await db.query.personProfiles.findFirst({
          where: and(
            eq(personProfiles.userId, app.userId),
            eq(personProfiles.trustId, ctx.trustId)
          )
        });

        const designation = await db.query.designations.findFirst({
          where: eq(designations.id, app.designationId)
        });

        const metadata = (app.metadataJson as any) || {};

        return {
          id: app.id,
          trustId: app.trustId,
          userId: app.userId,
          name: profile?.fullName || user?.name || 'Unknown Trustee',
          email: user?.email || '',
          phone: profile?.phone || user?.mobileNumber || '',
          gotra: profile?.gotra || '',
          avatarUrl: user?.avatarUrl || profile?.photoUrl || '',
          designationId: app.designationId,
          designationName: designation?.name || 'Trustee',
          designationDescription: designation?.description || '',
          trusteeType: metadata.trusteeType || 'Elected Board Trustee',
          cadreRank: metadata.cadreRank || 'Apex Governance & Trust Board',
          responsibilities: metadata.responsibilities || '',
          notes: metadata.notes || '',
          resolutionNo: app.resolutionNo || '',
          termStart: app.termStart,
          termEnd: app.termEnd,
          isLifeTerm: !app.termEnd,
          appointmentStatus: app.appointmentStatus,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt
        };
      })
    );

    return results;
  }

  /**
   * Appoint a new Trustee / Trust Board Member
   */
  async appointTrustee(ctx: RequestContext, input: AppointTrusteeInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();

    // 1. Resolve or Create User
    let user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      const userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const [createdUser] = await db.insert(users).values({
        id: userId,
        email,
        name,
        mobileNumber: input.phone || null,
        avatarUrl: input.avatarUrl || null,
        status: 'ACTIVE'
      }).returning();
      user = createdUser;
    }

    // 2. Resolve or Create Person Profile
    let profile = await db.query.personProfiles.findFirst({
      where: and(
        eq(personProfiles.userId, user.id),
        eq(personProfiles.trustId, ctx.trustId)
      )
    });

    if (!profile) {
      const profileId = `pp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const [createdProfile] = await db.insert(personProfiles).values({
        id: profileId,
        trustId: ctx.trustId,
        userId: user.id,
        fullName: name,
        gotra: input.gotra || null,
        phone: input.phone || null,
        photoUrl: input.avatarUrl || null
      }).returning();
      profile = createdProfile;
    } else if (input.gotra || input.phone || input.avatarUrl) {
      await db.update(personProfiles)
        .set({
          fullName: name,
          gotra: input.gotra ?? profile.gotra,
          phone: input.phone ?? profile.phone,
          photoUrl: input.avatarUrl ?? profile.photoUrl,
          updatedAt: new Date()
        })
        .where(eq(personProfiles.id, profile.id));
    }

    // 3. Ensure Trust Membership
    const existingMembership = await db.query.trustMemberships.findFirst({
      where: and(
        eq(trustMemberships.trustId, ctx.trustId),
        eq(trustMemberships.userId, user.id)
      )
    });

    if (!existingMembership) {
      await db.insert(trustMemberships).values({
        id: `tmb_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        trustId: ctx.trustId,
        userId: user.id,
        status: 'ACTIVE',
        membershipType: 'TRUSTEE',
        validFrom: new Date(input.termStart),
        validUntil: input.termEnd ? new Date(input.termEnd) : null
      });
    }

    // 4. Resolve Designation
    let designationId = input.designationId;
    if (!designationId && input.customDesignationName) {
      const createdDesig = await this.createDesignation(ctx, {
        name: input.customDesignationName,
        scopeType: 'TRUST',
        scopeId: ctx.trustId
      });
      designationId = createdDesig.id;
    }

    if (!designationId) {
      // Default to Trustee Member designation
      const defaultDesig = await db.query.designations.findFirst({
        where: and(
          eq(designations.trustId, ctx.trustId),
          eq(designations.name, 'Trustee Member')
        )
      });
      if (defaultDesig) {
        designationId = defaultDesig.id;
      } else {
        const created = await this.createDesignation(ctx, {
          name: 'Trustee Member',
          description: 'Member of the Apex Trust Board'
        });
        designationId = created.id;
      }
    }

    // 5. Insert Office Bearer Appointment
    const appointmentId = `ob_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const metadataJson = {
      trusteeType: input.trusteeType,
      cadreRank: input.cadreRank || 'Apex Governance & Trust Board',
      responsibilities: input.responsibilities || '',
      notes: input.notes || ''
    };

    const [appointment] = await db.insert(officeBearers).values({
      id: appointmentId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      userId: user.id,
      designationId,
      termStart: new Date(input.termStart),
      termEnd: input.termEnd ? new Date(input.termEnd) : null,
      resolutionNo: input.resolutionNo || null,
      metadataJson,
      appointmentStatus: 'ACTIVE',
      appointedBy: ctx.userId
    }).returning();

    // 6. Record Audit Event
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'TRUSTEE_APPOINTED',
      targetType: 'office_bearer',
      targetId: appointmentId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: {
        trusteeName: name,
        trusteeEmail: email,
        designationId,
        trusteeType: input.trusteeType,
        resolutionNo: input.resolutionNo,
        termStart: input.termStart,
        termEnd: input.termEnd
      }
    });

    return appointment;
  }

  /**
   * Update an existing trustee appointment
   */
  async updateTrusteeAppointment(ctx: RequestContext, appointmentId: string, input: UpdateTrusteeInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const appointment = await db.query.officeBearers.findFirst({
      where: and(
        eq(officeBearers.id, appointmentId),
        eq(officeBearers.trustId, ctx.trustId)
      )
    });

    if (!appointment) {
      throw new Error(`Trustee appointment '${appointmentId}' not found.`);
    }

    const updates: Partial<typeof officeBearers.$inferInsert> = {
      updatedAt: new Date()
    };

    if (input.designationId) updates.designationId = input.designationId;
    if (input.termStart) updates.termStart = new Date(input.termStart);
    if (input.termEnd !== undefined) updates.termEnd = input.termEnd ? new Date(input.termEnd) : null;
    if (input.resolutionNo !== undefined) updates.resolutionNo = input.resolutionNo;
    if (input.appointmentStatus) updates.appointmentStatus = input.appointmentStatus;

    const currentMeta = (appointment.metadataJson as any) || {};
    const updatedMeta = {
      ...currentMeta,
      ...(input.trusteeType ? { trusteeType: input.trusteeType } : {}),
      ...(input.cadreRank ? { cadreRank: input.cadreRank } : {}),
      ...(input.responsibilities !== undefined ? { responsibilities: input.responsibilities } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {})
    };
    updates.metadataJson = updatedMeta;

    await db.update(officeBearers)
      .set(updates)
      .where(and(eq(officeBearers.id, appointmentId), eq(officeBearers.trustId, ctx.trustId)));

    // Update person profile details if provided
    if (input.name || input.phone || input.gotra || input.avatarUrl) {
      await db.update(personProfiles)
        .set({
          ...(input.name ? { fullName: input.name } : {}),
          ...(input.phone ? { phone: input.phone } : {}),
          ...(input.gotra ? { gotra: input.gotra } : {}),
          ...(input.avatarUrl ? { photoUrl: input.avatarUrl } : {}),
          updatedAt: new Date()
        })
        .where(and(eq(personProfiles.userId, appointment.userId), eq(personProfiles.trustId, ctx.trustId)));
    }

    // Record Audit
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'TRUSTEE_UPDATED',
      targetType: 'office_bearer',
      targetId: appointmentId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { updatedFields: Object.keys(input) }
    });

    return db.query.officeBearers.findFirst({
      where: and(eq(officeBearers.id, appointmentId), eq(officeBearers.trustId, ctx.trustId))
    });
  }

  /**
   * Update Trustee Status (e.g. Expired, Resigned, Revoked)
   */
  async updateTrusteeStatus(ctx: RequestContext, appointmentId: string, status: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED', reason?: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    await db.update(officeBearers)
      .set({
        appointmentStatus: status,
        updatedAt: new Date()
      })
      .where(and(eq(officeBearers.id, appointmentId), eq(officeBearers.trustId, ctx.trustId)));

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'TRUSTEE_STATUS_CHANGED',
      targetType: 'office_bearer',
      targetId: appointmentId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { newStatus: status, reason }
    });

    return { appointmentId, status };
  }
}

export const trusteeRepository = new TrusteeRepository();
