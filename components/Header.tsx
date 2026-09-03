'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Landmark, 
  ChevronDown, 
  Check, 
  Clock, 
  ShieldCheck, 
  Bell, 
  Sparkles, 
  User, 
  Settings as SettingsIcon,
  Shield,
  Layers
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title?: string;
  onNavigate?: (tab: string) => void;
  onOpenMobileMenu?: () => void;
}

export default function Header({
  title,
  onNavigate,
  onOpenMobileMenu
}: HeaderProps) {
  const { 
    session, 
    activeScope, 
    activeTempleName, 
    activeTempleId, 
    availableTemples, 
    switchScope, 
    resetToSuperAdmin 
  } = useAuth();

  const [contextDropdownOpen, setContextDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Clock live update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      };
      setCurrentTime(now.toLocaleString('en-IN', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const displayName = session?.name || 'Admin User';
  const displayRole = session?.designation || session?.role || 'Staff Member';
  const displayAvatar = session?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvn8h5qEhb1tDXNVQmH_C-7Bf3AF9LFkxb3WKWAvVYmxKc-TcXh1fjMMz-WjPg9zbdjB7Yrhy9eiYGkJBLgHovr8GAsE2ft4v7PT9xcRcGGi3JzCKWBozxxFHni9LfCSubIqySEm5J4TesuWgBjdcdegth7w_Lsgvd39ZpYyq-IgCKk-0lzzWXTvduEcTeXKyNURY3AzLe-YP0InifLRv0R4KmiNUF_JDCpbPVweyINkAPtpA7Rfnc7ZfS2hPyvRu8cJGasIwQyYQ';

  return (
    <header className="h-16 border-b divider-gold bg-surface-container/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shadow-xs">
      
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button 
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary rounded-xl focus:outline-none hover:bg-surface-container"
          >
            <span className="sr-only">Open menu</span>
            <Layers size={20} />
          </button>
        )}
        {title && (
          <h2 className="font-serif text-base md:text-lg font-bold text-primary tracking-tight truncate">
            {title}
          </h2>
        )}
      </div>

      {/* Center / Right: Scoped Access Context Switcher & Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">

        {/* Persistent Scoped Access Context Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setContextDropdownOpen(!contextDropdownOpen)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-98 ${
              activeScope === 'TRUST'
                ? 'bg-red-800 hover:bg-red-900 text-white border border-red-700/60'
                : 'bg-orange-600 hover:bg-orange-700 text-white border border-orange-500/60'
            }`}
            title={`Active Scope: ${activeScope === 'TRUST' ? 'Global Trust Operations' : (activeTempleName || 'Specific Temple')}. Click to switch context.`}
          >
            {activeScope === 'TRUST' ? (
              <Landmark size={14} className="text-red-200 shrink-0" />
            ) : (
              <Building2 size={14} className="text-orange-200 shrink-0" />
            )}

            <span className="truncate max-w-[170px] sm:max-w-[240px]">
              {activeScope === 'TRUST'
                ? 'Viewing: Global Trust Operations'
                : `Viewing: ${activeTempleName || 'Sri Vidyashankara Temple'}`}
            </span>

            <ChevronDown size={13} className={`text-white/80 transition-transform ${contextDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Context Switcher Dropdown */}
          {contextDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setContextDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 py-2 z-40 animate-[slideDown_0.2s_ease-out]">
                <div className="px-4 py-2 border-b border-outline-variant/20 bg-surface-container-low/60">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    Operating Zone & RLS Scope
                  </p>
                  <p className="text-xs font-semibold text-on-surface mt-0.5">
                    Select scope boundary for permissions & data filtering
                  </p>
                </div>

                <div className="p-1.5 space-y-1">
                  {/* Trust Level Option */}
                  <button
                    type="button"
                    onClick={() => {
                      switchScope('TRUST', null, null);
                      setContextDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      activeScope === 'TRUST'
                        ? 'bg-red-50 text-red-950 font-bold border border-red-200'
                        : 'hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-red-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Landmark size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">Global Trust Operations</p>
                        <p className="text-[10px] text-on-surface-variant opacity-80 truncate">Apex portfolio & all sanctums</p>
                      </div>
                    </div>
                    {activeScope === 'TRUST' && <Check size={15} className="text-red-800 shrink-0" />}
                  </button>

                  <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/70 border-t border-outline-variant/15">
                    Individual Temple Sanctums
                  </div>

                  {/* Temple Level Options */}
                  {availableTemples.map((temple) => {
                    const isSelected = activeScope === 'TEMPLE' && (activeTempleId === temple.id || (!activeTempleId && temple.id === 'temple_vidyashankara'));
                    return (
                      <button
                        key={temple.id}
                        type="button"
                        onClick={() => {
                          switchScope('TEMPLE', temple.id, temple.name);
                          setContextDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50 text-orange-950 font-bold border border-orange-200'
                            : 'hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Building2 size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{temple.name}</p>
                            <p className="text-[10px] text-on-surface-variant opacity-80 truncate">Localized sanctum operations</p>
                          </div>
                        </div>
                        {isSelected && <Check size={15} className="text-orange-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Live Clock Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/40 text-on-surface-variant text-xs font-mono">
          <Clock size={13} className="text-primary" />
          <span>{currentTime || 'Loading...'}</span>
        </div>

        {/* Dynamic RBAC Active Designation Badge */}
        <div 
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold shadow-xs cursor-default"
          title={`Active Designation: ${displayRole}`}
        >
          <ShieldCheck size={13} />
          <span className="truncate max-w-[140px]">{displayRole}</span>
          {session?.isSuperAdmin && (
            <span className="bg-primary text-on-primary text-[9px] px-1 rounded-sm uppercase tracking-wider font-extrabold ml-0.5">
              Apex
            </span>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container-low transition-all cursor-pointer border border-transparent hover:border-outline-variant/40"
          >
            <img 
              alt="Admin" 
              className="w-8 h-8 rounded-full object-cover border border-primary/40 shadow-xs" 
              src={displayAvatar} 
            />
            <ChevronDown size={14} className="text-on-surface-variant hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 py-2 z-40 animate-[slideDown_0.2s_ease-out]">
                <div className="px-4 py-2.5 border-b divider-gold mb-1.5 bg-surface-container-low/50">
                  <p className="font-sans text-xs font-bold text-on-surface truncate">{displayName}</p>
                  <p className="font-sans text-[10px] text-primary font-bold truncate mt-0.5">{displayRole}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Shield size={11} className="text-amber-800" />
                    <span className="text-[10px] font-mono text-on-surface-variant font-semibold">
                      {session?.isSuperAdmin 
                        ? 'Super Admin (All Granted)' 
                        : `${session?.permissions.length || 0} Dynamic Capabilities`}
                    </span>
                  </div>
                </div>

                {!session?.isSuperAdmin && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      resetToSuperAdmin();
                    }}
                    className="w-full flex items-center px-4 py-2 font-sans text-xs font-bold text-primary hover:bg-primary/10 transition-all text-left cursor-pointer"
                  >
                    <Sparkles size={13} className="mr-2 text-primary" />
                    <span>Elevate to Super Admin</span>
                  </button>
                )}

                {onNavigate && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full flex items-center px-4 py-2.5 font-sans text-xs font-semibold text-on-surface-variant hover:bg-primary-container/5 hover:text-primary transition-all text-left cursor-pointer"
                  >
                    <SettingsIcon size={14} className="mr-2.5 text-primary" />
                    <span>System Settings</span>
                  </button>
                )}

                <a
                  href="/trusts/trust_sringeri/governance/roles"
                  className="w-full flex items-center px-4 py-2.5 font-sans text-xs font-semibold text-primary hover:bg-primary/10 transition-all text-left"
                >
                  <ShieldCheck size={14} className="mr-2.5 text-primary" />
                  <span>Roles & RBAC Manager</span>
                </a>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
