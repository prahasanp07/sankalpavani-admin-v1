'use client';

import React from 'react';
import { 
  Phone, 
  Mail, 
  FileText, 
  Calendar, 
  Clock, 
  Crown, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Shield
} from 'lucide-react';

export interface TrusteeCardData {
  id: string;
  name: string;
  avatarUrl?: string;
  trusteeType: string;
  designationName: string;
  gotra?: string;
  phone?: string;
  email?: string;
  resolutionNo?: string;
  termStart: string;
  termEnd?: string | null;
  isLifeTerm?: boolean;
  appointmentStatus: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED';
  responsibilities?: string;
}

interface TrusteeCardProps {
  trustee: TrusteeCardData;
  onStatusChange?: (trusteeId: string, newStatus: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED') => void;
}

export default function TrusteeCard({ trustee, onStatusChange }: TrusteeCardProps) {
  // Calculate term progress and active/expired status based on current date
  const now = Date.now();
  const startDate = new Date(trustee.termStart).getTime();
  const endDate = trustee.termEnd ? new Date(trustee.termEnd).getTime() : null;

  const isExpiredByDate = !trustee.isLifeTerm && endDate !== null && endDate < now;
  const isCurrentlyActive = trustee.appointmentStatus === 'ACTIVE' && !isExpiredByDate;

  // Calculate percentage elapsed
  let percentElapsed = 0;
  let termString = '';

  if (trustee.isLifeTerm) {
    percentElapsed = 100;
    const startYear = new Date(trustee.termStart).getFullYear() || 2024;
    termString = `Term: ${startYear} – Permanent (Life Appointment)`;
  } else if (startDate && endDate) {
    const totalDuration = Math.max(endDate - startDate, 1);
    const elapsed = now - startDate;
    percentElapsed = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);

    const startYear = new Date(trustee.termStart).getFullYear();
    const endYear = new Date(trustee.termEnd!).getFullYear();
    termString = `Term: ${startYear}–${endYear}`;
  } else {
    const startYear = new Date(trustee.termStart).getFullYear() || 2024;
    termString = `Term: Since ${startYear} (Indefinite)`;
    percentElapsed = 50;
  }

  // Format full date strings for tooltip / details
  const formattedStart = new Date(trustee.termStart).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const formattedEnd = trustee.termEnd 
    ? new Date(trustee.termEnd).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Indefinite';

  return (
    <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between group">
      <div>
        {/* Top Header: Trustee Category & Dynamic Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-mono font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 truncate max-w-[200px]">
            {trustee.trusteeType}
          </span>

          {/* Dynamic Green Active or Grey Expired Badge */}
          {isCurrentlyActive ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
              <Clock size={10} className="text-gray-500" />
              <span>{trustee.appointmentStatus === 'RESIGNED' ? 'Resigned' : 'Expired'}</span>
            </span>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex items-start gap-3 mt-2">
          <img
            src={trustee.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
            alt={trustee.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 shrink-0 shadow-2xs"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-base font-bold text-on-surface truncate">
              {trustee.name}
            </h4>
            <p className="text-xs font-bold text-primary truncate">
              {trustee.designationName}
            </p>
            {trustee.gotra && (
              <p className="text-[11px] text-on-surface-variant">
                Gotra: {trustee.gotra}
              </p>
            )}
          </div>
        </div>

        {/* Term Lifecycle Progress Bar Visual */}
        <div className="mt-4 p-3 bg-surface-container/60 rounded-xl border border-outline-variant/25 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-on-surface-variant flex items-center gap-1">
              <Calendar size={11} className="text-primary" />
              <span>Tenure Timeline</span>
            </span>
            <span className="font-mono text-primary font-bold">
              {trustee.isLifeTerm ? 'Permanent' : `${percentElapsed}% Elapsed`}
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                trustee.isLifeTerm 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                  : percentElapsed >= 100 
                  ? 'bg-gray-400' 
                  : percentElapsed > 80 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${percentElapsed}%` }}
              role="progressbar"
              aria-valuenow={percentElapsed}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Human-Readable Term String */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="font-semibold text-on-surface font-sans">
              {termString}
            </span>
            <span className="text-[9px] text-on-surface-variant font-mono">
              {formattedStart} ➔ {formattedEnd}
            </span>
          </div>
        </div>

        {/* Contact & Legal Resolution Details */}
        <div className="mt-3 pt-2 space-y-1.5 text-[11px] text-on-surface-variant">
          {trustee.phone && (
            <div className="flex items-center gap-1.5">
              <Phone size={12} className="text-primary/70 shrink-0" />
              <span>{trustee.phone}</span>
            </div>
          )}
          {trustee.email && (
            <div className="flex items-center gap-1.5 truncate">
              <Mail size={12} className="text-primary/70 shrink-0" />
              <span className="truncate">{trustee.email}</span>
            </div>
          )}
          {trustee.resolutionNo && (
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-900 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <FileText size={12} className="text-amber-700 shrink-0" />
              <span>Resolution: {trustee.resolutionNo}</span>
            </div>
          )}
        </div>

        {trustee.responsibilities && (
          <p className="mt-2.5 text-[11px] text-on-surface-variant/90 italic line-clamp-2 bg-surface-container/40 p-2 rounded-lg border border-outline-variant/20">
            "{trustee.responsibilities}"
          </p>
        )}
      </div>

      {/* Action Controls */}
      {onStatusChange && (
        <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-2 text-xs">
          {isCurrentlyActive ? (
            <div className="flex items-center gap-1.5 w-full">
              <button
                type="button"
                onClick={() => onStatusChange(trustee.id, 'RESIGNED')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-[11px] font-bold transition-colors cursor-pointer text-center"
              >
                Mark Resigned
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(trustee.id, 'EXPIRED')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-[11px] font-bold transition-colors cursor-pointer text-center"
              >
                Expire Term
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onStatusChange(trustee.id, 'ACTIVE')}
              className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer text-center border border-emerald-200"
            >
              Re-Appoint to Board
            </button>
          )}
        </div>
      )}
    </div>
  );
}
