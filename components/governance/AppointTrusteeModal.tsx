'use client';

import React, { useState, useEffect } from 'react';
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
  Shield,
  Compass,
  Moon
} from 'lucide-react';

export interface AppointTrusteeFormData {
  name: string;
  avatarUrl?: string;
  trusteeType: string;
  designationName: string;
  phone: string;
  email: string;
  gotra: string;
  nakshatra?: string;
  assignedTemples?: string[];
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

export const STANDARD_GOTRAS = [
  'Kashyapa',
  'Vasishta',
  'Bharadwaja',
  'Vishwamitra',
  'Gautama',
  'Jamadagni',
  'Atri',
  'Agastya',
  'Harita',
  'Kaundinya',
  'Mudgala',
  'Sandilya',
  'Garga',
  'Angirasa',
  'Kaushika',
  'Srivatsa',
  'Parashara',
  'Naidhruva',
  'Shathamarshana',
  'Kutsa'
];

export const STANDARD_NAKSHATRAS = [
  'Ashwini (ಅಶ್ವಿನಿ)',
  'Bharani (ಭರಣಿ)',
  'Krittika (ಕೃತಿಕಾ)',
  'Rohini (ರೋಹಿಣಿ)',
  'Mrigashira (ಮೃಗಶಿರಾ)',
  'Ardra (ಆರ್ದ್ರಾ)',
  'Punarvasu (ಪುನರ್ವಸು)',
  'Pushya (ಪುಷ್ಯ)',
  'Ashlesha (ಆಶ್ಲೇಷಾ)',
  'Magha (ಮಖಾ)',
  'Purva Phalguni (ಪುಬ್ಬಾ)',
  'Uttara Phalguni (ಉತ್ತರಾ)',
  'Hasta (ಹಸ್ತಾ)',
  'Chitra (ಚಿತ್ತಾ)',
  'Swati (ಸ್ವಾತಿ)',
  'Vishakha (ವಿಶಾಖಾ)',
  'Anuradha (ಅನುರಾಧಾ)',
  'Jyeshtha (ಜ್ಯೇಷ್ಠಾ)',
  'Mula (ಮೂಲಾ)',
  'Purva Ashadha (ಪೂರ್ವಾಷಾಢ)',
  'Uttara Ashadha (ಉತ್ತರಾಷಾಢ)',
  'Shravana (ಶ್ರವಣ)',
  'Dhanishta (ಧನಿಷ್ಠಾ)',
  'Shatabhisha (ಶತಭಿಷ)',
  'Purva Bhadrapada (ಪೂರ್ವಾಭಾದ್ರ)',
  'Uttara Bhadrapada (ಉತ್ತರಾಭಾದ್ರ)',
  'Revati (ರೇವತಿ)'
];

interface AppointTrusteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointTrusteeFormData) => Promise<void>;
  isSubmitting?: boolean;
  categories?: string[];
  availableTemples?: Array<{ id: string; name: string; code?: string }>;
}

export default function AppointTrusteeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  categories = TRUSTEE_CATEGORIES,
  availableTemples = [
    { id: 'temple_vidyashankara', name: 'Sri Vidyashankara Temple' },
    { id: 'temple_sharadamba', name: 'Sri Sharadamba Temple' }
  ]
}: AppointTrusteeModalProps) {
  const [formData, setFormData] = useState<AppointTrusteeFormData>({
    name: '',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    trusteeType: 'Elected Board Trustee',
    designationName: 'Trust Board Member',
    phone: '',
    email: '',
    gotra: '',
    nakshatra: '',
    assignedTemples: [],
    termStart: new Date().toISOString().split('T')[0],
    termEnd: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 year default
    isLifeTerm: false,
    resolutionNo: '',
    responsibilities: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleTemple = (templeName: string) => {
    setFormData(prev => {
      const current = prev.assignedTemples || [];
      const exists = current.includes(templeName);
      return {
        ...prev,
        assignedTemples: exists ? current.filter(t => t !== templeName) : [...current, templeName]
      };
    });
  };

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
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20 shrink-0">
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
                placeholder="Trust Board Member"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Row 2: Trustee Category & Email Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-on-surface mb-1">Trustee Category *</label>
              <select
                value={formData.trusteeType}
                onChange={(e) => setFormData({ ...formData, trusteeType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="trustee@sringeri.org"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Row 3: Phone Number, Gotra & Nakshatra */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-on-surface mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98450 00000"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1 flex items-center gap-1">
                <Compass size={11} className="text-amber-700" /> Gotra
              </label>
              <select
                value={formData.gotra}
                onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Select Gotra...</option>
                {STANDARD_GOTRAS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1 flex items-center gap-1">
                <Moon size={11} className="text-amber-700" /> Nakshatra
              </label>
              <select
                value={formData.nakshatra}
                onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Select Nakshatra...</option>
                {STANDARD_NAKSHATRAS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assign to Temples (Multi-Temple Scope) - Positioned directly above Tenure & Term Limits */}
          <div className="bg-surface-container/60 rounded-2xl border border-outline-variant/40 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-amber-700 shrink-0" />
              <span className="font-bold text-xs text-on-surface">
                Assign to Temples (Multi-Temple Scope)
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {availableTemples.map((temple) => {
                const isChecked = formData.assignedTemples?.includes(temple.name);
                return (
                  <label
                    key={temple.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${isChecked
                        ? 'bg-primary-container/20 border-primary text-primary font-bold shadow-xs'
                        : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTemple(temple.name)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/40"
                    />
                    <span>{temple.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Tenure & Legal Appointment Section */}
          <div className="p-4 bg-surface-container/60 rounded-2xl border border-outline-variant/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
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
                <label className="block font-semibold text-on-surface mb-1">Appointment Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.termStart}
                  onChange={(e) => setFormData({ ...formData, termStart: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-on-surface mb-1">Appointment End Date</label>
                <input
                  type="date"
                  disabled={formData.isLifeTerm}
                  value={formData.termEnd}
                  onChange={(e) => setFormData({ ...formData, termEnd: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary disabled:opacity-40"
                />
              </div>
            </div>

            {/* Board Resolution Number */}
            <div className="pt-1">
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold mb-1">
                <FileText size={13} />
                <span>Board Resolution / Order Number (Optional)</span>
              </div>
              <input
                type="text"
                value={formData.resolutionNo}
                onChange={(e) => setFormData({ ...formData, resolutionNo: e.target.value })}
                placeholder="e.g. TR-2026/04 or GOV-ENDOW/8892/2026"
                className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono placeholder:font-sans focus:outline-none focus:border-primary"
              />
              <p className="text-[10px] text-on-surface-variant mt-1">
                Capture official legal audit reference number or government endowment gazette order.
              </p>
            </div>
          </div>

          {/* Key Duties / Portfolios */}
          <div>
            <label className="block font-bold text-on-surface mb-1">Key Duties & Portfolio Oversight</label>
            <textarea
              rows={2}
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              placeholder="e.g. Overseeing Veda Pathashala expansion, statutory financial audits, and Jeernodharana projects..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary resize-y"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t divider-gold flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-outline-variant/40 font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-on-primary-container text-on-primary font-bold shadow-sacred hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check size={14} />
              <span>{isSubmitting ? 'Formalizing...' : 'Formalize Appointment'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
