'use client';

import React, { useState, useEffect, useRef } from 'react';
import TimeRangePicker from './TimeRangePicker';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  Save,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Camera,
  Plus,
  Trash2,
  Star,
  Smile
} from 'lucide-react';

interface TempleInfoProps {
  onBack: () => void;
  isCreationMode?: boolean;
  trustId?: string;
  onSaveSuccess?: (newTempleId: string) => void;
}

interface DarshanTimingConfig {
  morning: string;
  evening: string;
}

interface TempleDetails {
  code?: string;
  templeName: string;
  primaryDeity?: string;
  status?: 'ACTIVE' | 'OPERATIONAL' | 'MAINTENANCE' | 'SUSPENDED';
  address: string;
  phone: string;
  email: string;
  website: string;
  googleMapsLink: string;
  darshanMorning: string;
  darshanEvening: string;
  tagline?: string;
  officialHotline?: string;
  officialEmail?: string;
  capacityPerSlot: number;
  sthalaMahime?: string;
  photos?: string[];
  primaryPhotoIndex?: number;
  bannerPhotoIndex?: number;
  timingsNormal?: DarshanTimingConfig;
  timingsWeekends?: DarshanTimingConfig;
  timingsDhanurMasa?: DarshanTimingConfig;
  timingsSpecialOccasions?: DarshanTimingConfig;
  isDraft?: boolean;
}

const DEFAULT_DETAILS: TempleDetails = {
  code: 'VST-01',
  templeName: 'Sri Vidyashankara Temple',
  primaryDeity: 'Lord Vidyashankara (Shiva Linga)',
  status: 'ACTIVE',
  address: 'Sri Sringeri Math, Harihara Street, Sringeri, Chikkamagaluru, Karnataka 577139',
  phone: '+91 82652 50123',
  email: 'info@vidyashankara.org',
  website: 'https://sringeri.net/temples/vidyashankara',
  googleMapsLink: 'https://maps.google.com/?q=Sri+Vidyashankara+Temple+Sringeri',
  darshanMorning: '06:00 AM - 12:30 PM',
  darshanEvening: '04:30 PM - 09:00 PM',
  capacityPerSlot: 150,
  sthalaMahime: 'Consecrated by Jagadguru Sri Vidyaranya in memory of Guru Vidyashankara, this historic sanctum offers a serene spiritual haven with 12 zodiac stone pillars aligning with the solar calendar.',
  photos: [
    'https://images.unsplash.com/photo-1602631985686-2bb06089d482?auto=format&fit=crop&q=80&w=800'
  ],
  primaryPhotoIndex: 0,
  bannerPhotoIndex: 0,
  timingsNormal: { morning: '06:00 AM - 12:30 PM', evening: '04:30 PM - 09:00 PM' },
  timingsWeekends: { morning: '06:00 AM - 01:30 PM', evening: '04:00 PM - 09:30 PM' },
  timingsDhanurMasa: { morning: '04:30 AM - 12:00 PM', evening: '05:00 PM - 08:30 PM' },
  timingsSpecialOccasions: { morning: '05:00 AM - 10:00 PM (Continuous)', evening: 'N/A' }
};

const NEW_TEMPLE_DETAILS: TempleDetails = {
  code: '',
  templeName: '',
  primaryDeity: '',
  status: 'ACTIVE',
  address: '',
  phone: '',
  email: '',
  website: '',
  googleMapsLink: '',
  darshanMorning: '06:00 AM - 12:30 PM',
  darshanEvening: '04:30 PM - 09:00 PM',
  capacityPerSlot: 150,
  sthalaMahime: '',
  photos: [
    'https://images.unsplash.com/photo-1602631985686-2bb06089d482?auto=format&fit=crop&q=80&w=800'
  ],
  primaryPhotoIndex: 0,
  bannerPhotoIndex: 0,
  timingsNormal: { morning: '06:00 AM - 12:30 PM', evening: '04:30 PM - 09:00 PM' },
  timingsWeekends: { morning: '06:00 AM - 01:30 PM', evening: '04:00 PM - 09:30 PM' },
  timingsDhanurMasa: { morning: '04:30 AM - 12:00 PM', evening: '05:00 PM - 08:30 PM' },
  timingsSpecialOccasions: { morning: '05:00 AM - 10:00 PM (Continuous)', evening: 'N/A' }
};

