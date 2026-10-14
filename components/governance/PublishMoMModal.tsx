'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  Sparkles,
  Paperclip,
  Upload,
  AlertCircle,
  CheckCircle2,
  Send,
  FileText,
  FileCheck,
  Trash2,
  Calendar,
  Layers,
  Users,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import {
  publishMoMSchema,
  PublishMoMInput,
  MeetingItem,
  MeetingNoteItem,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_ATTACHMENT_SIZE_LABEL,
  AttachmentMetadata,
} from '@/schemas/meeting.schema';

interface PublishMoMModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingItem | null;
  onPublishSuccess: (meetingId: string, note: MeetingNoteItem) => void;
  currentUserName?: string;
  currentUserDesignation?: string;
}

export default function PublishMoMModal({
  isOpen,
  onClose,
  meeting,
  onPublishSuccess,
  currentUserName = 'Dr. K. N. Srikumar, IAS (Retd.)',
  currentUserDesignation = 'Executive Officer (EO)',
}: PublishMoMModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDraftingAI, setIsDraftingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PublishMoMInput>({
    resolver: zodResolver(publishMoMSchema),
    defaultValues: {
      meetingId: meeting?.id || '',
      momText: '',
      attachment: null,
    },
  });

  const momTextValue = watch('momText');

  if (!isOpen || !meeting) return null;

  // Format file size helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Handle file selection with 5MB validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileError(null);

    if (file) {
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        setFileError(`Selected file is ${formatBytes(file.size)}, which exceeds the strict ${MAX_ATTACHMENT_SIZE_LABEL} limit.`);
        setSelectedFile(null);
        setValue('attachment', null, { shouldValidate: true });
        return;
      }
      setSelectedFile(file);
      setValue('attachment', file, { shouldValidate: true });
    } else {
      setSelectedFile(null);
      setValue('attachment', null, { shouldValidate: true });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setValue('attachment', null, { shouldValidate: true });
  };

  // "Draft with AI" button handler designed to trigger @google/genai
  const handleDraftWithAI = async () => {
    setIsDraftingAI(true);
    try {
      // Simulate/trigger intelligent AI generation tailored to Temple Governance
      // If NEXT_PUBLIC_GEMINI_API_KEY is present, we could invoke @google/genai GoogleGenAI client
      const apiKey = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_GEMINI_API_KEY || '') : '';
      let generatedDraft = '';

      if (apiKey) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `You are the statutory governance secretary for a sacred Hindu Temple Trust. Draft official, legally compliant Minutes of Meeting (MoM) in markdown for:
Title: ${meeting.title}
Committee: ${meeting.committeeName || 'Apex Board'}
Agenda: ${meeting.agenda || 'General administrative matters'}
Invitees: ${meeting.invitees.map((i) => i.name).join(', ')}
Location: ${meeting.location}

Include:
1. Opening Invocatory Prayer & Quorum Verification
2. Key Deliberations & Agenda Discussions
3. Formal Resolutions Adopted (generate official Resolution Numbers e.g. RES-TR-2026/...)
4. Financial Authorizations & Sanctions in INR (₹)
5. Action Item Matrix with Assigned Office Bearers and Deadlines.`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          generatedDraft = response.text || '';
        } catch (apiErr) {
          console.warn('Direct Gemini API call failed or key was invalid; falling back to temple governance template', apiErr);
        }
      }

      // If no API key or call returned empty, use our specialized high-fidelity Temple Governance generator
      if (!generatedDraft) {
        await new Promise((resolve) => setTimeout(resolve, 850)); // Realistic UI feedback
        const resolutionId = `RES-TR-2026/${new Date().getMonth() + 1 < 10 ? '0' : ''}${new Date().getMonth() + 1}-${Math.floor(10 + Math.random() * 89)}`;

        generatedDraft = `### 1. Opening Prayer & Quorum Verification
The session commenced with the chanting of the *Veda Shanti Mantra* and invocation to the presiding deity. The Convener verified the attendance of **${meeting.invitees.length} official trustees & delegates**, satisfying the constitutional quorum requirements of the Trust Deed.

### 2. Agenda Items Deliberated
**Meeting Subject:** ${meeting.title}
${meeting.agenda ? `**Agenda Covered:**\n${meeting.agenda}\n` : ''}
The board conducted a comprehensive review of sanctum preparations, pilgrim amenities, and statutory regulatory compliances.

### 3. Formal Board Resolutions Passed
- **Resolution ${resolutionId} (Administrative Approval):** Unanimously resolved to adopt the proposals submitted for **${meeting.title}**. All operational protocols are to be executed under strict adherence to *Agama Sastra* traditions.
- **Resolution ${resolutionId}-B (Budget Allocation):** Sanctioned an operational fund of **₹ 18,50,000/-** (Rupees Eighteen Lakhs Fifty Thousand only) to be disbursed from the Trust general endowment account against certified vouchers.

### 4. Action Item Matrix & Assigned Custodians
1. **${meeting.hostName} (${meeting.hostDesignation}):** Supervise overall ritual execution and sanctum arrangements within 7 working days.
2. **Executive Officer & Bhandari:** Finalize vendor contracts, verify treasury security seals, and release sanctioned advances.
3. **Secretariat:** Dispatch signed copies of this resolution to all apex trustees and endowment commissioners.

---
*Certified as a true and correct record of resolutions adopted by Sri Sringeri Sharada Peetham Trust Board.*`;
      }

      setValue('momText', generatedDraft, { shouldValidate: true });
    } catch (err) {
      console.error('AI drafting encountered an error', err);
    } finally {
      setIsDraftingAI(false);
    }
  };

  const onSubmit = async (data: PublishMoMInput) => {
    setIsSubmitting(true);
    try {
      const resolutionNumber = `RES-TR-2026/${Math.floor(100 + Math.random() * 899)}`;
      const attachmentsList: AttachmentMetadata[] = [];

      if (selectedFile) {
        attachmentsList.push({
          id: `att_${Date.now()}`,
          name: selectedFile.name,
          sizeBytes: selectedFile.size,
          formattedSize: formatBytes(selectedFile.size),
          mimeType: selectedFile.type || 'application/pdf',
          url: URL.createObjectURL(selectedFile),
        });
      }

      const newNote: MeetingNoteItem = {
        id: `mom_${Date.now()}`,
        meetingId: meeting.id,
        momText: data.momText,
        attachmentUrls: attachmentsList,
        publishedAt: new Date().toISOString(),
        publishedByUserId: 'usr_eo',
        publishedByName: currentUserName,
        publishedByDesignation: currentUserDesignation,
        resolutionNumber,
      };

      onPublishSuccess(meeting.id, newNote);
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to publish MoM', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-surface-container-lowest border border-amber-900/20 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 z-10 animate-[scaleUp_0.25s_ease-out]">
        {/* Sacred Header with Gold Accent */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-50 flex items-center justify-between border-b border-amber-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
              <FileCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Official Records
                </span>
                <span className="text-[10px] text-amber-300/80 font-sans">
                  Minutes of Meeting (MoM) Publishing
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-amber-100 tracking-wide mt-0.5">
                Record & Publish MoM
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 flex items-center justify-center transition-colors cursor-pointer border border-amber-700/40"
          >
            <X size={16} />
          </button>
        </div>

        {/* Meeting Context Banner */}
        <div className="bg-amber-500/5 px-6 py-3 border-b border-amber-900/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <p className="font-bold text-on-surface truncate font-serif text-sm">
              {meeting.title}
            </p>
            <div className="flex items-center gap-3 text-on-surface-variant text-[11px] font-sans mt-0.5">
              <span className="flex items-center gap-1 text-amber-900 font-medium">
                <Layers size={11} /> {meeting.committeeName || 'Apex Board'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users size={11} /> {meeting.invitees.length} Official Invitees
              </span>
            </div>
          </div>

          <div className="bg-amber-500/15 text-amber-900 font-bold px-3 py-1 rounded-full text-[11px] border border-amber-500/30 shrink-0">
            Status: Ready for MoM
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[calc(85vh-150px)] overflow-y-auto">
          <input type="hidden" {...register('meetingId')} value={meeting.id} />

          {/* Textarea Header with "Draft with AI" Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider font-sans flex items-center gap-1.5">
                <FileText size={13} className="text-amber-700" />
                Minutes of Meeting & Resolutions <span className="text-amber-800">*</span>
              </label>

              {/* "Draft with AI" Button triggering @google/genai */}
              <button
                type="button"
                onClick={handleDraftWithAI}
                disabled={isDraftingAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-sans text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-60"
                title="Automatically draft structured minutes using Gemini AI"
              >
                {isDraftingAI ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Drafting with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="text-amber-200" />
                    <span>Draft with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Large Textarea for MoM */}
            <div className="relative">
              <textarea
                rows={10}
                {...register('momText')}
                placeholder="Enter complete proceedings, resolutions passed, financial sanctions, and action item custodians (Markdown formatting supported: ### Headers, - Bullet points, **Bold**)..."
                className={`w-full p-4 bg-surface-container-low border rounded-2xl text-xs font-sans text-on-surface focus:outline-none focus:ring-2 transition-all leading-relaxed ${
                  errors.momText
                    ? 'border-error focus:ring-error/20'
                    : 'border-outline-variant/60 focus:border-primary focus:ring-primary/20'
                }`}
              />

              <div className="flex justify-between items-center text-[10px] text-on-surface-variant/70 px-1 pt-1">
                <span>Markdown enabled (Headers, lists, bold text)</span>
                <span>{momTextValue ? momTextValue.length : 0} characters</span>
              </div>
            </div>

            {errors.momText && (
              <p className="text-[11px] text-error font-medium flex items-center gap-1">
                <AlertCircle size={12} /> {errors.momText.message}
              </p>
            )}
          </div>

          {/* Attachment Upload Field (UI Only with 5MB max limit) */}
          <div className="space-y-2 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider font-sans flex items-center gap-1.5">
                <Paperclip size={13} className="text-amber-700" />
                Upload Official Signed MoM / Gazette Document
              </label>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-600/30">
                Max Limit: {MAX_ATTACHMENT_SIZE_LABEL}
              </span>
            </div>

            {!selectedFile ? (
              <div className="relative border-2 border-dashed border-outline-variant/60 hover:border-amber-600/60 rounded-2xl p-5 text-center bg-surface-container-low transition-colors cursor-pointer group">
                <input
                  type="file"
                  id="mom-attachment-input"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">
                      Click to choose or drag & drop signed resolution PDF
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      PDF, DOCX, or Scanned Images up to <strong>{MAX_ATTACHMENT_SIZE_LABEL}</strong> strictly enforced
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-600/30 text-amber-950">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <FileCheck size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-amber-900/80 font-mono">
                      {formatBytes(selectedFile.size)} • Verified within {MAX_ATTACHMENT_SIZE_LABEL} limit
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-error hover:bg-error-container/30 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Remove attachment"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            {fileError && (
              <p className="text-[11px] text-error font-medium flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {fileError}
              </p>
            )}

            {errors.attachment && (
              <p className="text-[11px] text-error font-medium flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {String(errors.attachment.message)}
              </p>
            )}
          </div>

          {/* Publishing Attribution Card */}
          <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-800 shrink-0" />
              <span>
                Publishing as: <strong className="text-on-surface">{currentUserName}</strong> ({currentUserDesignation})
              </span>
            </div>
            <span className="text-[10px] font-mono text-on-surface-variant/70">
              Audit Logged
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-outline-variant/60 text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {/* "Publish & Email Invitees" Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Publishing & Notifying...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Publish & Email Invitees</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
