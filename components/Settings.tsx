'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  RefreshCw,
  CheckCircle,
  Database,
  Trash2,
  Smartphone,
  MessageSquare,
  Mail
} from 'lucide-react';

export default function Settings() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SMS Gateway Config
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsConfig, setSmsConfig] = useState({
    sendingPhoneNumber: '+91 98450 11000'
  });

  // WhatsApp Gateway Config
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappConfig, setWhatsappConfig] = useState({
    sendingPhoneNumber: '+91 98450 11000'
  });

  // Email (SMTP) Gateway Config
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    senderEmail: 'notifications@sankalpavani.org'
  });

  // Security config
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [authFactor, setAuthFactor] = useState('password');

  // Load from local storage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sankalpvani_notification_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.smsEnabled !== undefined) setSmsEnabled(parsed.smsEnabled);
          if (parsed.smsConfig) setSmsConfig(prev => ({ ...prev, ...parsed.smsConfig }));
          if (parsed.whatsappEnabled !== undefined) setWhatsappEnabled(parsed.whatsappEnabled);
          if (parsed.whatsappConfig) setWhatsappConfig(prev => ({ ...prev, ...parsed.whatsappConfig }));
          if (parsed.emailEnabled !== undefined) setEmailEnabled(parsed.emailEnabled);
          if (parsed.emailConfig) setEmailConfig(prev => ({ ...prev, ...parsed.emailConfig }));
          if (parsed.sessionTimeout) setSessionTimeout(parsed.sessionTimeout);
          if (parsed.authFactor) setAuthFactor(parsed.authFactor);
        }
      } catch (e) { }
    }
  }, []);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all cached temple registries, scheduling rosters, and transaction logs back to system factory defaults?')) {
      localStorage.removeItem('sankalpvani_priests');
      localStorage.removeItem('sankalpvani_sevas');
      localStorage.removeItem('sankalpvani_temple_details');
      localStorage.removeItem('sankalpvani_shifts');
      localStorage.removeItem('sankalpvani_prasadam');
      localStorage.removeItem('sankalpvani_notification_settings');

      setToastMessage('System registries reset! Reloading the page in 1 second...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleSaveSettings = () => {
    if (typeof window !== 'undefined') {
      const payload = {
        smsEnabled,
        smsConfig,
        whatsappEnabled,
        whatsappConfig,
        emailEnabled,
        emailConfig,
        sessionTimeout,
        authFactor
      };
      localStorage.setItem('sankalpvani_notification_settings', JSON.stringify(payload));
    }
    setToastMessage('Notification gateways & security configurations updated successfully.');
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
          Control operational defaults, SMS/WhatsApp/Email notification gateways, user access privileges, and master backups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Side settings categories */}
        <div className="lg:col-span-8 space-y-6">

          {/* Notifications config */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 p-6 space-y-5">
            <div className="border-b divider-gold pb-3 flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                General Notifications
              </h3>
              <span className="text-[11px] text-on-surface-variant font-semibold">
                Configure notification sender accounts
              </span>
            </div>

            <div className="space-y-4 font-sans text-sm">

              {/* 1. SMS Notification Gateway */}
              <div className="bg-surface-container-low/40 rounded-2xl p-4 border border-outline-variant/30 space-y-3 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <h4 className="text-on-surface font-bold text-sm">SMS Gateway</h4>
                      <p className="text-xs text-on-surface-variant font-medium">Sends instant booking confirmation SMS &amp; barcode links to devotees.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={() => setSmsEnabled(!smsEnabled)}
                    className="w-5 h-5 text-primary focus:ring-primary border-outline rounded cursor-pointer accent-primary shrink-0"
                  />
                </div>

                {/* SMS Details Form */}
                {smsEnabled && (
                  <div className="pt-3 border-t border-outline-variant/20 animate-[fadeIn_0.2s_ease-out]">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                      SMS Sending Phone Number / Virtual No. *
                    </label>
                    <input
                      type="text"
                      value={smsConfig.sendingPhoneNumber}
                      onChange={(e) => setSmsConfig({ ...smsConfig, sendingPhoneNumber: e.target.value })}
                      placeholder="e.g. +91 98450 11000"
                      className="w-full px-3 py-2.5 bg-surface-container border border-outline rounded-xl text-xs focus:outline-none focus:border-primary font-mono font-semibold text-on-surface"
                    />
                    <span className="text-[10px] text-on-surface-variant/70 mt-1 block">
                      Outbound sender phone number used to dispatch automated SMS booking confirmations &amp; barcode links.
                    </span>
                  </div>
                )}
              </div>

              {/* 2. WhatsApp Notification Gateway */}
              <div className="bg-surface-container-low/40 rounded-2xl p-4 border border-outline-variant/30 space-y-3 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-700 shrink-0">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <h4 className="text-on-surface font-bold text-sm">WhatsApp Business API</h4>
                      <p className="text-xs text-on-surface-variant font-medium">Sends automated WhatsApp seva e-passes, seva timings, &amp; prasadam tracking.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={() => setWhatsappEnabled(!whatsappEnabled)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500 border-outline rounded cursor-pointer accent-green-600 shrink-0"
                  />
                </div>

                {/* WhatsApp Details Form */}
                {whatsappEnabled && (
                  <div className="pt-3 border-t border-outline-variant/20 animate-[fadeIn_0.2s_ease-out]">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-green-700 mb-1">
                      WhatsApp Sending Phone Number *
                    </label>
                    <input
                      type="text"
                      value={whatsappConfig.sendingPhoneNumber}
                      onChange={(e) => setWhatsappConfig({ ...whatsappConfig, sendingPhoneNumber: e.target.value })}
                      placeholder="e.g. +91 98450 11000"
                      className="w-full px-3 py-2.5 bg-surface-container border border-outline rounded-xl text-xs focus:outline-none focus:border-green-600 font-mono font-semibold text-on-surface"
                    />
                    <span className="text-[10px] text-on-surface-variant/70 mt-1 block">
                      Verified WhatsApp Business phone number used to send automated e-passes &amp; seva alerts.
                    </span>
                  </div>
                )}
              </div>

              {/* 3. Email (SMTP) Notification Gateway */}
              <div className="bg-surface-container-low/40 rounded-2xl p-4 border border-outline-variant/30 space-y-3 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-700 shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h4 className="text-on-surface font-bold text-sm">Email (SMTP) Gateway</h4>
                      <p className="text-xs text-on-surface-variant font-medium">Dispatches PDF tax receipts, Sankalpa confirmations, &amp; monthly statements.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={() => setEmailEnabled(!emailEnabled)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-outline rounded cursor-pointer accent-blue-600 shrink-0"
                  />
                </div>

                {/* Email Details Form */}
                {emailEnabled && (
                  <div className="pt-3 border-t border-outline-variant/20 animate-[fadeIn_0.2s_ease-out]">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">
                      Sender&apos;s Email ID (From Address) *
                    </label>
                    <input
                      type="email"
                      value={emailConfig.senderEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                      placeholder="e.g. notifications@sankalpavani.org"
                      className="w-full px-3 py-2.5 bg-surface-container border border-outline rounded-xl text-xs focus:outline-none focus:border-blue-600 font-semibold text-on-surface"
                    />
                    <span className="text-[10px] text-on-surface-variant/70 mt-1 block">
                      Official temple email ID from which devotees will receive tax receipts and Sankalpa confirmations.
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Security config */}
          {/* <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-primary border-b divider-gold pb-3 flex items-center gap-2">
              <Lock size={18} className="text-primary" />
              Administrative Security Control
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Administrative Session Timeout</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none"
                >
                  <option value="30">30 Minutes of Inactivity</option>
                  <option value="60">1 Hour of Inactivity</option>
                  <option value="120">2 Hours of Inactivity</option>
                  <option value="never">Never Timeout</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Required Authentication Factor</label>
                <select
                  value={authFactor}
                  onChange={(e) => setAuthFactor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none"
                >
                  <option value="password">Standard Secure Password</option>
                  <option value="mfa">Two-Factor SMS Token (MFA)</option>
                </select>
              </div>
            </div>
          </div> */}

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