export default function TempleInfo({ onBack, isCreationMode = false, trustId = 'trust_sringeri', onSaveSuccess }: TempleInfoProps) {
  const [details, setDetails] = useState<TempleDetails>(() => {
    if (isCreationMode) {
      return { ...NEW_TEMPLE_DETAILS };
    }
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sankalpvani_temple_details');
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Partial<TempleDetails>;
          return { ...DEFAULT_DETAILS, ...parsed };
        } catch (e) {
          console.error('Failed to parse temple details from storage', e);
        }
      }
    }
    return { ...DEFAULT_DETAILS };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load from backend API on mount (only when not creating a new temple)
  useEffect(() => {
    if (isCreationMode) return;
    async function loadBackendInfo() {
      try {
        const res = await fetch(`/api/v1/temples/temple_vidyashankara/info?trustId=${trustId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.temple) {
            const t = json.data.temple;
            const s = json.data.settings;
            setDetails(prev => ({
              ...prev,
              code: t.code || prev.code,
              templeName: t.name || prev.templeName,
              primaryDeity: (t.contactJson as any)?.deity || t.deity || prev.primaryDeity,
              status: t.status || prev.status,
              tagline: s.tagline || prev.tagline,
              officialHotline: s.hotline || prev.officialHotline,
              officialEmail: s.officialEmail || prev.officialEmail,
              website: s.websiteUrl || prev.website,
              googleMapsLink: s.mapsUrl || prev.googleMapsLink,
              photos: s.photos?.length > 0 ? s.photos : prev.photos,
              primaryPhotoIndex: s.primaryPhotoIndex ?? prev.primaryPhotoIndex
            }));
          }
        }
      } catch (err) {
        console.warn('Using local temple details fallback');
      }
    }
    loadBackendInfo();
  }, [isCreationMode, trustId]);

  const [openPanels, setOpenPanels] = useState({
    normal: true,
    weekends: false,
    dhanur: false,
    special: false
  });

  const [openSections, setOpenSections] = useState({
    generalIdentity: true,
    darshanTimings: false,
    uploadPhotos: true
  });

  const togglePanel = (panel: 'normal' | 'weekends' | 'dhanur' | 'special') => {
    setOpenPanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const changePrimaryInputRef = useRef<HTMLInputElement>(null);

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const photos = details.photos || [];
    if (photos.length >= 5) {
      alert("Maximum of 5 photos are allowed. Please delete an existing photo to upload a new one.");
      return;
    }

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newPhotoUrl = event.target.result as string;
        setDetails({
          ...details,
          photos: [...photos, newPhotoUrl]
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleChangePrimaryPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newPhotoUrl = event.target.result as string;
        const photos = details.photos || [];
        const primaryIdx = details.primaryPhotoIndex ?? 0;

        if (photos.length === 0) {
          setDetails({
            ...details,
            photos: [newPhotoUrl],
            primaryPhotoIndex: 0
          });
        } else {
          const newPhotos = [...photos];
          newPhotos[primaryIdx] = newPhotoUrl;
          setDetails({
            ...details,
            photos: newPhotos
          });
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSetPrimary = (index: number) => {
    setDetails({
      ...details,
      primaryPhotoIndex: index
    });
  };

  const handleSetBanner = (index: number) => {
    setDetails({
      ...details,
      bannerPhotoIndex: index
    });
  };

  const handleDeletePhoto = (index: number) => {
    const photos = details.photos || [];
    const primaryIdx = details.primaryPhotoIndex ?? 0;
    const bannerIdx = details.bannerPhotoIndex ?? 0;

    const newPhotos = photos.filter((_, i) => i !== index);

    let newPrimaryIdx = primaryIdx;
    if (primaryIdx === index) {
      newPrimaryIdx = 0;
    } else if (primaryIdx > index) {
      newPrimaryIdx = primaryIdx - 1;
    }

    let newBannerIdx = bannerIdx;
    if (bannerIdx === index) {
      newBannerIdx = 0;
    } else if (bannerIdx > index) {
      newBannerIdx = bannerIdx - 1;
    }

    setDetails({
      ...details,
      photos: newPhotos,
      primaryPhotoIndex: newPrimaryIdx,
      bannerPhotoIndex: newBannerIdx
    });
  };

  const triggerAddPhoto = () => {
    if ((details.photos || []).length >= 5) {
      alert("Maximum of 5 photos are allowed. Please delete an existing photo to upload a new one.");
      return;
    }
    fileInputRef.current?.click();
  };

  const triggerChangePrimary = () => {
    changePrimaryInputRef.current?.click();
  };

  const isFormValid = () => {
    return (
      (details.code ? details.code.trim() !== '' : true) &&
      details.templeName.trim() !== '' &&
      details.address.trim() !== ''
    );
  };

  const handleSave = async (publish: boolean) => {
    setIsSaving(true);
    setSuccess(false);

    const updatedDetails = {
      ...details,
      isDraft: !publish
    };

    try {
      if (isCreationMode) {
        // Generate a clean code from input or name (e.g. "Sri Venkateswara" -> "SVT-03")
        const inputCode = updatedDetails.code?.trim().toUpperCase();
        const codePrefix = updatedDetails.templeName
          .split(' ')
          .map(w => w[0]?.toUpperCase() || '')
          .slice(0, 3)
          .join('') || 'TMP';
        const code = inputCode || `${codePrefix}-${Math.floor(10 + Math.random() * 90)}`;

        const res = await fetch(`/api/v1/trusts/${trustId}/temples`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updatedDetails.templeName,
            code: code,
            deity: updatedDetails.primaryDeity,
            tagline: updatedDetails.tagline || (updatedDetails.primaryDeity ? `Sanctum of ${updatedDetails.primaryDeity}` : 'Sanctum of Peace & Divinity'),
            description: updatedDetails.sthalaMahime || 'Sacred temple under the Divine Trust.',
            addressJson: { address: updatedDetails.address },
            contactJson: {
              hotline: updatedDetails.officialHotline || updatedDetails.phone,
              email: updatedDetails.officialEmail || updatedDetails.email,
              phone: updatedDetails.phone,
              deity: updatedDetails.primaryDeity
            },
            status: updatedDetails.status || (publish ? 'ACTIVE' : 'MAINTENANCE')
          })
        });

        if (res.ok) {
          const json = await res.json();
          const newId = json.data?.id || `temple_${Date.now()}`;
          setIsSaving(false);
          setSuccess(true);
          if (onSaveSuccess) {
            setTimeout(() => onSaveSuccess(newId), 1200);
          }
          return;
        }
      } else {
        await fetch(`/api/v1/temples/temple_vidyashankara/info?trustId=${trustId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: updatedDetails.code,
            name: updatedDetails.templeName,
            deity: updatedDetails.primaryDeity,
            status: updatedDetails.status,
            tagline: updatedDetails.tagline,
            hotline: updatedDetails.officialHotline || updatedDetails.phone,
            officialEmail: updatedDetails.officialEmail || updatedDetails.email,
            websiteUrl: updatedDetails.website,
            mapsUrl: updatedDetails.googleMapsLink,
            primaryPhotoIndex: updatedDetails.primaryPhotoIndex,
            photos: updatedDetails.photos
          })
        });
      }
    } catch (e) {
      console.warn('Backend save fallback to local storage', e);
    }

    localStorage.setItem('sankalpvani_temple_details', JSON.stringify(updatedDetails));
    setDetails(updatedDetails);
    if (publish) {
      window.dispatchEvent(new Event('sankalpvani_temple_details_updated'));
    }
    setIsSaving(false);
    setSuccess(true);
    if (isCreationMode && onSaveSuccess) {
      setTimeout(() => onSaveSuccess(`temple_${Date.now()}`), 1200);
    } else {
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(true);
  };

  const photos = details.photos || [];
  const primaryIndex = details.primaryPhotoIndex ?? 0;
  const bannerIndex = details.bannerPhotoIndex ?? 0;
  const primaryPhoto = photos[primaryIndex] || null;
  const isPrimaryBanner = bannerIndex === primaryIndex;
  const nonPrimaryPhotos = photos
    .map((url, idx) => ({ url, originalIndex: idx }))
    .filter((item) => item.originalIndex !== primaryIndex);

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Toast */}
      {success && (
        <div className="fixed top-6 right-6 z-50 bg-green-100 text-green-800 border border-green-200 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-green-600 animate-bounce" />
          <span className="font-sans text-sm font-semibold">Temple Details updated successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-primary-container/10 rounded-full text-primary transition-colors cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary tracking-wider uppercase mb-0.5">
              <span>Masters</span>
              <ChevronRight size={12} className="text-on-surface-variant" />
              <span>Temple Core Info</span>
            </div>
            <h2 className="font-serif text-3xl font-semibold text-primary">Temple Information</h2>
          </div>
        </div>
      </div>

      {/* Form Grid layout */}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24">

        {/* Left Columns - Form parameters */}
        <div className="lg:col-span-8 space-y-6">
          {/* Accordion: General Identity */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSections(prev => ({ ...prev, generalIdentity: !prev.generalIdentity }))}
              className="w-full flex items-center justify-between px-6 py-4 bg-surface-container/15 hover:bg-surface-container/30 transition-all text-left font-serif cursor-pointer select-none border-b border-outline-variant/20"
            >
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                General Identity
              </h3>
              {openSections.generalIdentity ? <ChevronDown size={20} className="text-primary" /> : <ChevronRight size={20} className="text-on-surface-variant" />}
            </button>
            {openSections.generalIdentity && (
              <div className="p-6 space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Code - Placed before Temple Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Code (Unique ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VST-01"
                      value={details.code ?? ''}
                      onChange={(e) => setDetails({ ...details, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm font-mono uppercase placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Temple Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Temple Official Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sri Vidyashankara Temple / Sri Sharadamba Devasthanam"
                      value={details.templeName}
                      onChange={(e) => setDetails({ ...details, templeName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Deity / Sanctum */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Primary Deity / Sanctum
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lord Vidyashankara (Shiva Linga) / Goddess Sharadamba"
                      value={details.primaryDeity ?? ''}
                      onChange={(e) => setDetails({ ...details, primaryDeity: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Initial Status / Sanctum Status Dropdown */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Sanctum Initial Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={details.status || 'ACTIVE'}
                      onChange={(e) => setDetails({ ...details, status: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer font-medium"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="OPERATIONAL">Operational</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Physical Address</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Sri Sringeri Math, Harihara Street, Sringeri, Chikkamagaluru, Karnataka 577139"
                    value={details.address}
                    onChange={(e) => setDetails({ ...details, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
                      <Phone size={12} className="text-primary" /> Telephone Hotline
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 82652 50123 / +91 98450 12345"
                      value={details.phone}
                      onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
                      <Mail size={12} className="text-primary" /> Official Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. info@vidyashankara.org / info@sringeri.org"
                      value={details.email}
                      onChange={(e) => setDetails({ ...details, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
                      <Globe size={12} className="text-primary" /> Digital Portal Address URL
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="e.g. https://sringeri.net/temples/vidyashankara"
                      value={details.website}
                      onChange={(e) => setDetails({ ...details, website: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
                      <MapPin size={12} className="text-primary" /> Google Maps Link
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="e.g. https://maps.google.com/?q=Sri+Vidyashankara+Temple+Sringeri"
                      value={details.googleMapsLink}
                      onChange={(e) => setDetails({ ...details, googleMapsLink: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Sthala Mahime</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Consecrated by Jagadguru Sri Adi Shankaracharya, this historic sanctum offers a serene spiritual haven with 12 zodiac stone pillars aligning with the solar calendar..."
                    value={details.sthalaMahime ?? ''}
                    onChange={(e) => setDetails({ ...details, sthalaMahime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Accordion: Darshan Timings */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSections(prev => {
                const nextDarshan = !prev.darshanTimings;
                return {
                  ...prev,
                  darshanTimings: nextDarshan,
                  generalIdentity: nextDarshan ? false : prev.generalIdentity
                };
              })}
              className="w-full flex items-center justify-between px-6 py-4 bg-surface-container/15 hover:bg-surface-container/30 transition-all text-left font-serif cursor-pointer select-none border-b border-outline-variant/20"
            >
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                Darshan Timings
              </h3>
              {openSections.darshanTimings ? <ChevronDown size={20} className="text-primary" /> : <ChevronRight size={20} className="text-on-surface-variant" />}
            </button>
            {openSections.darshanTimings && (
              <div className="p-6 space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-4">
                  {/* Expansion Panel: Normal Days */}
                  <div className="border border-outline-variant/25 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => togglePanel('normal')}
                      className="w-full flex items-center justify-between px-4 py-3.5 bg-surface-container/30 hover:bg-surface-container/60 transition-all text-left font-sans cursor-pointer select-none"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Normal Days (General Weekdays)
                      </span>
                      {openPanels.normal ? <ChevronDown size={16} className="text-primary" /> : <ChevronRight size={16} className="text-on-surface-variant" />}
                    </button>
                    {openPanels.normal && (
                      <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.2s_ease-out]">
                        <TimeRangePicker
                          label="Morning Slots"
                          value={details.timingsNormal?.morning ?? ''}
                          onChange={(val) => setDetails({
                            ...details,
                            timingsNormal: { ...(details.timingsNormal || { morning: '', evening: '' }), morning: val }
                          })}
                        />
                        <TimeRangePicker
                          label="Evening Slots"
                          value={details.timingsNormal?.evening ?? ''}
                          onChange={(val) => setDetails({
                            ...details,
                            timingsNormal: { ...(details.timingsNormal || { morning: '', evening: '' }), evening: val }
                          })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Expansion Panel: Weekends */}
                  <div className="border border-outline-variant/25 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => togglePanel('weekends')}
                      className="w-full flex items-center justify-between px-4 py-3.5 bg-surface-container/30 hover:bg-surface-container/60 transition-all text-left font-sans cursor-pointer select-none"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Weekends (Saturdays & Sundays)
                      </span>
                      {openPanels.weekends ? <ChevronDown size={16} className="text-primary" /> : <ChevronRight size={16} className="text-on-surface-variant" />}
                    </button>
                    {openPanels.weekends && (
                      <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.2s_ease-out]">
                        <TimeRangePicker
                          label="Morning Slots"
                          value={details.timingsWeekends?.morning ?? ''}
                          onChange={(val) => setDetails({
                            ...details,
                            timingsWeekends: { ...(details.timingsWeekends || { morning: '', evening: '' }), morning: val }
                          })}
                        />
                        <TimeRangePicker
                          label="Evening Slots"
                          value={details.timingsWeekends?.evening ?? ''}
                          onChange={(val) => setDetails({
                            ...details,
                            timingsWeekends: { ...(details.timingsWeekends || { morning: '', evening: '' }), evening: val }
                          })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Expansion Panel: Dhanur Masa */}
                  <div className="border border-outline-variant/25 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => togglePanel('dhanur')}
                      className="w-full flex items-center justify-between px-4 py-3.5 bg-surface-container/30 hover:bg-surface-container/60 transition-all text-left font-sans cursor-pointer select-none"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Dhanur Masa Season (Special Month)
                      </span>
                      {openPanels.dhanur ? <ChevronDown size={16} className="text-primary" /> : <ChevronRight size={16} className="text-on-surface-variant" />}
                    </button>
                    {openPanels.dhanur && (
                      <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.2s_ease-out]">
                        <TimeRangePicker
                          label="Morning Slots"
                          value={details.timingsDhanurMasa?.morning ?? ''}
                          onChange={(val) => setDetails({
                            ...details,
                            timingsDhanurMasa: { ...(details.timingsDhanurMasa || { morning: '', evening: '' }), morning: val }
                          })}
                        />
                        <TimeRangePicker
                          label="Evening Slots"
                          value={details.timingsDhanurMasa?.evening ?? ''}
                          onChange={(val) => setDetails({
                            ...details,
                            timingsDhanurMasa: { ...(details.timingsDhanurMasa || { morning: '', evening: '' }), evening: val }
                          })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Expansion Panel: Special Occasions */}
                  <div className="border border-outline-variant/25 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => togglePanel('special')}
                      className="w-full flex items-center justify-between px-4 py-3.5 bg-surface-container/30 hover:bg-surface-container/60 transition-all text-left font-sans cursor-pointer select-none"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Special Occasion Days (Festivals, Utsavas)
                      </span>
                      {openPanels.special ? <ChevronDown size={16} className="text-primary" /> : <ChevronRight size={16} className="text-on-surface-variant" />}
                    </button>
                    {openPanels.special && (
                      <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.2s_ease-out]">
                        <TimeRangePicker
                          label="Morning Slots"
                          value={details.timingsSpecialOccasions?.morning ?? ''}
                          onChange={(val) => setDetails({
                            ...details,
                            timingsSpecialOccasions: { ...(details.timingsSpecialOccasions || { morning: '', evening: '' }), morning: val }
                          })}
                        />
                        <TimeRangePicker
                          label="Evening Slots"
                          value={details.timingsSpecialOccasions?.evening ?? ''}
                          onChange={(val) => setDetails({
                            ...details,
                            timingsSpecialOccasions: { ...(details.timingsSpecialOccasions || { morning: '', evening: '' }), evening: val }
                          })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Max Hourly Queue Capacity */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Max Hourly Queue Capacity (Devotees/Slot)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150"
                      value={details.capacityPerSlot}
                      onChange={(e) => setDetails({ ...details, capacityPerSlot: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-primary border-b divider-gold pb-3 mb-4">
              Public Relations & Social Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
                  <Phone size={12} className="text-primary" /> Telephone Hotline
                </label>
                <input
                  type="text"
                  required
                  value={details.phone}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
                  <Mail size={12} className="text-primary" /> Official Email
                </label>
                <input
                  type="email"
                  required
                  value={details.email}
                  onChange={(e) => setDetails({ ...details, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
                  <Globe size={12} className="text-primary" /> Digital Portal Address URL
                </label>
                <input
                  type="url"
                  required
                  value={details.website}
                  onChange={(e) => setDetails({ ...details, website: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>
          </div> */}

        </div>

        {/* Right Columns - Info widgets & Submit */}
        <div className="lg:col-span-4 space-y-6">



          {/* Accordion: Upload your photos */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSections(prev => ({ ...prev, uploadPhotos: !prev.uploadPhotos }))}
              className="w-full flex items-center justify-between px-6 py-4 bg-surface-container/15 hover:bg-surface-container/30 transition-all text-left font-serif cursor-pointer select-none border-b border-outline-variant/20"
            >
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                Upload your photos
              </h3>
              {openSections.uploadPhotos ? <ChevronDown size={16} className="text-primary" /> : <ChevronRight size={16} className="text-on-surface-variant" />}
            </button>
            {openSections.uploadPhotos && (
              <div className="p-6 space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="grid grid-cols-3 gap-3 aspect-square">
                  {/* Primary image slot (spans 2 columns, 2 rows) */}
                  <div className="col-span-2 row-span-2 relative aspect-square rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-low group shadow-inner">
                    {primaryPhoto ? (
                      <>
                        <img src={primaryPhoto} alt="Primary Temple Photo" className="w-full h-full object-cover" />

                        {/* Banner Selected visual badge overlay */}
                        {isPrimaryBanner && (
                          <div className="absolute top-2 left-2 bg-primary text-on-primary text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md z-10">
                            <Sparkles size={9} className="fill-current" />
                            <span>Banner Selected</span>
                          </div>
                        )}

                        {/* Hover action overlays */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10">
                          <button
                            type="button"
                            onClick={() => handleSetBanner(primaryIndex)}
                            className={`p-1.5 rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center ${isPrimaryBanner
                              ? 'bg-primary text-on-primary'
                              : 'bg-white text-on-surface hover:bg-primary hover:text-on-primary'
                              }`}
                            title="Set as Dashboard Banner"
                          >
                            <Sparkles size={12} className={isPrimaryBanner ? 'fill-current' : ''} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(primaryIndex)}
                            className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all cursor-pointer shadow-md flex items-center justify-center"
                            title="Delete Image"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Bottom glassmorphic overlay pill */}
                        <button
                          type="button"
                          onClick={triggerChangePrimary}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/45 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-1 hover:bg-black/60 transition-all shadow-md cursor-pointer whitespace-nowrap z-10"
                        >
                          <Camera size={10} />
                          <span>Change Photo</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <Smile className="text-outline-variant/40 w-10 h-10 mb-2" />
                        <button
                          type="button"
                          onClick={triggerAddPhoto}
                          className="bg-primary text-on-primary text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                        >
                          <Plus size={10} />
                          <span>Add Primary</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 5 small image slots */}
                  {[...Array(5)].map((_, i) => {
                    const isUploaded = i < nonPrimaryPhotos.length;
                    if (isUploaded) {
                      const photoItem = nonPrimaryPhotos[i];
                      const isPhotoBanner = bannerIndex === photoItem.originalIndex;
                      return (
                        <div key={i} className="col-span-1 aspect-square rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-low relative group shadow-sm">
                          <img src={photoItem.url} alt={`Temple Photo ${i + 1}`} className="w-full h-full object-cover" />

                          {/* Banner Selected status badge */}
                          {isPhotoBanner && (
                            <div className="absolute top-1.5 left-1.5 bg-primary text-on-primary text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md z-10">
                              <Sparkles size={8} className="fill-current" />
                            </div>
                          )}

                          {/* Hover action overlays */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(photoItem.originalIndex)}
                              className="p-1.5 bg-white text-on-surface hover:bg-primary hover:text-on-primary rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center"
                              title="Set as Primary"
                            >
                              <Star size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetBanner(photoItem.originalIndex)}
                              className={`p-1.5 rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center ${isPhotoBanner
                                ? 'bg-primary text-on-primary'
                                : 'bg-white text-on-surface hover:bg-primary hover:text-on-primary'
                                }`}
                              title="Set as Dashboard Banner"
                            >
                              <Sparkles size={11} className={isPhotoBanner ? 'fill-current' : ''} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photoItem.originalIndex)}
                              className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all cursor-pointer shadow-md flex items-center justify-center"
                              title="Delete Photo"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={i} className="col-span-1 aspect-square rounded-2xl border border-outline-variant/20 bg-surface-container-low flex flex-col items-center justify-center p-1.5 relative shadow-sm">
                          {/* Custom smiley SVG matching the screenshot */}
                          <svg className="w-7 h-7 text-outline-variant/30 fill-current mb-1.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="9" cy="9.5" r="1.2" className="text-surface-container-low fill-current" fill="#f4f0f6" />
                            <circle cx="15" cy="9.5" r="1.2" className="text-surface-container-low fill-current" fill="#f4f0f6" />
                            <path d="M12 16.5c2.1 0 3.9-1.2 4.7-3H7.3c.8 1.8 2.6 3 4.7 3z" className="text-surface-container-low fill-current" fill="#f4f0f6" />
                          </svg>

                          <button
                            type="button"
                            onClick={triggerAddPhoto}
                            className="bg-[#8F4E00] text-white hover:bg-[#7a4300] text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            <Plus size={8} />
                            <span>Add</span>
                          </button>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadPhoto}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={changePrimaryInputRef}
              onChange={handleChangePrimaryPhoto}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Commented out Verification Badges
          <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 p-6 space-y-4">
            <h4 className="font-sans text-sm font-bold text-on-surface flex items-center gap-1.5 text-primary">
              <Sparkles size={14} /> Verification Badges
            </h4>
            <div className="space-y-3 font-sans text-xs font-semibold text-on-surface-variant">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <span>Google Maps API</span>
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Synced
                </span>
              </div>
            </div>
          </div>
          */}




        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-t border-outline-variant/30 py-4 px-6 md:px-8 flex items-center justify-between shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl hidden sm:inline" style={{ fontVariationSettings: "'FILL' 1" }}>
              temple_hindu
            </span>
            <div>
              <h4 className="font-serif text-sm font-bold text-on-surface">Temple Core Info</h4>
              <p className="font-sans text-[10px] text-on-surface-variant font-medium hidden md:block">
                Propagate changes live to mobile apps, kiosks, and online bookings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving || !details.templeName.trim()}
              onClick={() => handleSave(false)}
              className="bg-surface-container-low hover:bg-primary-container/10 border border-outline-variant/40 text-on-surface-variant hover:text-primary px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Save size={14} />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={isSaving || !isFormValid()}
              onClick={() => handleSave(true)}
              className="bg-primary hover:bg-on-primary-container text-on-primary px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <CheckCircle size={14} />
              <span>Save & Publish</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

