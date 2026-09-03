'use client';

import React from 'react';
import { ArrowLeft, Network, Users2, Sparkles, Building2, Flame } from 'lucide-react';
import OrgChartCanvas from './org-chart/OrgChartCanvas';

interface OrgChartProps {
  onBack?: () => void;
}

export default function OrgChart({ onBack }: OrgChartProps) {
  return (
    <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Network size={14} />
            <span>Devasthanam Governance Structure</span>
          </div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 hover:bg-surface-container-high rounded-xl text-on-surface-variant transition-colors cursor-pointer"
                title="Go back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
              Temple Organization Chart & Matrix Reporting
            </h2>
          </div>
          <p className="font-sans text-xs md:text-sm text-on-surface-variant font-medium mt-1">
            Interactive dual-reporting hierarchy for temple priests (Spiritual / Saffron), administrative leadership (Admin / Gold), and cross-functional matrix oversight.
          </p>
        </div>
      </div>

      {/* Canvas View */}
      <OrgChartCanvas />
    </div>
  );
}
