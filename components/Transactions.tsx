'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Printer,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Eye,
  ArrowRight,
  Sparkles,
  Download,
  ChevronDown
} from 'lucide-react';
import RequirePermission from './RequirePermission';

interface Pilgrim {
  name: string;
  gotra: string;
  nakshetra: string;
  age?: number | string;
  gender?: string;
  phone?: string;
  type?: 'Primary' | 'Family';
  gotram?: string;
  nakshatram?: string;
}

interface Booking {
  receiptNo: string;
  devoteeName: string;
  gotra: string;
  nakshetra: string;
  sevaName: string;
  amount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  bookingDate: string;
  timeSlot: string;
  persons?: number;
  age?: number | string;
  gender?: string;
  pilgrims?: Pilgrim[];
}

const DEFAULT_BOOKINGS: Booking[] = [
  { receiptNo: 'SV-2026-0612', devoteeName: 'Raghavendran Iyer', gotra: 'Bharadwaja', nakshetra: 'Krittika', sevaName: 'Maha Abhisheka', amount: 1500, paymentStatus: 'Paid', bookingDate: '2026-06-28', timeSlot: '07:30 AM' },
  { receiptNo: 'SV-2026-0613', devoteeName: 'Venkatesh Prasad', gotra: 'Kashyapa', nakshetra: 'Rohini', sevaName: 'Archana Pooja', amount: 101, paymentStatus: 'Paid', bookingDate: '2026-06-28', timeSlot: '09:00 AM' },
  { receiptNo: 'SV-2026-0614', devoteeName: 'Deepika Rao', gotra: 'Vasishta', nakshetra: 'Ashwini', sevaName: 'Annadanam Seva', amount: 2100, paymentStatus: 'Paid', bookingDate: '2026-06-28', timeSlot: '12:00 PM' },
  { receiptNo: 'SV-2026-0615', devoteeName: 'Suresh Kumar', gotra: 'Srivatsa', nakshetra: 'Revati', sevaName: 'Vahan Pooja', amount: 1100, paymentStatus: 'Pending', bookingDate: '2026-06-27', timeSlot: '04:30 PM' },
  { receiptNo: 'SV-2026-0616', devoteeName: 'Meenakshi Sundaram', gotra: 'Atri', nakshetra: 'Anuradha', sevaName: 'Archana Pooja', amount: 101, paymentStatus: 'Paid', bookingDate: '2026-06-27', timeSlot: '10:00 AM' },
  { receiptNo: 'SV-2026-0617', devoteeName: 'Vikram Hegde', gotra: 'Viswamitra', nakshetra: 'Sravana', sevaName: 'Chandi Homa', amount: 5001, paymentStatus: 'Paid', bookingDate: '2026-06-26', timeSlot: '06:00 AM' },
  { receiptNo: 'SV-2026-0618', devoteeName: 'Anantha Padmanabha', gotra: 'Kaushika', nakshetra: 'Uttara Phalguni', sevaName: 'Sahasranama Archana', amount: 501, paymentStatus: 'Paid', bookingDate: '2026-06-25', timeSlot: '08:30 AM' },
  { receiptNo: 'SV-2026-0619', devoteeName: 'Shruthi Vishwanath', gotra: 'Gautama', nakshetra: 'Punarvasu', sevaName: 'Maha Abhisheka', amount: 1500, paymentStatus: 'Refunded', bookingDate: '2026-06-25', timeSlot: '07:30 AM' },
  { receiptNo: 'SV-2026-0620', devoteeName: 'Hari Prasad Bhat', gotra: 'Angirasa', nakshetra: 'Jyeshtha', sevaName: 'Archana Pooja', amount: 101, paymentStatus: 'Paid', bookingDate: '2026-06-24', timeSlot: '11:00 AM' },
  { receiptNo: 'SV-2026-0621', devoteeName: 'Narayana Murthy', gotra: 'Shandilya', nakshetra: 'Pushya', sevaName: 'Chandi Homa', amount: 5001, paymentStatus: 'Pending', bookingDate: '2026-06-23', timeSlot: '06:00 AM' },
  { receiptNo: 'SV-2026-0622', devoteeName: 'Vijayalakshmi R.', gotra: 'Kashyapa', nakshetra: 'Hasta', sevaName: 'Sahasranama Archana', amount: 501, paymentStatus: 'Paid', bookingDate: '2026-06-22', timeSlot: '09:30 AM' },
  { receiptNo: 'SV-2026-0623', devoteeName: 'Srinivasa Raghavan', gotra: 'Bharadwaja', nakshetra: 'Swati', sevaName: 'Annadanam Seva', amount: 2100, paymentStatus: 'Paid', bookingDate: '2026-06-21', timeSlot: '12:30 PM' },
  { receiptNo: 'SV-2026-0624', devoteeName: 'Kalyani Deshpande', gotra: 'Vasishta', nakshetra: 'Chitra', sevaName: 'Vahan Pooja', amount: 1100, paymentStatus: 'Paid', bookingDate: '2026-06-20', timeSlot: '03:00 PM' }
];

