import { db } from '../db/client';
import { 
  temples, 
  templeSettings, 
  templeSchedules, 
  templeFacilities, 
  organizationNodes, 
  auditEvents,
  sevas,
  templeStaffAssignments
} from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface CreateTempleInput {
  name: string;
  code: string;
  tagline?: string;
  description?: string;
  deity?: string;
  addressJson?: Record<string, any>;
  locationJson?: Record<string, any>;
  contactJson?: {
    hotline?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  status?: 'ACTIVE' | 'OPERATIONAL' | 'SUSPENDED' | 'MAINTENANCE';
}

export interface UpdateTempleInput {
  name?: string;
  code?: string;
  deity?: string;
  addressJson?: Record<string, any>;
  locationJson?: Record<string, any>;
  contactJson?: Record<string, any>;
  status?: 'ACTIVE' | 'OPERATIONAL' | 'SUSPENDED' | 'MAINTENANCE';
}

export interface UpdateTempleInfoInput {
  name?: string;
  code?: string;
  deity?: string;
  status?: 'ACTIVE' | 'OPERATIONAL' | 'SUSPENDED' | 'MAINTENANCE';
  tagline?: string;
  description?: string;
  hotline?: string;
  officialEmail?: string;
  websiteUrl?: string;
  mapsUrl?: string;
  primaryPhotoIndex?: number;
  photos?: string[];
}

export class TempleRepository {
  /**
   * List all temples under a trust (Scoped by Trust ID)
   */
  async listTemples(ctx: RequestContext) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.temple.list',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const templeList = await db.query.temples.findMany({
      where: eq(temples.trustId, ctx.trustId),
      orderBy: (temples, { asc }) => [asc(temples.name)]
    });

    const results = await Promise.all(
      templeList.map(async (t) => {
        const settings = await db.query.templeSettings.findFirst({
          where: and(
            eq(templeSettings.templeId, t.id),
            eq(templeSettings.trustId, ctx.trustId)
          )
        });

        // Basic counts for display
        const activeSevaCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(sevas)
          .where(and(eq(sevas.templeId, t.id), eq(sevas.trustId, ctx.trustId)));

        const activePriestCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(templeStaffAssignments)
          .where(and(eq(templeStaffAssignments.templeId, t.id), eq(templeStaffAssignments.trustId, ctx.trustId), eq(templeStaffAssignments.status, 'Active')));

        return {
          id: t.id,
          trustId: t.trustId,
          code: t.code,
          name: t.name,
          status: t.status,
          addressJson: t.addressJson,
          locationJson: t.locationJson,
          contactJson: t.contactJson,
          tagline: settings?.tagline || '',
          description: settings?.description || '',
          hotline: settings?.hotline || (t.contactJson as any)?.hotline || '',
          officialEmail: settings?.officialEmail || (t.contactJson as any)?.email || '',
          websiteUrl: settings?.websiteUrl || '',
          mapsUrl: settings?.mapsUrl || '',
          photos: settings?.photos || [],
          activeSevas: Number(activeSevaCount[0]?.count || 0),
          activePriests: Number(activePriestCount[0]?.count || 0),
          createdAt: t.createdAt,
          updatedAt: t.updatedAt
        };
      })
    );

    return results;
  }

  /**
   * Dynamically create a new temple under a Trust
   */
  async createTemple(ctx: RequestContext, input: CreateTempleInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.temple.create',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const normalizedCode = input.code.trim().toUpperCase();
    const existing = await db.query.temples.findFirst({
      where: and(
        eq(temples.trustId, ctx.trustId),
        eq(temples.code, normalizedCode)
      )
    });

    if (existing) {
      throw new Error(`A temple with code '${normalizedCode}' already exists in this Trust.`);
    }

    const templeId = `temple_${normalizedCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
    const orgNodeId = `node_${templeId}`;

    // Ensure or find Trust Root Node
    let rootNode = await db.query.organizationNodes.findFirst({
      where: and(
        eq(organizationNodes.trustId, ctx.trustId),
        eq(organizationNodes.nodeType, 'ROOT')
      )
    });

    if (!rootNode) {
      const newRootId = `node_root_${ctx.trustId}`;
      const [createdRoot] = await db.insert(organizationNodes).values({
        id: newRootId,
        trustId: ctx.trustId,
        parentId: null,
        nodeType: 'ROOT',
        name: 'Trust Apex Root',
        materializedPath: `/${ctx.trustId}`,
        hierarchyVersion: 1,
        status: 'ACTIVE'
      }).returning();
      rootNode = createdRoot;
    }

    // Insert Organization Node for Temple
    const materializedPath = `${rootNode.materializedPath}/${orgNodeId}`;
    await db.insert(organizationNodes).values({
      id: orgNodeId,
      trustId: ctx.trustId,
      parentId: rootNode.id,
      nodeType: 'TEMPLE',
      name: input.name.trim(),
      materializedPath,
      hierarchyVersion: 1,
      status: 'ACTIVE'
    });

    // Insert Core Temple
    const contactJson = {
      hotline: input.contactJson?.hotline || '',
      email: input.contactJson?.email || '',
      phone: input.contactJson?.phone || '',
      deity: input.deity || '',
      ...(input.contactJson || {})
    };

    const [createdTemple] = await db.insert(temples).values({
      id: templeId,
      trustId: ctx.trustId,
      organizationNodeId: orgNodeId,
      code: normalizedCode,
      name: input.name.trim(),
      addressJson: input.addressJson || null,
      locationJson: input.locationJson || null,
      contactJson,
      status: input.status || 'ACTIVE'
    }).returning();

    // Insert Default Temple Settings
    await db.insert(templeSettings).values({
      id: `sett_${templeId}`,
      trustId: ctx.trustId,
      templeId,
      tagline: input.tagline || (input.deity ? `Sanctum of ${input.deity}` : ''),
      description: input.description || '',
      hotline: contactJson.hotline,
      officialEmail: contactJson.email,
      primaryPhotoIndex: 0,
      photos: []
    });

    // Insert Immutable Audit Event
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      templeId,
      actorUserId: ctx.userId,
      eventType: 'TEMPLE_CREATED',
      targetType: 'temple',
      targetId: templeId,
      action: 'trust.temple.create',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: {
        code: normalizedCode,
        name: input.name,
        organizationNodeId: orgNodeId
      }
    });

    return createdTemple;
  }

  /**
   * Fetch complete temple profile and schedules (Scoped to Trust & Temple)
   */
  async getTempleProfile(ctx: RequestContext, templeId: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.dashboard.view',
      resourceType: 'temple',
      resourceId: templeId
    });

    const temple = await db.query.temples.findFirst({
      where: and(
        eq(temples.id, templeId),
        eq(temples.trustId, ctx.trustId)
      )
    });

    if (!temple) return null;

    const settings = await db.query.templeSettings.findFirst({
      where: and(
        eq(templeSettings.templeId, templeId),
        eq(templeSettings.trustId, ctx.trustId)
      )
    });

    const schedules = await db.query.templeSchedules.findMany({
      where: and(
        eq(templeSchedules.templeId, templeId),
        eq(templeSchedules.trustId, ctx.trustId)
      )
    });

    const facilities = await db.query.templeFacilities.findMany({
      where: and(
        eq(templeFacilities.templeId, templeId),
        eq(templeFacilities.trustId, ctx.trustId)
      )
    });

    return {
      temple,
      settings: settings || {
        tagline: '',
        description: '',
        hotline: temple.contactJson ? (temple.contactJson as any).hotline : '',
        officialEmail: temple.contactJson ? (temple.contactJson as any).email : '',
        websiteUrl: '',
        mapsUrl: '',
        primaryPhotoIndex: 0,
        photos: []
      },
      schedules,
      facilities
    };
  }

  /**
   * Update core temple details
   */
  async updateTemple(ctx: RequestContext, templeId: string, input: UpdateTempleInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.info.manage',
      resourceType: 'temple',
      resourceId: templeId
    });

    const existing = await db.query.temples.findFirst({
      where: and(eq(temples.id, templeId), eq(temples.trustId, ctx.trustId))
    });

    if (!existing) {
      throw new Error(`Temple not found in the current Trust.`);
    }

    const updates: Partial<typeof temples.$inferInsert> = {
      updatedAt: new Date()
    };

    if (input.name) updates.name = input.name.trim();
    if (input.code) updates.code = input.code.trim().toUpperCase();
    if (input.addressJson !== undefined) updates.addressJson = input.addressJson;
    if (input.locationJson !== undefined) updates.locationJson = input.locationJson;
    if (input.contactJson !== undefined) updates.contactJson = input.contactJson;
    if (input.status) updates.status = input.status;

    await db.update(temples)
      .set(updates)
      .where(and(eq(temples.id, templeId), eq(temples.trustId, ctx.trustId)));

    // Update matching organizationNode name if name changed
    if (input.name && existing.organizationNodeId) {
      await db.update(organizationNodes)
        .set({ name: input.name.trim(), updatedAt: new Date() })
        .where(eq(organizationNodes.id, existing.organizationNodeId));
    }

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      templeId,
      actorUserId: ctx.userId,
      eventType: 'TEMPLE_UPDATED',
      targetType: 'temple',
      targetId: templeId,
      action: 'temple.info.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { updatedFields: Object.keys(input) }
    });

    return db.query.temples.findFirst({
      where: and(eq(temples.id, templeId), eq(temples.trustId, ctx.trustId))
    });
  }

  /**
   * Update Temple Lifecycle Status (ACTIVE | SUSPENDED | MAINTENANCE)
   */
  async updateTempleStatus(ctx: RequestContext, templeId: string, status: 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE') {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'trust.temple.manage',
      resourceType: 'temple',
      resourceId: templeId
    });

    await db.update(temples)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(temples.id, templeId), eq(temples.trustId, ctx.trustId)));

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      templeId,
      actorUserId: ctx.userId,
      eventType: 'TEMPLE_STATUS_CHANGED',
      targetType: 'temple',
      targetId: templeId,
      action: 'trust.temple.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { newStatus: status }
    });

    return { templeId, status };
  }

  /**
   * Mutate temple profile settings with server-side authorization and audit trail
   */
  async updateTempleProfile(ctx: RequestContext, templeId: string, input: UpdateTempleInfoInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.info.manage',
      resourceType: 'temple',
      resourceId: templeId
    });

    // Update Temple Core Table
    const templeUpdates: any = { updatedAt: new Date() };
    if (input.name) templeUpdates.name = input.name.trim();
    if (input.code) templeUpdates.code = input.code.trim().toUpperCase();
    if (input.status) templeUpdates.status = input.status;
    if (input.deity !== undefined) {
      const existingTemple = await db.query.temples.findFirst({
        where: and(eq(temples.id, templeId), eq(temples.trustId, ctx.trustId))
      });
      const contactJson = (existingTemple?.contactJson as Record<string, any>) || {};
      templeUpdates.contactJson = { ...contactJson, deity: input.deity };
    }

    if (Object.keys(templeUpdates).length > 1) {
      await db.update(temples)
        .set(templeUpdates)
        .where(and(eq(temples.id, templeId), eq(temples.trustId, ctx.trustId)));
    }

    // Upsert Settings
    const existing = await db.query.templeSettings.findFirst({
      where: and(eq(templeSettings.templeId, templeId), eq(templeSettings.trustId, ctx.trustId))
    });

    if (existing) {
      await db.update(templeSettings)
        .set({
          tagline: input.tagline ?? existing.tagline,
          description: input.description ?? existing.description,
          hotline: input.hotline ?? existing.hotline,
          officialEmail: input.officialEmail ?? existing.officialEmail,
          websiteUrl: input.websiteUrl ?? existing.websiteUrl,
          mapsUrl: input.mapsUrl ?? existing.mapsUrl,
          primaryPhotoIndex: input.primaryPhotoIndex ?? existing.primaryPhotoIndex,
          photos: input.photos ?? existing.photos,
          updatedAt: new Date()
        })
        .where(eq(templeSettings.id, existing.id));
    } else {
      await db.insert(templeSettings).values({
        id: `sett_${Date.now()}`,
        trustId: ctx.trustId,
        templeId,
        tagline: input.tagline,
        description: input.description,
        hotline: input.hotline,
        officialEmail: input.officialEmail,
        websiteUrl: input.websiteUrl,
        mapsUrl: input.mapsUrl,
        primaryPhotoIndex: input.primaryPhotoIndex ?? 0,
        photos: input.photos ?? []
      });
    }

    // Record Immutable Audit Event
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      templeId,
      actorUserId: ctx.userId,
      eventType: 'TEMPLE_PROFILE_UPDATED',
      targetType: 'temple',
      targetId: templeId,
      action: 'temple.info.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { fieldsUpdated: Object.keys(input) }
    });

    return this.getTempleProfile(ctx, templeId);
  }
}

export const templeRepository = new TempleRepository();
