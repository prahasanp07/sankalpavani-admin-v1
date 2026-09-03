'use client';

import React from 'react';
import { 
  Phone, 
  Mail, 
  Building2, 
  Layers, 
  FileText, 
  Calendar, 
  Clock, 
  UserCheck, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface MemberCardData {
  id: string;
  name: string;
  photoUrl?: string;
  gotra?: string;
  membershipType: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  phone?: string;
  email?: string;
  termStart?: string;
  termEnd?: string | null;
  resolutionNo?: string;
  templeAssignments?: Array<{
    templeId: string;
    templeName: string;
    roleName: string;
    isPrimary: boolean;
  }>;
  committeeMemberships?: Array<{
    committeeId: string;
    committeeName: string;
    role: string;
  }>;
}

interface MemberCardProps {
  member: MemberCardData;
  onEdit?: (member: MemberCardData) => void;
  onAssignTemple?: (memberId: string) => void;
  onAssignCommittee?: (memberId: string) => void;
}

export default function MemberCard({
  member,
  onEdit,
  onAssignTemple,
  onAssignCommittee
}: MemberCardProps) {
  // Calculate term progress and active/expired status based on current date
  const now = Date.now();
  const startDate = member.termStart ? new Date(member.termStart).getTime() : null;
  const endDate = member.termEnd ? new Date(member.termEnd).getTime() : null;

  const isExpiredByDate = endDate !== null && endDate < now;
  const isCurrentlyActive = member.status === 'ACTIVE' && !isExpiredByDate;

  // Calculate percentage elapsed
  let percentElapsed = 0;
  let termString = '';

  if (startDate && endDate) {
    const totalDuration = Math.max(endDate - startDate, 1);
    const elapsed = now - startDate;
    percentElapsed = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);

    const startYear = new Date(member.termStart!).getFullYear();
    const endYear = new Date(member.termEnd!).getFullYear();
    termString = `Term: ${startYear}–${endYear}`;
  } else if (startDate) {
    const startYear = new Date(member.termStart!).getFullYear();
    termString = `Term: Since ${startYear}`;
    percentElapsed = 50;
  }

  return (
    <div className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between group">
      <div className="space-y-3.5">
        
        {/* Header: Membership Type & Dynamic Active / Expired Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            {member.membershipType}
          </span>

          {isCurrentlyActive ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
              <Clock size={10} className="text-gray-500" />
              <span>{member.status === 'SUSPENDED' ? 'Suspended' : 'Expired'}</span>
            </span>
          )}
        </div>

        {/* Member Profile Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold font-serif text-lg overflow-hidden shrink-0 shadow-2xs">
            {member.photoUrl ? (
              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <span>{member.name.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-base font-bold text-on-surface truncate">
              {member.name}
            </h4>
            {member.gotra && (
              <p className="text-[11px] text-on-surface-variant font-medium">
                Gotra: {member.gotra}
              </p>
            )}
          </div>
        </div>

        {/* Term Lifecycle Progress Bar Visual (If Term dates present) */}
        {member.termStart && (
          <div className="p-2.5 bg-surface-container/60 rounded-xl border border-outline-variant/25 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-on-surface-variant flex items-center gap-1">
                <Calendar size={11} className="text-primary" />
                <span>Appointment Lifecycle</span>
              </span>
              <span className="font-mono text-primary font-bold">
                {percentElapsed}% Elapsed
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  percentElapsed >= 100 
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
            <div className="flex items-center justify-between text-[10px] pt-0.5">
              <span className="font-semibold text-on-surface font-sans">
                {termString}
              </span>
              {member.termEnd && (
                <span className="text-[9px] text-on-surface-variant font-mono">
                  Ends: {new Date(member.termEnd).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact Information & Legal Resolution */}
        <div className="space-y-1 text-xs text-on-surface-variant">
          {member.phone && (
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-primary/70 shrink-0" />
              <span>{member.phone}</span>
            </div>
          )}
          {member.email && (
            <div className="flex items-center gap-2 truncate">
              <Mail size={13} className="text-primary/70 shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          {member.resolutionNo && (
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-900 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <FileText size={11} className="text-amber-700 shrink-0" />
              <span>Resolution: {member.resolutionNo}</span>
            </div>
          )}
        </div>

        {/* Multi-Temple Operational Assignments */}
        <div className="space-y-1.5 pt-1 border-t border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
              <Building2 size={11} /> Temple Assignments:
            </span>
            {onAssignTemple && (
              <button
                type="button"
                onClick={() => onAssignTemple(member.id)}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                + Assign
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {member.templeAssignments && member.templeAssignments.length > 0 ? (
              member.templeAssignments.map((ta, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${
                    ta.isPrimary
                      ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                      : 'bg-surface-container text-on-surface border-outline-variant/30'
                  }`}
                >
                  <Building2 size={10} />
                  <span>{ta.templeName}</span>
                  <span className="text-[9px] opacity-75">({ta.roleName})</span>
                </span>
              ))
            ) : (
              <span className="text-[10px] text-on-surface-variant italic">
                Trust Umbrella (No localized temple assigned)
              </span>
            )}
          </div>
        </div>

        {/* Committee Memberships */}
        <div className="space-y-1.5 pt-1 border-t border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
              <Layers size={11} /> Committees:
            </span>
            {onAssignCommittee && (
              <button
                type="button"
                onClick={() => onAssignCommittee(member.id)}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                + Add
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {member.committeeMemberships && member.committeeMemberships.length > 0 ? (
              member.committeeMemberships.map((cm, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200 font-medium flex items-center gap-1"
                >
                  <Layers size={10} />
                  <span>{cm.committeeName}</span>
                  <span className="text-[9px] opacity-75 font-bold">({cm.role})</span>
                </span>
              ))
            ) : (
              <span className="text-[10px] text-on-surface-variant italic">
                No committee appointments
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Action Footer */}
      {onEdit && (
        <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-end">
          <button
            type="button"
            onClick={() => onEdit(member)}
            className="px-3 py-1 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
