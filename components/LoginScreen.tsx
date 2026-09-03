'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { UserSession } from '../contexts/AuthContext';

interface LoginScreenProps {
  onLoginSuccess: (email: string, customProps?: Partial<UserSession>) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('admin@temple1.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      if (res.ok) {
        const json = await res.json();
        onLoginSuccess(email, {
          name: json.data?.user?.name,
          avatar: json.data?.user?.avatarUrl
        });
      } else {
        // Fallback for offline/local prototype mode
        onLoginSuccess(email);
      }
    } catch (err) {
      // Fallback
      onLoginSuccess(email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-background text-on-surface">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBID-dWLCOnrauvnfNg65tnBI3NvcIqcncVBRA1Ps0X-nJ6XIr7IFu8P6mzYisgZcyFgD4Gjw4GFThVg4veOvVfDSFaMFDzFqVoh8gLdJ5GhihfNqJoHTEv6RITgyoODWCYPPF_GNgj9gi2ndfmUCD4wk3qcWgAQdz3MzEgQVsPM_EcYr7qk2otj5uI3HM-jQy-EU7PpPlrDqXXgKyGOGECk-7ftFCRoHInNz6JzYV2cOWvgtZO5qI1mqpqR3qcQktPvoRC_WdfW1w')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
        <div className="absolute inset-0 bg-pattern"></div>
      </div>

      <div className="flex-grow flex items-center justify-center p-4 md:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl sacred-glow border-t-4 border-primary border-x border-b border-outline-variant/30 overflow-hidden"
        >
          {/* Card Header */}
          <div className="p-8 pb-0 text-center flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-4"
            >
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>
                temple_hindu
              </span>
            </motion.div>
            <h1 className="font-serif font-bold text-3xl md:text-4xl text-primary mb-1">
              SankalpVani
            </h1>
            <p className="font-sans text-xs text-on-surface-variant font-bold tracking-wider uppercase">
              Unified Trust & Temple Portal Login
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="email"
                className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Email Address (User Identity)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 bg-white/50 border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm font-sans"
                placeholder="dharmadhikari@sringeri.org or eo@vidyashankara.org"
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="password"
                className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-white/50 border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm font-sans"
                placeholder="••••••••"
                required
              />

              <div className="flex justify-end mt-1">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('Please contact the Trust Governance Administrator to reset your credentials.'); }} 
                  className="font-sans text-xs text-primary hover:text-on-primary-container transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-on-primary-container text-on-primary font-bold py-3 px-4 rounded-lg shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>{isLoading ? 'Authenticating & Resolving Roles...' : 'Sign In to Workspace'}</span>
              {!isLoading && <ArrowRight size={18} />}
            </button>

            {/* Quick 1-Click Demo Stakeholder Logins */}
            <div className="pt-3 border-t border-outline-variant/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Quick Stakeholder Logins:
                </span>
                <span className="text-[9px] text-primary font-bold">Dynamic RBAC</span>
              </div>

              {/* Trust Level Logins */}
              <div className="space-y-1">
                <p className="text-[9px] font-mono font-bold uppercase text-amber-800 tracking-wider">
                  Tier 1: Trust Governance Logins
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('dharmadhikari@sringeri.org');
                      onLoginSuccess('dharmadhikari@sringeri.org', {
                        name: 'Sri Sringeri Dharmaadhikari',
                        designation: 'Trust Apex Trustee',
                        role: 'Trustee',
                        isSuperAdmin: true,
                        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvn8h5qEhb1tDXNVQmH_C-7Bf3AF9LFkxb3WKWAvVYmxKc-TcXh1fjMMz-WjPg9zbdjB7Yrhy9eiYGkJBLgHovr8GAsE2ft4v7PT9xcRcGGi3JzCKWBozxxFHni9LfCSubIqySEm5J4TesuWgBjdcdegth7w_Lsgvd39ZpYyq-IgCKk-0lzzWXTvduEcTeXKyNURY3AzLe-YP0InifLRv0R4KmiNUF_JDCpbPVweyINkAPtpA7Rfnc7ZfS2hPyvRu8cJGasIwQyYQ'
                      });
                    }}
                    className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-primary border border-primary/30 rounded-xl text-[10px] font-bold text-left transition-all cursor-pointer flex flex-col"
                  >
                    <span className="truncate">Trust Apex Trustee</span>
                    <span className="text-[8px] text-on-surface-variant font-normal">Full Trust Oversight</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('auditor@sringeri.org');
                      onLoginSuccess('auditor@sringeri.org', {
                        name: 'Sri S. Ramanathan FCA',
                        designation: 'Statutory Auditor',
                        role: 'Auditor',
                        permissions: ['DASHBOARD_VIEW', 'VIEW_FINANCE', 'VIEW_REPORTS', 'EXPORT_REPORTS'],
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
                      });
                    }}
                    className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-xl text-[10px] font-bold text-left transition-all cursor-pointer flex flex-col"
                  >
                    <span className="truncate">Statutory Auditor</span>
                    <span className="text-[8px] text-on-surface-variant font-normal">Read-Only Financials</span>
                  </button>
                </div>
              </div>

              {/* Temple Level Logins */}
              <div className="space-y-1 pt-1">
                <p className="text-[9px] font-mono font-bold uppercase text-primary tracking-wider">
                  Tier 2: Temple Workplace Logins
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('eo@vidyashankara.org');
                      onLoginSuccess('eo@vidyashankara.org', {
                        name: 'Sri Vidyaranya Shastri',
                        designation: 'Executive Officer (EO)',
                        role: 'Executive Officer',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
                      });
                    }}
                    className="p-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl text-[10px] font-bold text-left transition-all cursor-pointer flex flex-col"
                  >
                    <span className="truncate">Executive Officer (EO)</span>
                    <span className="text-[8px] text-on-surface-variant font-normal">Temple Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('raghavan.bhattar@vidyashankara.org');
                      onLoginSuccess('raghavan.bhattar@vidyashankara.org', {
                        name: 'Sri Raghavan Bhattar',
                        designation: 'Chief Archaka (Pradhana Acharya)',
                        department: 'Spiritual',
                        permissions: [
                          'DASHBOARD_VIEW', 'VIEW_SEVAS', 'MANAGE_SEVAS', 'VIEW_PRIESTS',
                          'MANAGE_PRIESTS', 'VIEW_ROSTER', 'MANAGE_ROSTER', 'VIEW_BOOKINGS',
                          'REGISTER_BOOKINGS', 'VIEW_ORG_CHART', 'MANAGE_TEMPLE_INFO'
                        ],
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                      });
                    }}
                    className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-xl text-[10px] font-bold text-left transition-all cursor-pointer flex flex-col"
                  >
                    <span className="truncate">Chief Archaka</span>
                    <span className="text-[8px] text-on-surface-variant font-normal">Rituals & Rostering</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('counter.clerk@vidyashankara.org');
                      onLoginSuccess('counter.clerk@vidyashankara.org', {
                        name: 'Smt. Lakshmi Devi',
                        designation: 'Booking Counter Clerk',
                        department: 'Operations',
                        permissions: ['VIEW_SEVAS', 'VIEW_BOOKINGS', 'REGISTER_BOOKINGS', 'PRINT_RECEIPTS'],
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
                      });
                    }}
                    className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-xl text-[10px] font-bold text-left transition-all cursor-pointer flex flex-col"
                  >
                    <span className="truncate">Counter Clerk</span>
                    <span className="text-[8px] text-on-surface-variant font-normal">Bookings & Receipts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('logistics@vidyashankara.org');
                      onLoginSuccess('logistics@vidyashankara.org', {
                        name: 'Sri Narayana Prasad',
                        designation: 'Prasadam Logistics Manager',
                        department: 'Operations',
                        permissions: ['PROCESS_LOGISTICS', 'PRINT_SHIPPING_LABELS'],
                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
                      });
                    }}
                    className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-xl text-[10px] font-bold text-left transition-all cursor-pointer flex flex-col"
                  >
                    <span className="truncate">Prasadam Manager</span>
                    <span className="text-[8px] text-on-surface-variant font-normal">Remote Dispatch</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center pt-1">
              <p className="font-sans text-[11px] text-on-surface-variant font-medium tracking-wide">
                Authorized Devasthanam personnel only.
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Footer */}
      {/* <footer className="relative z-10 py-6 text-center">
        <p className="font-sans text-xs text-on-surface-variant font-medium opacity-80">
          Powered by ShreePMCS & PraGana Innovations
        </p>
      </footer>  */}
    </div>
  );
}
