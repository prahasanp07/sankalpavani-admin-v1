'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Flame,
  Building2,
  ShieldCheck,
  Coins,
  Edit3,
  Trash2,
  UserPlus,
  Share2,
  Phone,
  Mail,
  Layers,
  Sparkles,
  GitFork,
  ArrowRight,
  Crown,
  Award,
  Landmark
} from 'lucide-react';
import { BentoNodeData, DEPARTMENT_CONFIG, DepartmentType } from './types';

function BentoNodeComponent(props: NodeProps) {
  const nodeData = props.data as unknown as BentoNodeData;
  const selected = props.selected;
  const {
    staff,
    onEdit,
    onDelete,
    onAddSubordinate,
    onAddMatrixRelation,
    isHighlighted,
    isDimmed,
    primaryManagerName,
    secondaryManagerNames = [],
    reporteeCount = 0,
    matrixReporteeCount = 0
  } = nodeData;

  const deptConfig = DEPARTMENT_CONFIG[staff.department as DepartmentType] || DEPARTMENT_CONFIG.Spiritual;
  const isSpiritual = staff.department === 'Spiritual';

  const getStatusBadge = () => {
    switch (staff.status) {
      case 'Active':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Active
        </span>;
      case 'Duty-Assign':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Duty-Assign
        </span>;
      case 'On Leave':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          On Leave
        </span>;
    }
  };

  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit(staff);
      }}
      className={`relative group w-80 bg-surface-container-lowest rounded-2xl border transition-all duration-300 select-none shadow-md hover:shadow-xl cursor-pointer ${deptConfig.borderLeftClass
        } ${selected ? 'ring-2 ring-primary ring-offset-2 shadow-2xl scale-[1.02]' : 'hover:border-outline-variant/60'
        } ${isHighlighted ? 'ring-4 ring-amber-400 ring-offset-2 scale-105 shadow-2xl z-30' : ''
        } ${isDimmed ? 'opacity-35 grayscale-[50%]' : 'opacity-100'
        }`}
      style={{
        boxShadow: selected || isHighlighted
          ? `0 12px 28px -6px ${deptConfig.glowColor}, 0 6px 12px -4px rgba(0,0,0,0.1)`
          : '0 4px 16px -2px rgba(0,0,0,0.06)'
      }}
      title="Double click to edit staff profile"
    >
      {/* Primary Hierarchy Connector: Top Target (reportsTo) */}
      <Handle
        type="target"
        position={Position.Top}
        id="primary-target"
        className="!w-3.5 !h-3.5 !bg-primary !border-2 !border-white !rounded-full !-top-2 hover:!scale-125 !transition-transform !cursor-crosshair shadow-sm"
        title="Primary Hierarchy (Reports To)"
      />

      {/* Matrix Connector: Left Target (Secondary Reporting In) */}
      <Handle
        type="target"
        position={Position.Left}
        id="matrix-target"
        className="!w-3 !h-3 !bg-purple-600 !border-2 !border-white !rounded-full !-left-1.5 hover:!scale-125 !transition-transform !cursor-crosshair shadow-sm"
        title="Matrix Reporting In (Secondary Supervisor)"
      />

      {/* Bento Card Header: Department Tag, Trustee/Office Bearer Badges & Status */}
      <div className="p-4 pb-2.5 border-b border-outline-variant/20 bg-surface-container-low/40 rounded-t-2xl space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          {/* Department badge with Saffron or Gold theme */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase ${deptConfig.badgeBg}`}>
            {isSpiritual ? (
              <Flame size={12} className="text-amber-700" />
            ) : staff.department === 'Admin' ? (
              <Building2 size={12} className="text-yellow-800" />
            ) : staff.department === 'Operations' ? (
              <ShieldCheck size={12} className="text-emerald-700" />
            ) : (
              <Coins size={12} className="text-blue-700" />
            )}
            <span>{staff.department}</span>
          </div>

          {getStatusBadge()}
        </div>

        {/* Governance Flags (Trustee / Office Bearer) */}
        {(staff.isTrustee || staff.isOfficeBearer) && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {staff.isTrustee && (
              <span 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-500/15 text-amber-900 border border-amber-500/30"
                title={staff.trusteeType || 'Trustee'}
              >
                <Crown size={10} className="text-amber-700" />
                <span>{staff.trusteeType ? staff.trusteeType.split('/')[0].trim() : 'Trustee'}</span>
              </span>
            )}
            {staff.isOfficeBearer && staff.officeBearerRole && staff.officeBearerRole !== 'None' && (
              <span 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-yellow-500/15 text-yellow-900 border border-yellow-500/30"
                title={staff.officeBearerRole}
              >
                <Award size={10} className="text-yellow-700" />
                <span>{staff.officeBearerRole.split('/')[0].trim()}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bento Card Body: Avatar, Name & Role */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3.5">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            {staff.avatar ? (
              <img
                src={staff.avatar}
                alt={staff.name}
                className={`w-13 h-13 rounded-2xl object-cover border-2 shadow-sm ${isSpiritual ? 'border-amber-400' : 'border-yellow-400'
                  }`}
              />
            ) : (
              <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-serif text-lg font-bold text-white shadow-sm ${isSpiritual ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-amber-600 to-yellow-700'
                }`}>
                {staff.name.charAt(0)}
              </div>
            )}

            {/* Sacred dot motif */}
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold"
              style={{ backgroundColor: deptConfig.borderColor }}
              title={deptConfig.label}
            >
              •
            </div>
          </div>

          {/* Name, Role & Sub-Department */}
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-sm font-bold text-on-surface leading-snug line-clamp-1 group-hover:text-primary transition-colors" title={staff.name}>
              {staff.name}
            </h3>
            <p className="font-sans text-xs font-semibold text-primary/95 line-clamp-2 mt-0.5 leading-snug">
              {staff.role}
            </p>
            {staff.subDepartment && (
              <p className="font-sans text-[10px] font-medium text-on-surface-variant truncate mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                <span>{staff.subDepartment}</span>
              </p>
            )}
            {staff.location && (
              <p className="font-sans text-[10px] text-on-surface-variant/80 truncate mt-0.5">
                📍 {staff.location}
              </p>
            )}
          </div>
        </div>

        {/* Responsibilities or Subtitle if present */}
        {staff.responsibilities && (
          <p className="font-sans text-[11px] text-on-surface-variant line-clamp-2 bg-surface-container/40 p-2 rounded-xl border border-outline-variant/15 leading-relaxed">
            {staff.responsibilities}
          </p>
        )}

        {/* Matrix Reporting Indicators (if staff reports to secondary supervisors) */}
        {secondaryManagerNames.length > 0 && (
          <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-2 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-purple-900 uppercase tracking-wider">
              <Share2 size={10} className="text-purple-700" />
              <span>Matrix Reporting Line (Dashed)</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {secondaryManagerNames.map((mgrName, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium bg-purple-100/90 text-purple-900 px-2 py-0.5 rounded-md border border-purple-200">
                  <span className="w-1 h-1 rounded-full bg-purple-600"></span>
                  {mgrName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reporting Metadata Footer & Dynamic RBAC Capabilities */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-on-surface-variant pt-2 border-t border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1" title="Direct Subordinates">
              <GitFork size={11} className="text-primary" />
              <span>{reporteeCount} Direct</span>
            </span>

            {matrixReporteeCount > 0 && (
              <span className="flex items-center gap-1 text-purple-700 font-bold" title="Matrix Supervised Personnel">
                <Share2 size={10} />
                <span>{matrixReporteeCount} Matrix</span>
              </span>
            )}
          </div>

          <div 
            className="flex items-center gap-1 text-[9px] font-bold text-amber-950 bg-amber-100/80 border border-amber-300 px-1.5 py-0.5 rounded-md"
            title={staff.permissions ? `Permissions: ${staff.permissions.join(', ')}` : 'Standard / Super Admin capabilities'}
          >
            <ShieldCheck size={10} className="text-amber-800" />
            <span>
              {staff.permissions?.includes('SUPER_ADMIN') || staff.reportsTo === null 
                ? 'Super Admin' 
                : `${staff.permissions?.length || 5} Perms`}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Floating Bar on Hover */}
      <div className="px-3 py-2 bg-surface-container-low/90 rounded-b-2xl border-t border-outline-variant/20 flex items-center justify-between gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(staff);
            }}
            className="p-1.5 hover:bg-primary-container/20 text-primary rounded-lg transition-colors cursor-pointer"
            title="Edit Staff Member"
          >
            <Edit3 size={13} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddSubordinate(staff);
            }}
            className="p-1.5 hover:bg-primary-container/20 text-primary rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
            title="Add Direct Subordinate"
          >
            <UserPlus size={13} />
            <span>+ Report</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddMatrixRelation(staff);
            }}
            className="p-1.5 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
            title="Add Secondary Matrix Connection"
          >
            <Share2 size={12} />
          </button>
        </div>

        {staff.reportsTo !== null && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove ${staff.name} from the Devasthanam organization chart?`)) {
                onDelete(staff.id);
              }
            }}
            className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
            title="Remove from Org Chart"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Matrix Connector: Right Source (Secondary Reporting Out) */}
      <Handle
        type="source"
        position={Position.Right}
        id="matrix-source"
        className="!w-3 !h-3 !bg-purple-600 !border-2 !border-white !rounded-full !-right-1.5 hover:!scale-125 !transition-transform !cursor-crosshair shadow-sm"
        title="Matrix Reporting Out (Subordinate / Functional Line)"
      />

      {/* Primary Hierarchy Connector: Bottom Source (Direct Subordinates) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="primary-source"
        className="!w-3.5 !h-3.5 !bg-primary !border-2 !border-white !rounded-full !-bottom-2 hover:!scale-125 !transition-transform !cursor-crosshair shadow-sm"
        title="Primary Subordinates (Outgoing)"
      />
    </div>
  );
}

export const BentoNode = memo(BentoNodeComponent);
