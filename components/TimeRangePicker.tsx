'use client';

import React from 'react';
import { Clock, Smile, ChevronUp, ChevronDown } from 'lucide-react';

const normalizeTime = (timeStr: string) => {
  if (!timeStr) return '06:00 AM';
  const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (match) {
    const hr = String(Number(match[1])).padStart(2, '0');
    const min = match[2];
    const ampm = match[3].toUpperCase();
    return `${hr}:${min} ${ampm}`;
  }
  return timeStr;
};

const parseTimeRange = (range: string) => {
  if (!range || range === 'N/A' || range === 'Closed') {
    return { isClosed: true, start: '06:00 AM', end: '12:30 PM' };
  }
  const parts = range.split('-').map(p => p.trim());
  if (parts.length === 2) {
    return { isClosed: false, start: normalizeTime(parts[0]), end: normalizeTime(parts[1]) };
  }
  return { isClosed: false, start: '06:00 AM', end: '12:30 PM' };
};

const parseTime = (timeStr: string) => {
  const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (match) {
    return {
      hour: Number(match[1]),
      minute: Number(match[2]),
      meridian: match[3].toUpperCase() as 'AM' | 'PM'
    };
  }
  return { hour: 6, minute: 0, meridian: 'AM' as const };
};

interface TimeInputSegmentProps {
  label: string;
  hour: number;
  minute: number;
  meridian: 'AM' | 'PM';
  onChange: (h: number, m: number, merid: 'AM' | 'PM') => void;
  disabled?: boolean;
}

function TimeInputSegment({ label, hour, minute, meridian, onChange, disabled }: TimeInputSegmentProps) {
  const handleHourChange = (valStr: string) => {
    let val = parseInt(valStr.replace(/\D/g, ''), 10);
    if (isNaN(val)) val = 12;
    if (val < 1) val = 1;
    if (val > 12) val = 12;
    onChange(val, minute, meridian);
  };

  const handleMinuteChange = (valStr: string) => {
    let val = parseInt(valStr.replace(/\D/g, ''), 10);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 59) val = 59;
    onChange(hour, val, meridian);
  };

  const incrementHour = () => {
    let next = hour + 1;
    if (next > 12) next = 1;
    onChange(next, minute, meridian);
  };

  const decrementHour = () => {
    let prev = hour - 1;
    if (prev < 1) prev = 12;
    onChange(prev, minute, meridian);
  };

  const incrementMinute = () => {
    let next = minute + 1;
    if (next > 59) next = 0;
    onChange(hour, next, meridian);
  };

  const decrementMinute = () => {
    let prev = minute - 1;
    if (prev < 0) prev = 59;
    onChange(hour, prev, meridian);
  };

  const toggleMeridian = () => {
    const nextMerid = meridian === 'AM' ? 'PM' : 'AM';
    onChange(hour, minute, nextMerid);
  };

  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80 truncate">{label}</span>
      <div className="flex items-center gap-1">
        {/* Hour Input with custom up/down arrows */}
        <div className={`flex items-center bg-surface-container-low border border-outline rounded-xl px-1.5 py-0.5 gap-1 transition-all ${disabled ? 'opacity-50 pointer-events-none' : 'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'}`}>
          <input
            type="text"
            maxLength={2}
            disabled={disabled}
            value={String(hour).padStart(2, '0')}
            onChange={(e) => handleHourChange(e.target.value)}
            className="w-5 text-center bg-transparent border-none outline-none font-mono text-xs font-bold text-on-surface p-0"
          />
          <div className="flex flex-col -gap-0.5">
            <button
              type="button"
              disabled={disabled}
              onClick={incrementHour}
              className="text-on-surface-variant/60 hover:text-primary transition-colors p-0 cursor-pointer flex items-center justify-center"
            >
              <ChevronUp size={10} strokeWidth={3} />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={decrementHour}
              className="text-on-surface-variant/60 hover:text-primary transition-colors p-0 cursor-pointer flex items-center justify-center"
            >
              <ChevronDown size={10} strokeWidth={3} />
            </button>
          </div>
        </div>

        <span className="text-on-surface-variant font-bold text-xs shrink-0 select-none">:</span>

        {/* Minute Input with custom up/down arrows */}
        <div className={`flex items-center bg-surface-container-low border border-outline rounded-xl px-1.5 py-0.5 gap-1 transition-all ${disabled ? 'opacity-50 pointer-events-none' : 'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'}`}>
          <input
            type="text"
            maxLength={2}
            disabled={disabled}
            value={String(minute).padStart(2, '0')}
            onChange={(e) => handleMinuteChange(e.target.value)}
            className="w-5 text-center bg-transparent border-none outline-none font-mono text-xs font-bold text-on-surface p-0"
          />
          <div className="flex flex-col -gap-0.5">
            <button
              type="button"
              disabled={disabled}
              onClick={incrementMinute}
              className="text-on-surface-variant/60 hover:text-primary transition-colors p-0 cursor-pointer flex items-center justify-center"
            >
              <ChevronUp size={10} strokeWidth={3} />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={decrementMinute}
              className="text-on-surface-variant/60 hover:text-primary transition-colors p-0 cursor-pointer flex items-center justify-center"
            >
              <ChevronDown size={10} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* AM/PM Button Toggle */}
        <button
          type="button"
          disabled={disabled}
          onClick={toggleMeridian}
          className={`px-2 py-1 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer ${
            disabled 
              ? 'opacity-40 pointer-events-none bg-surface-container border-outline/20 text-on-surface-variant/50' 
              : meridian === 'AM'
                ? 'bg-primary-container/20 text-primary border-primary/20 hover:bg-primary-container/30'
                : 'bg-tertiary-container/20 text-tertiary border-tertiary/20 hover:bg-tertiary-container/30'
          }`}
        >
          {meridian}
        </button>
      </div>
    </div>
  );
}

