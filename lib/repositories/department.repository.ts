import { db } from '../db/client';
import { departments, auditEvents } from '../../db/schema';
import { eq, and, or, isNull } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface CreateDepartmentInput {
  name: string;
  templeId?: string | null;
  code?: string;
  color?: string;
  description?: string;
}

const DEFAULT_DEPARTMENTS = [
  { name: 'Spiritual / Dharmic', code: 'SPIRITUAL', color: '#ff7700', description: 'Archakas, Purohits, Veda Pathashala, and Pooja rituals' },
  { name: 'Administration', code: 'ADMIN', color: '#d4af37', description: 'Executive officers, trustee secretariats, and HR governance' },
  { name: 'Operations & Facilities', code: 'OPERATIONS', color: '#059669', description: 'Queue management, Annadanam, prasadam production, and facilities' },
  { name: 'Finance & Accounts', code: 'FINANCE', color: '#7c3aed', description: 'Hundi collections, bank treasury, accounting, and audit reconciliation' }
];

export class DepartmentRepository {
  /**
   * Lists dynamic departments scoped to a Trust or specific Temple.
   * Auto-provisions standard default departments if none exist for the tenant.
   */
  async listDepartments(ctx: RequestContext, filter?: { templeId?: string }) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: filter?.templeId || ctx.trustId,
      action: 'trust.governance.view',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const conditions = [
      eq(departments.trustId, ctx.trustId),
      eq(departments.status, 'ACTIVE')
    ];

    if (filter?.templeId) {
      // Include trust-wide departments and temple-specific departments
      conditions.push(
        or(isNull(departments.templeId), eq(departments.templeId, filter.templeId)) as any
      );
    }

    let list = await db.query.departments.findMany({
      where: and(...conditions),
      orderBy: (departments, { asc }) => [asc(departments.name)]
    });

    // Seed default departments if none exist yet for this trust
    if (list.length === 0) {
      for (const def of DEFAULT_DEPARTMENTS) {
        const deptId = `dept_${ctx.trustId}_${def.code.toLowerCase()}`;
        await db.insert(departments).values({
          id: deptId,
          trustId: ctx.trustId,
          templeId: filter?.templeId || null,
          name: def.name,
          code: def.code,
          color: def.color,
          description: def.description,
          status: 'ACTIVE'
        });
      }

      list = await db.query.departments.findMany({
        where: and(...conditions),
        orderBy: (departments, { asc }) => [asc(departments.name)]
      });
    }

    return list;
  }

  /**
   * Create a new custom dynamic department on the fly
   */
  async createDepartment(ctx: RequestContext, input: CreateDepartmentInput) {
    const scopeId = input.templeId || ctx.trustId;
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const name = input.name.trim();
    const code = input.code ? input.code.trim().toUpperCase() : name.substring(0, 4).toUpperCase();
    const deptId = `dept_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const [created] = await db.insert(departments).values({
      id: deptId,
      trustId: ctx.trustId,
      templeId: input.templeId || null,
      name,
      code,
      color: input.color || '#ff7700',
      description: input.description || null,
      status: 'ACTIVE'
    }).returning();

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'DEPARTMENT_CREATED',
      targetType: 'department',
      targetId: deptId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: {
        name,
        code,
        templeId: input.templeId
      }
    });

    return created;
  }
}

export const departmentRepository = new DepartmentRepository();