export default function Transactions() {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sankalpvani_bookings');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) { }
      }
    }
    return DEFAULT_BOOKINGS;
  });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Pending' | 'Refunded'>('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [expandedReceiptNo, setExpandedReceiptNo] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sorting State
  const [sortKey, setSortKey] = useState<keyof Booking | 'bookingDate'>('bookingDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filtering State
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterSeva, setFilterSeva] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [templeStamp, setTempleStamp] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuANcPfzsfum8zGj2STDpP_Eds0xOoXxtm_OjHwVkP2MZOW3999u6oVf8P-7GeIMQA1hFSnmMM-gxsed4iDD-ruqP0OJKhI0LBMl2OTllKr3RJspedpV9pOsdDyz43dF_teOB1cC39MQgm579_rgeQq4Evh6iDEqE4aFi5LR5E3SLkqyCjsFrlyNnt_YF1ph80p1i-M4ec2yFc2A9oBE9U3sOA8W64XAiqtD-IxdDQLuoEYwwIz6gU1SePMjmWX2QVVSn1bT8aiesII');

  useEffect(() => {
    async function loadLiveLedger() {
      try {
        const res = await fetch('/api/v1/temples/temple_vidyashankara/bookings?trustId=trust_sringeri');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const mapped: Booking[] = json.data.map((b: any) => ({
              receiptNo: `SV-${new Date(b.bookingDate).getFullYear()}-${b.id.slice(-4)}`,
              devoteeName: b.primaryDevoteeName,
              gotra: b.gotra,
              nakshetra: b.nakshatra,
              sevaName: 'Ekadasa Rudrabhishekam',
              amount: Number(b.totalAmount),
              paymentStatus: b.paymentStatus as any,
              bookingDate: b.bookingDate.split('T')[0],
              timeSlot: b.slotTime
            }));
            setBookings(mapped);
            return;
          }
        }
      } catch (err) {
        console.warn('Using local transactions fallback');
      }

      if (typeof window !== 'undefined') {
        const cachedBookings = localStorage.getItem('sankalpvani_bookings');
        if (!cachedBookings) {
          localStorage.setItem('sankalpvani_bookings', JSON.stringify(DEFAULT_BOOKINGS));
        }
      }
    }

    loadLiveLedger();

    const cached = localStorage.getItem('sankalpvani_temple_details');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.photos && parsed.photos.length > 0) {
          const primaryIndex = parsed.primaryPhotoIndex ?? 0;
          if (parsed.photos[primaryIndex]) {
            setTempleStamp(parsed.photos[primaryIndex]);
          }
        }
      } catch (e) { }
    }

    const handleBookingsUpdate = () => {
      const updatedCached = localStorage.getItem('sankalpvani_bookings');
      if (updatedCached) {
        try {
          setBookings(JSON.parse(updatedCached));
        } catch (e) {}
      }
    };

    window.addEventListener('sankalpvani_bookings_updated', handleBookingsUpdate);
    return () => {
      window.removeEventListener('sankalpvani_bookings_updated', handleBookingsUpdate);
    };
  }, []);

  // Reset page when filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterSeva, startDate, endDate, sortKey, sortDirection]);

  const uniqueSevas = Array.from(new Set(bookings.map(b => b.sevaName)));

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.devoteeName.toLowerCase().includes(search.toLowerCase()) ||
      b.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
      b.sevaName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || b.paymentStatus === filterStatus;
    const matchesSeva = filterSeva === 'All' || b.sevaName === filterSeva;

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && b.bookingDate >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && b.bookingDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesSeva && matchesDate;
  });

  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleSort = (key: keyof Booking | 'bookingDate') => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortedBookings = (list: Booking[]) => {
    return [...list].sort((a, b) => {
      let valA = a[sortKey as keyof Booking] ?? '';
      let valB = b[sortKey as keyof Booking] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const renderSortIndicator = (key: keyof Booking | 'bookingDate') => {
    if (sortKey !== key) {
      return <span className="inline-block ml-1 opacity-25">↕</span>;
    }
    return sortDirection === 'asc' ? (
      <span className="inline-block ml-1 text-primary">↑</span>
    ) : (
      <span className="inline-block ml-1 text-primary">↓</span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Receipt No', 'Devotee Name', 'Gotra', 'Nakshetra', 'Seva Name', 'Amount', 'Date', 'Time Slot', 'Status'];

    const rows = getSortedBookings(filteredBookings).map(b => [
      b.receiptNo,
      `"${b.devoteeName.replace(/"/g, '""')}"`,
      b.gotra,
      b.nakshetra,
      `"${b.sevaName.replace(/"/g, '""')}"`,
      b.amount,
      b.bookingDate,
      b.timeSlot,
      b.paymentStatus
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SankalpVani_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Devotee transaction ledger exported to CSV successfully!');
  };

  const triggerPrint = (booking: Booking) => {
    const refCode = booking.receiptNo.replace(/\D/g, '') || '20260612';
    setToastMessage(`Receipt ${booking.receiptNo} (Verification Ref Code: ${refCode}) sent to on-site thermal printer...`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-primary-container text-on-primary-container border border-primary/20 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <Printer size={18} className="text-primary animate-pulse" />
          <span className="font-sans text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-semibold text-primary">Seva Transactions Ledger</h2>
        <p className="font-sans text-sm text-on-surface-variant font-medium mt-1">
          Review devotee pooja receipts, verify payment settlements, and print administrative darshan slips.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <input
                type="text"
                placeholder="Search Receipt # or Devotee Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Toggle Advanced Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${showFilters
                  ? 'bg-primary-container/20 border-primary text-primary shadow-sm'
                  : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary hover:bg-surface-container-low'
                }`}
            >
              <Filter size={14} />
              <span>{showFilters ? 'Hide Filters' : 'Advanced Filters'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto justify-end">
            {/* Status Segmented Buttons */}
            <div className="flex gap-1.5 p-1 bg-white/60 rounded-xl border border-outline-variant/30 w-full sm:w-auto overflow-x-auto">
              {(['All', 'Paid', 'Pending', 'Refunded'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterStatus === status
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-primary'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              className="w-full sm:w-auto bg-primary hover:bg-on-primary-container text-on-primary text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 grid grid-cols-1 md:grid-cols-3 gap-4 animate-[scaleIn_0.15s_ease-out]">
            {/* Seva Dropdown */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Filter by Seva Offering</label>
              <select
                value={filterSeva}
                onChange={(e) => setFilterSeva(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline rounded-lg text-xs focus:outline-none focus:border-primary"
              >
                <option value="All">All Seva Offerings</option>
                {uniqueSevas.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface-container-low border border-outline rounded-lg text-xs focus:outline-none focus:border-primary font-mono"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface-container-low border border-outline rounded-lg text-xs focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bookings Table Ledger */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b divider-gold text-[11px] font-bold text-on-surface-variant uppercase tracking-wider select-none">
                <th
                  className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('receiptNo')}
                >
                  Receipt # {renderSortIndicator('receiptNo')}
                </th>
                <th
                  className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('devoteeName')}
                >
                  Devotee Name {renderSortIndicator('devoteeName')}
                </th>
                <th className="py-4 px-6">Gotra & Nakshetra</th>
                <th
                  className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('sevaName')}
                >
                  Booked Seva Offer {renderSortIndicator('sevaName')}
                </th>
                <th
                  className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('bookingDate')}
                >
                  Pooja Date {renderSortIndicator('bookingDate')}
                </th>
                <th
                  className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  Settled Ticket {renderSortIndicator('amount')}
                </th>
                <th
                  className="py-4 px-6 text-center cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('paymentStatus')}
                >
                  Status {renderSortIndicator('paymentStatus')}
                </th>
                <th className="py-4 px-6 text-center">Receipt Slips</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-on-surface divide-y divide-outline-variant/10">
              {getSortedBookings(filteredBookings)
                .slice(startIndex, startIndex + itemsPerPage)
                .map((b) => (
                  <React.Fragment key={b.receiptNo}>
                    <tr className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-primary">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setExpandedReceiptNo(expandedReceiptNo === b.receiptNo ? null : b.receiptNo)}
                            className="p-1 hover:bg-primary-container/10 text-primary rounded-lg transition-colors cursor-pointer"
                            title="Toggle pilgrim roster"
                          >
                            <ChevronDown size={14} className={`transform transition-transform ${expandedReceiptNo === b.receiptNo ? 'rotate-180' : ''}`} />
                          </button>
                          <span>{b.receiptNo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold">{b.devoteeName}</td>
                      <td className="py-4 px-6 text-xs text-on-surface-variant font-semibold">
                        G: {b.gotra} / N: {b.nakshetra}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant font-semibold">{b.sevaName}</td>
                      <td className="py-4 px-6 text-xs text-on-surface-variant font-mono">{b.bookingDate}</td>
                      <td className="py-4 px-6 font-bold text-on-surface">
                        <div className="space-y-0.5 font-medium">
                          <span className="font-bold text-on-surface block">₹{b.amount.toLocaleString()}</span>
                          <span className="text-[10px] text-on-surface-variant/70 block">{b.timeSlot}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${b.paymentStatus === 'Paid'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : b.paymentStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                          {b.paymentStatus === 'Paid' ? (
                            <CheckCircle size={12} className="mr-1 shrink-0 text-green-600" />
                          ) : b.paymentStatus === 'Pending' ? (
                            <Clock size={12} className="mr-1 shrink-0 text-amber-600" />
                          ) : (
                            <AlertCircle size={12} className="mr-1 shrink-0 text-red-600" />
                          )}
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 hover:bg-primary-container/10 text-primary rounded-lg transition-colors cursor-pointer"
                            title="Inspect ticket details"
                          >
                            <Eye size={14} />
                          </button>
                          <RequirePermission permission="PRINT_RECEIPTS">
                            <button
                              onClick={() => triggerPrint(b)}
                              className="p-1.5 hover:bg-secondary-container/20 text-secondary rounded-lg transition-colors cursor-pointer"
                              title="Print Thermal slip"
                            >
                              <Printer size={14} />
                            </button>
                          </RequirePermission>
                        </div>
                      </td>
                    </tr>
                    {expandedReceiptNo === b.receiptNo && (
                      <tr className="bg-primary/5">
                        <td colSpan={8} className="p-4 px-6">
                          <div className="bg-surface-container-lowest border border-primary/10 rounded-xl p-4 space-y-3">
                            <h4 className="font-bold text-primary text-[10px] uppercase tracking-wider">Pilgrims Roster & Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
                                <p className="font-bold text-on-surface text-xs">{b.devoteeName} (Primary)</p>
                                <p className="text-on-surface-variant text-[11px] mt-0.5">Gotra: <span className="font-mono">{b.gotra}</span> | Nakshatra: <span className="font-mono">{b.nakshetra}</span></p>
                                <p className="text-on-surface-variant text-[11px]">Age: {b.age || 'N/A'} | Gender: {b.gender || 'N/A'}</p>
                              </div>
                              {b.pilgrims && b.pilgrims.map((p, pIdx) => (
                                <div key={pIdx} className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
                                  <p className="font-bold text-on-surface text-xs">{p.name} ({p.type || 'Family'})</p>
                                  <p className="text-on-surface-variant text-[11px] mt-0.5">Gotra: <span className="font-mono">{p.gotra || p.gotram}</span> | Nakshatra: <span className="font-mono">{p.nakshetra || p.nakshatram}</span></p>
                                  <p className="text-on-surface-variant text-[11px]">Age: {p.age || 'N/A'} | Gender: {p.gender || 'N/A'}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-surface-container-low border-t border-outline-variant/10 gap-4">
          <div className="text-xs text-on-surface-variant font-medium">
            Showing <span className="font-bold">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
            <span className="font-bold">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
            <span className="font-bold">{totalItems}</span> entries
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-bold bg-white text-on-surface-variant hover:border-primary disabled:opacity-50 disabled:hover:border-outline-variant/30 disabled:bg-surface-container transition-all cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${currentPage === page
                      ? 'bg-primary border-primary text-on-primary shadow-sm'
                      : 'bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-bold bg-white text-on-surface-variant hover:border-primary disabled:opacity-50 disabled:hover:border-outline-variant/30 disabled:bg-surface-container transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* High-Fidelity Receipt Pop-Up Dialog */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedBooking(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-4 border-double border-primary/40 p-6 animate-[scaleIn_0.2s_ease-out]">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute right-4 top-4 p-2 hover:bg-surface-container-low text-on-surface-variant rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Receipt Content Layout */}
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center border-b divider-gold pb-4">
                <img
                  alt="SankalpVani Stamp"
                  className="w-12 h-12 rounded-full mb-2 object-cover border border-primary/20"
                  src={templeStamp}
                />
                <h3 className="font-serif text-2xl text-primary font-bold">SankalpVani Devasthanam</h3>
                <p className="font-serif text-[10px] text-primary italic mt-0.5">
                  ॥ श्रीः शुभमस्तु देवकार्य सिद्ध्यर्थम् ॥
                </p>
                <span className="font-sans text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">
                  OFFICIAL SEVA DARSHAN SLIP
                </span>
              </div>

              {/* Data Rows */}
              <div className="space-y-2.5 text-left font-sans text-sm border-b divider-gold pb-4">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Receipt Number:</span>
                  <span className="font-bold font-mono text-primary">{selectedBooking.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Devotee Pilgrim:</span>
                  <span className="font-bold text-on-surface">{selectedBooking.devoteeName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant font-medium">Gotra / Nakshetra:</span>
                  <span className="font-bold text-on-surface-variant">{selectedBooking.gotra} / {selectedBooking.nakshetra}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Seva Pooja:</span>
                  <span className="font-bold text-primary">{selectedBooking.sevaName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Reporting Time:</span>
                  <span className="font-semibold text-on-surface">{selectedBooking.bookingDate} at {selectedBooking.timeSlot}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-outline-variant pt-2 mt-2">
                  <span className="text-on-surface-variant font-medium">Verification Ref Code:</span>
                  <span className="font-bold font-mono text-on-surface">
                    {selectedBooking.receiptNo.replace(/\D/g, '') || '20260612'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-dashed border-outline-variant pt-2 mt-1">
                  <span className="text-on-surface-variant font-bold uppercase tracking-wider text-xs">Settled Amount:</span>
                  <span className="font-bold text-base text-on-surface">₹{selectedBooking.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions inside dialog */}
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => triggerPrint(selectedBooking)}
                  className="flex-1 bg-primary hover:bg-on-primary-container text-on-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => {
                    const refCode = selectedBooking.receiptNo.replace(/\D/g, '') || '20260612';
                    alert(`Downloading high-fidelity digital PDF receipt for ${selectedBooking.receiptNo} to local Downloads directory.\nVerification Ref Code: ${refCode}`);
                  }}
                  className="px-3 py-2.5 border border-outline-variant hover:bg-surface-container-low text-on-surface-variant rounded-xl transition-colors cursor-pointer"
                  title="Download receipt PDF"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
