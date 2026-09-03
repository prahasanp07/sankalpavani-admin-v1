'use client';

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Crown, 
  FileText, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  AlertCircle,
  Sparkles,
  Building2,
  Shield
} from 'lucide-react';

export interface AppointTrusteeFormData {
  name: string;
  avatarUrl?: string;
  trusteeType: string;
  designationName: string;
  phone: string;
  email: string;
  gotra: string;
  termStart: string;
  termEnd: string;
  isLifeTerm: boolean;
  resolutionNo: string;
  responsibilities: string;
}

const TRUSTEE_CATEGORIES = [
  'Managing Trustee / Dharmadhikari',
  'Hereditary Trustee (Vamshaparamparya)',
  'Endowment / Govt Nominated Trustee',
  'Elected Board Trustee',
  'Nominated Trustee',
  'Life Trustee',
  'Advisory Board Member'
];

interface AppointTrusteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointTrusteeFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function AppointTrusteeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}: AppointTrusteeModalProps) {
  const [formData, setFormData] = useState<AppointTrusteeFormData>({
    name: '',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    trusteeType: 'Elected Board Trustee',
    designationName: 'Trust Board Member',
    phone: '',
    email: '',
    gotra: '',
    termStart: new Date().toISOString().split('T')[0],
    termEnd: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 year default
    isLifeTerm: false,
    resolutionNo: '',
    responsibilities: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please enter the Trustee / Board Member full name.');
      return;
    }
    if (!formData.designationName.trim()) {
      setErrorMsg('Please enter the Trustee designation.');
      return;
    }

    try {
      setErrorMsg('');
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to appoint trustee.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-[scaleUp_0.25s_ease-out]">
        
        {/* Modal Header */}
        <div className="p-6 border-b divider-gold flex items-center justify-between bg-surface-container-low/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Crown size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-primary">Appoint Trustee / Board Member</h3>
              <p className="font-sans text-xs text-on-surface-variant">Formalize tenure appointments & legal board resolutions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto hide-scrollbar text-xs">
          
          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2 border border-error/30 animate-[shake_0.3s_ease-in-out]">
              <AlertCircle size={15} className="shrink-0 text-error" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-on-surface mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Srikanth Sastry / Sri Vidyaranya"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Designation / Title *</label>
              <input
                type="text"
                required
                value={formData.designationName}
                onChange={(e) => setFormData({ ...formData, designationName: e.target.value })}
                placeholder="e.g. Managing Trustee / Treasurer / Vice President"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Trustee Category Dropdown */}
          <div>
            <label className="block font-bold text-on-surface mb-1">Trustee Category *</label>
            <select
              value={formData.trusteeType}
              onChange={(e) => setFormData({ ...formData, trusteeType: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer font-medium"
            >
              {TRUSTEE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Contact Details & Gotra */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-on-surface mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98450 00000"
                className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="trustee@sringeri.org"
                className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Gotra</label>
              <input
                type="text"
                value={formData.gotra}
                onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                placeholder="e.g. Kashyapa / Vasishta"
                className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Tenure & Legal Appointment Section */}
          <div className="p-4 bg-surface-container/50 rounded-2xl border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Calendar size={13} /> Tenure & Term Limits
              </span>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-on-surface">
                <input
                  type="checkbox"
                  checked={formData.isLifeTerm}
                  onChange={(e) => setFormData({ ...formData, isLifeTerm: e.target.checked })}
                  className="accent-primary w-4 h-4 rounded cursor-pointer"
                />
                <span>Life Trustee (Permanent)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-on-surface-variant mb-1">Appointment Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.termStart}
                  onChange={(e) => setFormData({ ...formData, termStart: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              {!formData.isLifeTerm && (
                <div>
                  <label className="block font-bold text-on-surface-variant mb-1">Appointment End Date</label>
                  <input
                    type="date"
                    value={formData.termEnd}
                    onChange={(e) => setFormData({ ...formData, termEnd: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>

            {/* Explicitly Labeled Board Resolution / Order Number */}
            <div className="pt-2 border-t border-outline-variant/20">
              <label className="block font-bold text-amber-900 mb-1 flex items-center gap-1">
                <FileText size={13} className="text-amber-700" />
                <span>Board Resolution / Order Number (Optional)</span>
              </label>
              <input
                type="text"
                value={formData.resolutionNo}
                onChange={(e) => setFormData({ ...formData, resolutionNo: e.target.value })}
                placeholder="e.g. TR-2026/04 or GOV-ENDOW/8892/2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono placeholder:text-on-surface-variant/40"
              />
              <p className="font-sans text-[11px] text-on-surface-variant/80 mt-1">
                Capture official legal audit reference number or government endowment gazette order.
              </p>
            </div>
          </div>

          {/* Responsibilities & Portfolio */}
          <div>
            <label className="block font-bold text-on-surface mb-1">Key Duties & Portfolio Oversight</label>
            <textarea
              rows={2}
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              placeholder="e.g. Overseeing Veda Pathashala expansion, statutory financial audits, and Jeernodharana projects..."
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t divider-gold flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container border border-outline-variant/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-[#7a4300] text-on-primary shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Check size={16} strokeWidth={2.5} />
              <span>{isSubmitting ? 'Appointing...' : 'Formalize Appointment'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
