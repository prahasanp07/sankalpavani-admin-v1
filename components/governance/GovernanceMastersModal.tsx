'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Crown,
  Users,
  Layers,
  Sparkles,
  Shield,
  Award,
  Check,
  Trash2,
  AlertCircle,
  Tag,
  Bookmark
} from 'lucide-react';
import { MasterType, MasterCategoryItem } from '@/lib/types/masters';

interface GovernanceMastersModalProps {
  isOpen: boolean;
  onClose: () => void;
  trustId: string;
  initialTab?: MasterType;
  onMasterUpdated?: () => void;
}

export default function GovernanceMastersModal({
  isOpen,
  onClose,
  trustId,
  initialTab = 'TRUSTEE_CATEGORY',
  onMasterUpdated
}: GovernanceMastersModalProps) {
  const [activeTab, setActiveTab] = useState<MasterType>(initialTab);
  const [masters, setMasters] = useState<MasterCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Category Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('amber');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const fetchMasters = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/masters?type=${activeTab}`);
      if (res.ok) {
        const json = await res.json();
        setMasters(json.data || []);
      }
    } catch (err: any) {
      setErrorMessage('Failed to load master categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMasters();
    }
  }, [isOpen, activeTab, trustId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/masters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          name: name.trim(),
          code: code.trim() || undefined,
          description: description.trim() || undefined,
          color
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to add master category');
      }

      setName('');
      setCode('');
      setDescription('');
      setSuccessMessage('Category added successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);

      await fetchMasters();
      onMasterUpdated?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the active master list?`)) return;

    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/masters?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchMasters();
        onMasterUpdated?.();
      }
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-3xl border border-outline-variant/50 max-w-2xl w-full p-6 shadow-sacred max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b divider-gold">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Bookmark size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-primary">Governance Masters Management</h3>
              <p className="text-xs text-on-surface-variant">Configure Trust, Membership & Committee Master Taxonomies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('TRUSTEE_CATEGORY')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'TRUSTEE_CATEGORY'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Crown size={14} />
            <span>Trust Categories</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MEMBERSHIP_TYPE')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'MEMBERSHIP_TYPE'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Users size={14} />
            <span>Membership Types</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMMITTEE_CATEGORY')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'COMMITTEE_CATEGORY'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Layers size={14} />
            <span>Committee Categories</span>
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2">
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Add New Category Form */}
        <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-3">
          <h4 className="font-serif text-xs font-bold text-primary flex items-center gap-1.5">
            <Plus size={14} /> Add New Master Category
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Hereditary Trustee, Dharma Rakshaka"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface">Unique Code (Optional)</label>
              <input
                type="text"
                placeholder="e.g. HEREDITARY_TRUSTEE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface">Description / Purpose</label>
            <input
              type="text"
              placeholder="Describe criteria, powers, or ceremonial scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sacred hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              <Plus size={14} />
              <span>{isSubmitting ? 'Saving...' : 'Add to Master List'}</span>
            </button>
          </div>
        </form>

        {/* Existing Categories List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface">Active Categories ({masters.length})</span>
            <span className="text-[10px] text-on-surface-variant">System defaults are highlighted with badge</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-on-surface-variant">Loading categories...</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {masters.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface">{item.name}</span>
                      {item.isSystemDefault ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 border border-amber-500/20">
                          System Preset
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          Custom
                        </span>
                      )}
                      <span className="font-mono text-[9px] text-on-surface-variant">[{item.code}]</span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-on-surface-variant truncate">{item.description}</p>
                    )}
                  </div>

                  {!item.isSystemDefault && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-error/10 transition-colors cursor-pointer"
                      title="Archive category"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface font-bold text-xs hover:bg-surface-container cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
