'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  Activity, 
  Download,
  DollarSign,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  PackageCheck
} from 'lucide-react';

interface RawBooking {
  id: string;
  devoteeName: string;
  sevaName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Refunded';
  date: string; // YYYY-MM-DD
}

const RAW_BOOKINGS: RawBooking[] = [
  // July 2026
  { id: 'TX-1001', devoteeName: 'Raghavendran Iyer', sevaName: 'Maha Abhisheka', amount: 1500, status: 'Paid', date: '2026-07-24' },
  { id: 'TX-1002', devoteeName: 'Venkatesh Prasad', sevaName: 'Archana Pooja', amount: 101, status: 'Paid', date: '2026-07-24' },
  { id: 'TX-1003', devoteeName: 'Deepika Rao', sevaName: 'Annadanam Seva', amount: 2100, status: 'Paid', date: '2026-07-23' },
  { id: 'TX-1004', devoteeName: 'Suresh Kumar', sevaName: 'Vahan Pooja', amount: 1100, status: 'Pending', date: '2026-07-22' },
  { id: 'TX-1005', devoteeName: 'Meenakshi Sundaram', sevaName: 'Archana Pooja', amount: 101, status: 'Paid', date: '2026-07-22' },
  { id: 'TX-1006', devoteeName: 'Vikram Hegde', sevaName: 'Chandi Homa', amount: 5001, status: 'Paid', date: '2026-07-21' },
  { id: 'TX-1007', devoteeName: 'Anantha Padmanabha', sevaName: 'Sahasranama Archana', amount: 501, status: 'Paid', date: '2026-07-20' },
  // June 2026
  { id: 'TX-1008', devoteeName: 'Shruthi Vishwanath', sevaName: 'Maha Abhisheka', amount: 1500, status: 'Refunded', date: '2026-06-28' },
  { id: 'TX-1009', devoteeName: 'Hari Prasad Bhat', sevaName: 'Archana Pooja', amount: 101, status: 'Paid', date: '2026-06-25' },
  { id: 'TX-1010', devoteeName: 'Narayana Murthy', sevaName: 'Chandi Homa', amount: 5001, status: 'Pending', date: '2026-06-20' },
  { id: 'TX-1011', devoteeName: 'Vijayalakshmi R.', sevaName: 'Sahasranama Archana', amount: 501, status: 'Paid', date: '2026-06-15' },
  { id: 'TX-1012', devoteeName: 'Srinivasa Raghavan', sevaName: 'Annadanam Seva', amount: 2100, status: 'Paid', date: '2026-06-10' },
  // May 2026
  { id: 'TX-1013', devoteeName: 'Kalyani Deshpande', sevaName: 'Vahan Pooja', amount: 1100, status: 'Paid', date: '2026-05-28' },
  { id: 'TX-1014', devoteeName: 'Rajesh Sharma', sevaName: 'Maha Abhisheka', amount: 1500, status: 'Paid', date: '2026-05-18' },
  { id: 'TX-1015', devoteeName: 'Latha Hegde', sevaName: 'Archana Pooja', amount: 101, status: 'Paid', date: '2026-05-05' }
];

interface RawShipment {
  id: string;
  status: 'Pending' | 'Packed' | 'Shipped';
}

const RAW_SHIPMENTS: RawShipment[] = [
  { id: 'PR-1090', status: 'Pending' },
  { id: 'PR-1091', status: 'Packed' },
  { id: 'PR-1092', status: 'Shipped' },
  { id: 'PR-1093', status: 'Pending' },
  { id: 'PR-1094', status: 'Pending' },
  { id: 'PR-1095', status: 'Packed' },
  { id: 'PR-1096', status: 'Shipped' },
  { id: 'PR-1097', status: 'Pending' },
  { id: 'PR-1098', status: 'Pending' }
];

interface AggregatedRow {
  label: string;
  bookingsCount: number;
  settledRevenue: number;
  pendingAmount: number;
  refundedAmount: number;
  extraInfo?: string;
}

