'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Database, Home, BookOpen, Settings, Users, Calendar, Sparkles } from 'lucide-react';
import TempleInfo from './TempleInfo';
import SevaMaster from './SevaMaster';
import TempleFacilities from './TempleFacilities';
import PriestMaster from './PriestMaster';
import Scheduling from './Scheduling';
import OrgChart from './OrgChart';

interface MastersHubProps {
  activeSubTab: string;
  onNavigate: (tabId: string) => void;
  isCreationMode?: boolean;
  trustId?: string;
  onSaveSuccess?: (newTempleId: string) => void;
  onBack?: () => void;
}

export default function MastersHub({
  activeSubTab,
  onNavigate,
  isCreationMode = false,
  trustId,
  onSaveSuccess,
  onBack
}: MastersHubProps) {
  const tabs = [
    { id: 'temple_info', title: 'General Details', icon: 'temple_hindu' },
    { id: 'seva_master', title: 'Seva Offerings', icon: 'menu_book' },
    { id: 'temple_facilities', title: 'Guest Facilities', icon: 'room_service' },
    { id: 'archaka_master', title: 'Archakas Registry', icon: 'account_box' },
    // { id: 'org_chart', title: 'Org Chart & Matrix', icon: 'schema' }, // TEMPORARILY COMMENTED OUT FROM UI
    { id: 'scheduling', title: 'Archakas Duty Roster', icon: 'calendar_month' }
  ];

  const handleBack = onBack || (() => onNavigate('dashboard'));

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-outline-variant/20 pb-4">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Database size={14} />
            <span>{isCreationMode ? 'New Temple Registration' : 'System Masters'}</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary font-semibold tracking-tight">
            {isCreationMode ? 'Add New Temple' : 'Masters Hub'}
          </h2>
          <p className="font-sans text-sm text-on-surface-variant font-medium mt-1">
            {isCreationMode
              ? 'Configure identity, offerings, facilities, and archakas for the new temple branch.'
              : 'Access and configure vital temple databases, parameters, resources, and scheduling systems.'}
          </p>
        </div>

        {/* Compact Subscription details & Upgrade */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-4 font-sans text-xs shrink-0 self-stretch lg:self-center">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <Sparkles size={14} className="text-primary" />
              <span>Sankalp Tier 1 (Basic)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-green-50 text-green-700 border border-green-200">
                Active
              </span>
            </div>
            <div className="text-[10px] text-on-surface-variant font-medium">
              Renewal: <span className="font-bold text-on-surface">31 Aug 2026</span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-outline-variant/40"></div>

          <div className="flex sm:flex-col gap-1.5 sm:gap-1 items-center sm:items-start justify-between w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
            <div className="text-[9px] text-on-surface-variant font-semibold">
              Upgrade to <span className="font-bold text-primary">Package 2</span>
            </div>
            <button
              type="button"
              onClick={() => alert('Redirecting to secure subscription payment gateway for Package 2 Upgrade...')}
              className="bg-[#8F4E00] hover:bg-[#7a4300] text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-outline-variant/30 overflow-x-auto hide-scrollbar bg-surface-container/20 p-1.5 rounded-2xl gap-1">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-95 ${isActive
                ? 'bg-primary text-on-primary shadow-md border border-primary'
                : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10 border border-transparent'
                }`}
            >
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px', fontVariationSettings: isActive ? "'FILL' 1" : undefined }}>
                {tab.icon}
              </span>
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Tab Content Container */}
      <div className="bg-surface-container-lowest/40 rounded-3xl p-1 md:p-2">
        {activeSubTab === 'temple_info' && (
          <TempleInfo
            onBack={handleBack}
            isCreationMode={isCreationMode}
            trustId={trustId}
            onSaveSuccess={onSaveSuccess}
          />
        )}
        {activeSubTab === 'seva_master' && (
          <SevaMaster onBack={handleBack} />
        )}
        {activeSubTab === 'temple_facilities' && (
          <TempleFacilities onBack={handleBack} />
        )}
        {activeSubTab === 'archaka_master' && (
          <PriestMaster onBack={handleBack} />
        )}
        {/* {activeSubTab === 'org_chart' && (
          <OrgChart onBack={handleBack} />
        )} */}
        {activeSubTab === 'scheduling' && (
          <Scheduling onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
