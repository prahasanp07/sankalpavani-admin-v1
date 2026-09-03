'use client';

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  RefreshCw, 
  CheckCircle,
  Database,
  Trash2
} from 'lucide-react';

export default function Settings() {
  const [smsNotification, setSmsNotification] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all cached temple registries, scheduling rosters, and transaction logs back to system factory defaults?')) {
      localStorage.removeItem('sankalpvani_priests');
      localStorage.removeItem('sankalpvani_sevas');
      localStorage.removeItem('sankalpvani_temple_details');
      localStorage.removeItem('sankalpvani_shifts');
      localStorage.removeItem('sankalpvani_prasadam');
      
      setToastMessage('System registries reset! Reloading the page in 1 second...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleSaveSettings = () => {
    setToastMessage('Configurations updated successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-primary-container text-on-primary-container border border-primary/20 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-primary animate-pulse" />
          <span className="font-sans text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-semibold text-primary">System Configuration & Safety</h2>
        <p className="font-sans text-sm text-on-surface-variant font-medium mt-1">
          Control operational defaults, SMS integration preferences, user access privileges, and master backups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side settings categories */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Notifications config */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-primary border-b divider-gold pb-3 flex items-center gap-2">
              <Bell size={18} className="text-primary" />
              Pilgrim Alerts Gateway Preferences
            </h3>

            <div className="space-y-4 font-sans text-sm font-medium">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-on-surface">Auto-dispatch SMS Tickets</h4>
                  <p className="text-xs text-on-surface-variant">Sends barcode URLs to devotees instantly upon booking confirmation.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={smsNotification} 
                  onChange={() => setSmsNotification(!smsNotification)}
                  className="w-5 h-5 text-primary focus:ring-primary border-outline rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-on-surface">End-of-day Roster Digest</h4>
                  <p className="text-xs text-on-surface-variant">Dispatches tomorrow&apos;s duty roster to assigned archakas at 8:00 PM.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailDigest} 
                  onChange={() => setEmailDigest(!emailDigest)}
                  className="w-5 h-5 text-primary focus:ring-primary border-outline rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Security config */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-primary border-b divider-gold pb-3 flex items-center gap-2">
              <Lock size={18} className="text-primary" />
              Administrative Security Control
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Administrative Session Timeout</label>
                <select className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none">
                  <option value="30">30 Minutes of Inactivity</option>
                  <option value="60">1 Hour of Inactivity</option>
                  <option value="120">2 Hours of Inactivity</option>
                  <option value="never">Never Timeout</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Required Authentication Factor</label>
                <select className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none">
                  <option value="password">Standard Secure Password</option>
                  <option value="mfa">Two-Factor SMS Token (MFA)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveSettings}
              className="bg-primary hover:bg-on-primary-container text-on-primary font-bold py-2.5 px-6 rounded-xl text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              Apply Configurations
            </button>
          </div>

        </div>

        {/* Right Side diagnostics */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-4">
            <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
              <Database size={16} /> Data Factory Diagnostics
            </h3>
            
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              If the system cache becomes corrupted or you wish to revert custom edits back to high-fidelity factory presets, use the control below. This wipes local storage registries securely.
            </p>

            <button
              onClick={handleReset}
              className="w-full bg-error-container hover:bg-red-200 text-on-error-container border border-red-300 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Trash2 size={14} />
              <span>Reset Factory Presets</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