export default function SystemOverview() {
  // Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTab, setSelectedTab] = useState<'daily' | 'seva' | 'monthly' | 'yearly'>('daily');

  // Sorting State
  const [sortKey, setSortKey] = useState<keyof AggregatedRow>('label');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reset page index on tab/filter updates
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, startDate, endDate, sortKey, sortDirection]);

  // Aggregate stats on filtered bookings
  const filteredBookings = RAW_BOOKINGS.filter(b => {
    if (startDate && b.date < startDate) return false;
    if (endDate && b.date > endDate) return false;
    return true;
  });

  const totalBookings = filteredBookings.length;
  const totalRevenue = filteredBookings
    .filter(b => b.status === 'Paid')
    .reduce((sum, b) => sum + b.amount, 0);

  const averageTicket = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  
  // Prasads fulfillment calculations
  const pendingPrasads = RAW_SHIPMENTS.filter(s => s.status === 'Pending').length;
  const packedPrasads = RAW_SHIPMENTS.filter(s => s.status === 'Packed').length;
  const shippedPrasads = RAW_SHIPMENTS.filter(s => s.status === 'Shipped').length;
  const totalPrasads = RAW_SHIPMENTS.length;
  const fulfillmentRate = totalPrasads > 0 ? Math.round(((packedPrasads + shippedPrasads) / totalPrasads) * 100) : 0;

  // Process Aggregated Data List
  const getAggregatedData = (): AggregatedRow[] => {
    const groups: { [key: string]: { bookings: number; revenue: number; pending: number; refunded: number; } } = {};

    filteredBookings.forEach(b => {
      let groupKey = '';
      if (selectedTab === 'daily') {
        groupKey = b.date;
      } else if (selectedTab === 'seva') {
        groupKey = b.sevaName;
      } else if (selectedTab === 'monthly') {
        groupKey = b.date.substring(0, 7); // YYYY-MM
      } else if (selectedTab === 'yearly') {
        groupKey = b.date.substring(0, 4); // YYYY
      }

      if (!groups[groupKey]) {
        groups[groupKey] = { bookings: 0, revenue: 0, pending: 0, refunded: 0 };
      }

      groups[groupKey].bookings++;
      if (b.status === 'Paid') {
        groups[groupKey].revenue += b.amount;
      } else if (b.status === 'Pending') {
        groups[groupKey].pending += b.amount;
      } else if (b.status === 'Refunded') {
        groups[groupKey].refunded += b.amount;
      }
    });

    return Object.keys(groups).map(key => {
      let label = key;
      if (selectedTab === 'monthly') {
        const [yr, mn] = key.split('-');
        const dateObj = new Date(Number(yr), Number(mn) - 1, 1);
        label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }

      let extraInfo = '';
      if (selectedTab === 'seva') {
        const utils: { [key: string]: string } = {
          'Maha Abhisheka': '85%',
          'Archana Pooja': '92%',
          'Annadanam Seva': '75%',
          'Vahan Pooja': '60%',
          'Chandi Homa': '40%',
          'Sahasranama Archana': '80%'
        };
        extraInfo = utils[key] || '75%';
      }

      return {
        label,
        bookingsCount: groups[key].bookings,
        settledRevenue: groups[key].revenue,
        pendingAmount: groups[key].pending,
        refundedAmount: groups[key].refunded,
        extraInfo
      };
    });
  };

  const handleSort = (key: keyof AggregatedRow) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortedData = (list: AggregatedRow[]) => {
    return [...list].sort((a, b) => {
      const valA = a[sortKey] ?? '';
      const valB = b[sortKey] ?? '';

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

  const renderSortIndicator = (key: keyof AggregatedRow) => {
    if (sortKey !== key) {
      return <span className="inline-block ml-1 opacity-25">↕</span>;
    }
    return sortDirection === 'asc' ? (
      <span className="inline-block ml-1 text-primary">↑</span>
    ) : (
      <span className="inline-block ml-1 text-primary">↓</span>
    );
  };

  const exportReportCSV = () => {
    let headers: string[] = [];
    if (selectedTab === 'seva') {
      headers = ['Seva Name', 'Total Bookings', 'Settled Revenue (₹)', 'Capacity Util %'];
    } else {
      headers = [
        selectedTab === 'daily' ? 'Pooja Date' : selectedTab === 'monthly' ? 'Month' : 'Year',
        'Total Bookings',
        'Settled Revenue (₹)',
        'Pending Amount (₹)',
        'Refunded Amount (₹)'
      ];
    }

    const rows = getSortedData(getAggregatedData()).map(row => {
      if (selectedTab === 'seva') {
        return [
          `"${row.label.replace(/"/g, '""')}"`,
          row.bookingsCount,
          row.settledRevenue,
          row.extraInfo || 'N/A'
        ];
      } else {
        return [
          row.label,
          row.bookingsCount,
          row.settledRevenue,
          row.pendingAmount,
          row.refundedAmount
        ];
      }
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SankalpVani_Reports_${selectedTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} report exported successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const aggregatedData = getAggregatedData();
  const sortedData = getSortedData(aggregatedData);
  const totalRowsCount = sortedData.length;
  const totalPages = Math.ceil(totalRowsCount / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Seva contribution levels (Static lists populated from mock data totals for progress bars)
  const sevaContributions = [
    { name: 'Chandi Homa', amount: 10002, percent: 42, color: 'bg-primary' },
    { name: 'Maha Abhisheka', amount: 4500, percent: 19, color: 'bg-blue-600' },
    { name: 'Annadanam Seva', amount: 4200, percent: 17, color: 'bg-[#fed65b]' },
    { name: 'Vahan Pooja', amount: 2200, percent: 9, color: 'bg-purple-600' },
    { name: 'Sahasranama Archana', amount: 1002, percent: 8, color: 'bg-teal-600' },
    { name: 'Archana Pooja', amount: 404, percent: 5, color: 'bg-green-600' }
  ];

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-primary-container text-on-primary-container border border-primary/20 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <PackageCheck size={18} className="text-primary animate-pulse" />
          <span className="font-sans text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-primary">Administrative Reports & Analytics</h2>
          <p className="font-sans text-sm text-on-surface-variant font-medium mt-1">
            Analyze pilgrim booking volumes, cash collections, and prasadam logistics across custom reporting periods.
          </p>
        </div>
      </div>

      {/* Filters & Export Control Bar */}
      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="text-primary" />
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Report Duration:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-white border border-outline rounded-lg text-xs focus:outline-none focus:border-primary font-mono"
            placeholder="Start Date"
          />
          <span className="text-xs text-on-surface-variant font-bold">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-white border border-outline rounded-lg text-xs focus:outline-none focus:border-primary font-mono"
            placeholder="End Date"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>

        <button
          onClick={exportReportCSV}
          className="w-full md:w-auto bg-primary hover:bg-on-primary-container text-on-primary text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Download size={14} />
          <span>Export Summary Report</span>
        </button>
      </div>

      {/* Performance Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total revenue */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sacred">
          <div className="flex justify-between items-start mb-4">
            <span className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Total Collections
            </span>
            <DollarSign size={18} className="text-green-600" />
          </div>
          <h3 className="font-mono text-3xl font-bold text-on-surface">
            ₹{totalRevenue.toLocaleString()}
          </h3>
          <p className="font-sans text-xs text-on-surface-variant font-semibold mt-1">
            Settled bank payouts
          </p>
        </div>

        {/* Total Bookings */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sacred">
          <div className="flex justify-between items-start mb-4">
            <span className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Total Bookings
            </span>
            <Briefcase size={18} className="text-blue-600" />
          </div>
          <h3 className="font-mono text-3xl font-bold text-on-surface">
            {totalBookings} tickets
          </h3>
          <p className="font-sans text-xs text-on-surface-variant font-semibold mt-1">
            Seva offerings registered
          </p>
        </div>

        {/* ATV */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sacred">
          <div className="flex justify-between items-start mb-4">
            <span className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Average Ticket Value
            </span>
            <Activity size={18} className="text-primary" />
          </div>
          <h3 className="font-mono text-3xl font-bold text-on-surface">
            ₹{averageTicket.toLocaleString()}
          </h3>
          <p className="font-sans text-xs text-on-surface-variant font-semibold mt-1">
            Avg spending per pilgrim
          </p>
        </div>

        {/* Prasads fulfilled */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sacred">
          <div className="flex justify-between items-start mb-4">
            <span className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Prasadam Delivery Rate
            </span>
            <Layers size={18} className="text-amber-600" />
          </div>
          <h3 className="font-mono text-3xl font-bold text-on-surface">
            {fulfillmentRate}%
          </h3>
          <p className="font-sans text-xs text-on-surface-variant font-semibold mt-1">
            {packedPrasads + shippedPrasads} of {totalPrasads} parcels packaged
          </p>
        </div>
      </div>

      {/* Aggregate Report Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 overflow-hidden">
        {/* Tab switcher headers */}
        <div className="bg-surface-container-low border-b border-outline-variant/20 px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-sans text-sm font-bold text-on-surface-variant uppercase tracking-wider">
            Aggregated Ledger Breakdown
          </h3>
          <div className="flex p-0.5 bg-white border border-outline-variant/30 rounded-xl gap-1">
            {(['daily', 'seva', 'monthly', 'yearly'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setSelectedTab(tab); setSortKey('label'); setSortDirection('desc'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                  selectedTab === tab 
                    ? 'bg-primary text-on-primary shadow-sm' 
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b divider-gold text-[11px] font-bold text-on-surface-variant uppercase tracking-wider select-none">
                <th 
                  className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('label')}
                >
                  {selectedTab === 'daily' ? 'Pooja Date' : selectedTab === 'seva' ? 'Seva offering' : selectedTab === 'monthly' ? 'Month' : 'Year'} {renderSortIndicator('label')}
                </th>
                <th 
                  className="py-4 px-6 cursor-pointer hover:text-primary transition-colors text-center"
                  onClick={() => handleSort('bookingsCount')}
                >
                  Total Bookings {renderSortIndicator('bookingsCount')}
                </th>
                <th 
                  className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('settledRevenue')}
                >
                  Settled Revenue (₹) {renderSortIndicator('settledRevenue')}
                </th>
                
                {selectedTab === 'seva' ? (
                  <th className="py-4 px-6 text-center">Simulated Slot Capacity Util</th>
                ) : (
                  <>
                    <th 
                      className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('pendingAmount')}
                    >
                      Pending (₹) {renderSortIndicator('pendingAmount')}
                    </th>
                    <th 
                      className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleSort('refundedAmount')}
                    >
                      Refunded (₹) {renderSortIndicator('refundedAmount')}
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-on-surface divide-y divide-outline-variant/10">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant font-medium">
                    No transactions recorded in this period.
                  </td>
                </tr>
              ) : (
                pageItems.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-4 px-6 font-bold">{row.label}</td>
                    <td className="py-4 px-6 text-center font-mono text-xs font-bold text-on-surface-variant">
                      {row.bookingsCount} bookings
                    </td>
                    <td className="py-4 px-6 font-bold text-on-surface">₹{row.settledRevenue.toLocaleString()}</td>
                    
                    {selectedTab === 'seva' ? (
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-green-200">
                          {row.extraInfo}
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="py-4 px-6 text-amber-600 font-semibold">₹{row.pendingAmount.toLocaleString()}</td>
                        <td className="py-4 px-6 text-red-600 font-semibold">₹{row.refundedAmount.toLocaleString()}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-surface-container-low border-t border-outline-variant/10 gap-4">
          <div className="text-xs text-on-surface-variant font-medium">
            Showing <span className="font-bold">{totalRowsCount === 0 ? 0 : startIndex + 1}</span> to{' '}
            <span className="font-bold">{Math.min(startIndex + itemsPerPage, totalRowsCount)}</span> of{' '}
            <span className="font-bold">{totalRowsCount}</span> report items
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    currentPage === page
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

      {/* Visual Progress Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Seva Contribution Progress */}
        <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sacred">
          <h3 className="font-sans text-base font-bold text-on-surface mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Seva Revenue Contributions
          </h3>
          
          <div className="space-y-4">
            {sevaContributions.map((c, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-bold text-on-surface mb-1">
                  <span>{c.name}</span>
                  <span className="text-on-surface-variant font-medium">
                    {c.percent}% (₹{c.amount.toLocaleString()})
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                  <div className={`${c.color} h-2.5 rounded-full`} style={{ width: `${c.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prasad Pipeline Tracker */}
        <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sacred">
          <h3 className="font-sans text-base font-bold text-on-surface mb-6 flex items-center gap-2">
            <ShieldCheck size={18} className="text-green-600" />
            Prasadam Fulfillment Pipeline
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-on-surface mb-2">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Pending Packing Labels
                </span>
                <span>{pendingPrasads} Packages ({Math.round((pendingPrasads / totalPrasads) * 100)}%)</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${(pendingPrasads / totalPrasads) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-on-surface mb-2">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  Packed & Thermal Labeled
                </span>
                <span>{packedPrasads} Packages ({Math.round((packedPrasads / totalPrasads) * 100)}%)</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(packedPrasads / totalPrasads) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-on-surface mb-2">
                <span className="flex items-center gap-1.5 text-green-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                  Shipped via India Post
                </span>
                <span>{shippedPrasads} Packages ({Math.round((shippedPrasads / totalPrasads) * 100)}%)</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(shippedPrasads / totalPrasads) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-xl mt-6">
            <h4 className="text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">Logistics Status Alert</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Prasadam deliveries have reached a <strong>{fulfillmentRate}% fulfillment rate</strong>. Ensure pending packages are labeled and dropped off at the postal branch before midnight.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