interface TimeRangePickerProps {
  value: string;
  onChange: (newValue: string) => void;
  label: string;
}

export default function TimeRangePicker({ value, onChange, label }: TimeRangePickerProps) {
  const { isClosed, start, end } = parseTimeRange(value);

  const startTime = parseTime(start);
  const endTime = parseTime(end);

  const handleStartChange = (h: number, m: number, merid: 'AM' | 'PM') => {
    const formattedStart = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${merid}`;
    onChange(`${formattedStart} - ${end}`);
  };

  const handleEndChange = (h: number, m: number, merid: 'AM' | 'PM') => {
    const formattedEnd = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${merid}`;
    onChange(`${start} - ${formattedEnd}`);
  };

  const handleToggleClosed = () => {
    if (isClosed) {
      onChange(`${start} - ${end}`);
    } else {
      onChange('Closed');
    }
  };

  return (
    <div className="bg-surface-container-low/45 p-4 rounded-2xl border border-outline-variant/20 shadow-sm space-y-4">
      {/* Label and Closed Status row */}
      <div className="flex justify-between items-center pb-2.5 border-b border-outline-variant/10">
        <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Clock size={14} className="text-primary" /> {label}
        </span>

        {/* Closed/Active toggle switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input 
            type="checkbox"
            checked={!isClosed}
            onChange={handleToggleClosed}
            className="w-4 h-4 text-primary border-outline rounded cursor-pointer accent-primary"
          />
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {!isClosed ? 'Active' : 'Closed'}
          </span>
        </label>
      </div>

      {!isClosed ? (
        <div className="grid grid-cols-2 gap-3.5 items-start">
          <TimeInputSegment
            label="Start Time"
            hour={startTime.hour}
            minute={startTime.minute}
            meridian={startTime.meridian}
            onChange={handleStartChange}
          />
          
          <TimeInputSegment
            label="End Time"
            hour={endTime.hour}
            minute={endTime.minute}
            meridian={endTime.meridian}
            onChange={handleEndChange}
          />
        </div>
      ) : (
        <div className="py-4 rounded-xl bg-surface-container-low/50 border border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-4 text-center">
          <Smile className="text-outline-variant/40 w-6 h-6 mb-1" />
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Session is Closed</p>
        </div>
      )}
    </div>
  );
}
