import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';
import {
  MasterType,
  MasterCategoryItem,
  DEFAULT_TRUSTEE_CATEGORIES,
  DEFAULT_MEMBERSHIP_TYPES,
  DEFAULT_COMMITTEE_CATEGORIES
} from '../types/masters';

export {
  type MasterType,
  type MasterCategoryItem,
  DEFAULT_TRUSTEE_CATEGORIES,
  DEFAULT_MEMBERSHIP_TYPES,
  DEFAULT_COMMITTEE_CATEGORIES
};

// In-memory tenant store for dynamic custom masters
const customMastersStore: Map<string, MasterCategoryItem[]> = new Map();

function getSeededDefaults(trustId: string): MasterCategoryItem[] {
  const now = new Date().toISOString();
  const allDefaults = [
    ...DEFAULT_TRUSTEE_CATEGORIES,
    ...DEFAULT_MEMBERSHIP_TYPES,
    ...DEFAULT_COMMITTEE_CATEGORIES
  ];

  return allDefaults.map((d) => ({
    ...d,
    id: `mstr_${d.type.toLowerCase()}_${d.code.toLowerCase()}_${trustId}`,
    trustId,
    createdAt: now,
    updatedAt: now
  }));
}

export class MastersRepository {
  /**
   * List master categories for a trust
   */
  async listMasters(ctx: RequestContext, type?: MasterType): Promise<MasterCategoryItem[]> {
    let trustItems = customMastersStore.get(ctx.trustId);
    if (!trustItems) {
      trustItems = getSeededDefaults(ctx.trustId);
      customMastersStore.set(ctx.trustId, trustItems);
    }

    let results = trustItems.filter(item => item.status === 'ACTIVE');
    if (type) {
      results = results.filter(item => item.type === type);
    }

    return results.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  /**
   * Create or add a new Master category
   */
  async createMaster(
    ctx: RequestContext,
    input: {
      type: MasterType;
      name: string;
      code?: string;
      description?: string;
      color?: string;
      icon?: string;
    }
  ): Promise<MasterCategoryItem> {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    let trustItems = customMastersStore.get(ctx.trustId);
    if (!trustItems) {
      trustItems = getSeededDefaults(ctx.trustId);
      customMastersStore.set(ctx.trustId, trustItems);
    }

    const code = input.code
      ? input.code.toUpperCase().replace(/[^A-Z0-9_]/g, '_')
      : input.name.toUpperCase().replace(/[^A-Z0-9_]/g, '_').substring(0, 32);

    // Check duplicate
    const existing = trustItems.find(item => item.type === input.type && item.name.toLowerCase() === input.name.trim().toLowerCase());
    if (existing) {
      if (existing.status === 'ARCHIVED') {
        existing.status = 'ACTIVE';
        existing.updatedAt = new Date().toISOString();
        return existing;
      }
      return existing;
    }

    const now = new Date().toISOString();
    const newItem: MasterCategoryItem = {
      id: `mstr_${input.type.toLowerCase()}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      trustId: ctx.trustId,
      type: input.type,
      code,
      name: input.name.trim(),
      description: input.description?.trim() || '',
      color: input.color || 'amber',
      icon: input.icon || 'Sparkles',
      isSystemDefault: false,
      status: 'ACTIVE',
      orderIndex: trustItems.filter(i => i.type === input.type).length + 1,
      createdAt: now,
      updatedAt: now
    };

    trustItems.push(newItem);
    customMastersStore.set(ctx.trustId, trustItems);
    return newItem;
  }

  /**
   * Update a Master category
   */
  async updateMaster(
    ctx: RequestContext,
    id: string,
    input: {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      status?: 'ACTIVE' | 'ARCHIVED';
    }
  ): Promise<MasterCategoryItem> {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    let trustItems = customMastersStore.get(ctx.trustId);
    if (!trustItems) {
      trustItems = getSeededDefaults(ctx.trustId);
      customMastersStore.set(ctx.trustId, trustItems);
    }

    const index = trustItems.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error(`Master category with id '${id}' not found`);
    }

    const current = trustItems[index];
    const updated: MasterCategoryItem = {
      ...current,
      name: input.name?.trim() || current.name,
      description: input.description !== undefined ? input.description.trim() : current.description,
      color: input.color || current.color,
      icon: input.icon || current.icon,
      status: input.status || current.status,
      updatedAt: new Date().toISOString()
    };

    trustItems[index] = updated;
    customMastersStore.set(ctx.trustId, trustItems);
    return updated;
  }

  /**
   * Delete or archive a Master category
   */
  async deleteMaster(ctx: RequestContext, id: string): Promise<{ success: boolean; id: string }> {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    let trustItems = customMastersStore.get(ctx.trustId);
    if (!trustItems) {
      trustItems = getSeededDefaults(ctx.trustId);
      customMastersStore.set(ctx.trustId, trustItems);
    }

    const index = trustItems.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error(`Master category with id '${id}' not found`);
    }

    // Soft delete / archive
    trustItems[index].status = 'ARCHIVED';
    trustItems[index].updatedAt = new Date().toISOString();
    customMastersStore.set(ctx.trustId, trustItems);

    return { success: true, id };
  }
}

export const mastersRepository = new MastersRepository();
