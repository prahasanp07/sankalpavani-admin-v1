'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Check, 
  Clock, 
  X, 
  Printer, 
  Sparkles, 
  Box, 
  Search,
  CheckCircle2,
  PackageCheck,
  Filter,
  Download
} from 'lucide-react';
import RequirePermission from './RequirePermission';

interface PrasadamShipment {
  id: string;
  devoteeName: string;
  address: string;
  items: string;
  status: 'Pending' | 'Packed' | 'Shipped';
  trackingNo?: string;
  bookingDate: string;
  recipientName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

const DEFAULT_SHIPMENTS: PrasadamShipment[] = [
  { id: 'PR-1090', devoteeName: 'Srinivasan Naidu', address: 'Flat 402, Lotus Residency, Chennai, TN, 600018', items: 'Kumkum, Laddu (2Pcs), Sacred Thread', status: 'Pending', bookingDate: '2026-06-28' },
  { id: 'PR-1091', devoteeName: 'Rekha Deshmukh', address: 'Plot 12, Sahakar Nagar, Pune, Maharashtra, 411009', items: 'Panchamrit Bottle, Dry Fruits Box', status: 'Packed', trackingNo: 'INDPOST_4992', bookingDate: '2026-06-28' },
  { id: 'PR-1092', devoteeName: 'Anil Vasudevan', address: 'H.No 4-50, Temple view road, Kochi, Kerala, 682001', items: 'Sweet Pongal Box, Bilva leaves packet', status: 'Shipped', trackingNo: 'INDPOST_1290', bookingDate: '2026-06-27' },
  { id: 'PR-1093', devoteeName: 'Preeti Mittal', address: '12B, Green Avenue, Gurugram, Haryana, 122002', items: 'Kumkum, Laddu (4Pcs)', status: 'Pending', bookingDate: '2026-06-27' },
  { id: 'PR-1094', devoteeName: 'Manoj Bajpayee', address: 'Apartment 3A, Skyline Towers, Mumbai, MH, 400053', items: 'Dry Fruits Box, Sacred Thread', status: 'Pending', bookingDate: '2026-06-26' },
  { id: 'PR-1095', devoteeName: 'Kavitha Ramaswamy', address: '56, Gandhi Road, Madurai, TN, 625001', items: 'Kumkum, Laddu (2Pcs)', status: 'Packed', trackingNo: 'INDPOST_8812', bookingDate: '2026-06-25' },
  { id: 'PR-1096', devoteeName: 'Ramesh Chennithala', address: 'TC 12/840, Kowdiar, Thiruvananthapuram, KL, 695003', items: 'Panchamrit Bottle, Sacred Thread', status: 'Shipped', trackingNo: 'INDPOST_3145', bookingDate: '2026-06-25' },
  { id: 'PR-1097', devoteeName: 'Swati Shinde', address: 'A-201, Shanti Vihar, Thane, Maharashtra, 400601', items: 'Sweet Pongal Box, Laddu (2Pcs)', status: 'Pending', bookingDate: '2026-06-24' },
  { id: 'PR-1098', devoteeName: 'Jagdish Chandra', address: 'Sector 4, H.No 89, Udaipur, Rajasthan, 313001', items: 'Panchamrit Bottle, Dry Fruits Box', status: 'Pending', bookingDate: '2026-06-23' },
  { id: 'PR-1099', devoteeName: 'Lakshmi Narayanan', address: '14, Temple Car Street, Tirupati, AP, 517501', items: 'Kumkum, Laddu (4Pcs), Bilva leaves packet', status: 'Packed', trackingNo: 'INDPOST_7223', bookingDate: '2026-06-22' },
  { id: 'PR-1100', devoteeName: 'Girish Karnad', address: '88, JP Nagar 3rd Phase, Bengaluru, KA, 560078', items: 'Sweet Pongal Box, Dry Fruits Box', status: 'Shipped', trackingNo: 'INDPOST_9918', bookingDate: '2026-06-21' },
  { id: 'PR-1101', devoteeName: 'Asha Bhosle', address: 'Twin Towers Block C, Prabha Devi, Mumbai, MH, 400025', items: 'Kumkum, Sacred Thread', status: 'Pending', bookingDate: '2026-06-20' }
];

export default function Prasadam() {
  const [shipments, setShipments] = useState<PrasadamShipment[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sankalpvani_prasadam');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    return DEFAULT_SHIPMENTS;
  });
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Packed' | 'Shipped'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sorting State
  const [sortKey, setSortKey] = useState<keyof PrasadamShipment | 'bookingDate'>('bookingDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filtering State
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterItem, setFilterItem] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const syncPrasadamOrders = () => {
    if (typeof window === 'undefined') return;

    const cachedPrasadam = localStorage.getItem('sankalpvani_prasadam');
    let baseShipments: PrasadamShipment[] = [];
    if (cachedPrasadam) {
      try {
        baseShipments = JSON.parse(cachedPrasadam);
      } catch (e) {
        baseShipments = [...DEFAULT_SHIPMENTS];
      }
    } else {
      baseShipments = [...DEFAULT_SHIPMENTS];
      localStorage.setItem('sankalpvani_prasadam', JSON.stringify(DEFAULT_SHIPMENTS));
    }

    const cachedBookings = localStorage.getItem('sankalpvani_bookings');
    if (cachedBookings) {
      try {
        const bookings = JSON.parse(cachedBookings);
        if (Array.isArray(bookings)) {
          let updated = false;
          bookings.forEach((b: any) => {
            // Ingestion delivery flags and shipping metadata check
            const isDeliverHome = b.deliverToHome || b.deliveryFlag || b.shippingAddress || (b.recipientName && b.streetAddress);
            if (isDeliverHome) {
              const shipmentId = `PR-${b.receiptNo?.replace('SV-', '') || Math.floor(1000 + Math.random() * 9000)}`;
              // Check if already in shipments by checking either shipmentId or receiptNo
              const exists = baseShipments.some(s => s.id === shipmentId || s.id === b.receiptNo);
              if (!exists) {
                const recipient = b.recipientName || b.devoteeName;
                const addressStr = b.streetAddress
                  ? `${recipient}, ${b.streetAddress}, ${b.city || ''}, ${b.state || ''} - ${b.pincode || ''} (Tel: ${b.phone || ''})`
                  : b.shippingAddress || 'No Address Provided';

                const newShipment: PrasadamShipment = {
                  id: b.receiptNo || shipmentId,
                  devoteeName: b.devoteeName,
                  address: addressStr,
                  items: `${b.sevaName} Prasadam packet`,
                  status: 'Pending', // pending maps to Pending Packing in table UI
                  bookingDate: b.bookingDate || new Date().toISOString().split('T')[0],
                  recipientName: b.recipientName || recipient,
                  streetAddress: b.streetAddress || '',
                  city: b.city || '',
                  state: b.state || '',
                  pincode: b.pincode || '',
                  phone: b.phone || ''
                };
                baseShipments.unshift(newShipment);
                updated = true;
              }
            }
          });
          if (updated) {
            localStorage.setItem('sankalpvani_prasadam', JSON.stringify(baseShipments));
          }
        }
      } catch (e) {
        console.error("Failed to sync devotee bookings for prasadam", e);
      }
    }
    setShipments(baseShipments);
  };

  useEffect(() => {
    syncPrasadamOrders();
    window.addEventListener('sankalpvani_bookings_updated', syncPrasadamOrders);
    window.addEventListener('storage', syncPrasadamOrders);
    return () => {
      window.removeEventListener('sankalpvani_bookings_updated', syncPrasadamOrders);
      window.removeEventListener('storage', syncPrasadamOrders);
    };
  }, []);

  // Reset page when filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, filterItem, startDate, endDate, sortKey, sortDirection]);

  // Clear selections when filters/page changes to prevent accidental actions
  useEffect(() => {
    setSelectedIds([]);
  }, [search, filter, filterItem, startDate, endDate, currentPage]);

  const saveToStorage = (updated: PrasadamShipment[]) => {
    setShipments(updated);
    localStorage.setItem('sankalpvani_prasadam', JSON.stringify(updated));
    window.dispatchEvent(new Event('sankalpvani_prasadam_updated'));
  };

  const handleUpdateStatus = (id: string, nextStatus: PrasadamShipment['status']) => {
    const tracking = nextStatus === 'Shipped' ? `INDPOST_${Math.floor(1000 + Math.random() * 9000)}` : undefined;
    const updated = shipments.map(s => {
      if (s.id === id) {
        return { ...s, status: nextStatus, trackingNo: tracking || s.trackingNo };
      }
      return s;
    });

    try {
      fetch(`/api/v1/temples/temple_vidyashankara/shipments?trustId=trust_sringeri&shipmentId=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          trackingNumber: tracking,
          courierProvider: 'India Post Speed Post'
        })
      }).catch(e => console.warn('Background shipment update fallback'));
    } catch (e) {
      console.warn('Shipment status error');
    }

    saveToStorage(updated);
    setToastMessage(`Shipment status updated to ${nextStatus}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrintLabel = (s: PrasadamShipment) => {
    setToastMessage(`Dispatched packing labels of pilgrim ${s.devoteeName} to thermal label printer...`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Bulk Handlers
  const handleBulkPrintLabels = () => {
    const count = selectedIds.length;
    if (count > 0) {
      setToastMessage(`Sent ${count} selected shipments' labels to thermal label printer.`);
      setSelectedIds([]);
    } else {
      setToastMessage(`No shipments selected to print.`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBulkMarkPacked = () => {
    let count = 0;
    const updated = shipments.map(s => {
      if (selectedIds.includes(s.id) && s.status === 'Pending') {
        count++;
        return { ...s, status: 'Packed' as const };
      }
      return s;
    });
    if (count > 0) {
      saveToStorage(updated);
      setSelectedIds([]);
      setToastMessage(`Successfully packed ${count} selected pending shipments.`);
    } else {
      setToastMessage(`No pending shipments were selected to pack.`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBulkMarkShipped = () => {
    let count = 0;
    const updated = shipments.map(s => {
      if (selectedIds.includes(s.id) && s.status === 'Packed') {
        count++;
        return { 
          ...s, 
          status: 'Shipped' as const, 
          trackingNo: s.trackingNo || `INDPOST_${Math.floor(1000 + Math.random() * 9000)}` 
        };
      }
      return s;
    });
    if (count > 0) {
      saveToStorage(updated);
      setSelectedIds([]);
      setToastMessage(`Successfully marked ${count} selected packed shipments as Shipped.`);
    } else {
      setToastMessage(`No packed shipments were selected to ship.`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    if (count === 0) return;
    if (confirm(`Are you sure you want to cancel and delete the ${count} selected shipments?`)) {
      const updated = shipments.filter(s => !selectedIds.includes(s.id));
      saveToStorage(updated);
      setSelectedIds([]);
      setToastMessage(`Successfully deleted ${count} selected shipments.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Export to CSV utility
  const exportToCSV = () => {
    const headers = ['Package ID', 'Devotee Name', 'Address', 'Sacred Contents', 'Booking Date', 'Status', 'Tracking No'];
    
    const rows = getSortedShipments(filteredShipments).map(s => [
      s.id,
      `"${s.devoteeName.replace(/"/g, '""')}"`,
      `"${s.address.replace(/"/g, '""')}"`,
      `"${s.items.replace(/"/g, '""')}"`,
      s.bookingDate,
      s.status,
      s.trackingNo || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SankalpVani_Prasadam_Logistics_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToastMessage('Prasadam logistics records exported to CSV successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Get unique sacred items tags for filtering
  const allItemsList = Array.from(new Set(
    shipments.flatMap(s => s.items.split(',').map(item => item.trim()))
  ));

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = s.devoteeName.toLowerCase().includes(search.toLowerCase()) || 
                          s.id.toLowerCase().includes(search.toLowerCase()) ||
                          s.items.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || s.status === filter;
    
    // Advanced filtering criteria
    const matchesItem = filterItem === 'All' || s.items.toLowerCase().includes(filterItem.toLowerCase());
    
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && s.bookingDate >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && s.bookingDate <= endDate;
    }
    
    return matchesSearch && matchesFilter && matchesItem && matchesDate;
  });

  const handleSort = (key: keyof PrasadamShipment | 'bookingDate') => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortedShipments = (list: PrasadamShipment[]) => {
    return [...list].sort((a, b) => {
      let valA = a[sortKey as keyof PrasadamShipment] ?? '';
      let valB = b[sortKey as keyof PrasadamShipment] ?? '';

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

  const renderSortIndicator = (key: keyof PrasadamShipment | 'bookingDate') => {
    if (sortKey !== key) {
      return <span className="inline-block ml-1 opacity-25">↕</span>;
    }
    return sortDirection === 'asc' ? (
      <span className="inline-block ml-1 text-primary">↑</span>
    ) : (
      <span className="inline-block ml-1 text-primary">↓</span>
    );
  };

  // Pagination calculation
  const totalItems = filteredShipments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = getSortedShipments(filteredShipments).slice(startIndex, startIndex + itemsPerPage);

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
      <div>
        <h2 className="font-serif text-3xl font-semibold text-primary">Prasadam Logistics Manager</h2>
        <p className="font-sans text-sm text-on-surface-variant font-medium mt-1">
          Track preparation, dry packaging, thermal labeling, and postal dispatching of holy offerings to remote pilgrims.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <input
                type="text"
                placeholder="Search Package ID, Devotee, Contents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Toggle Advanced Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                showFilters 
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
              {(['All', 'Pending', 'Packed', 'Shipped'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filter === f 
                      ? 'bg-primary text-on-primary shadow-sm' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {f}
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
            {/* Item Dropdown */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Sacred Content Item</label>
              <select
                value={filterItem}
                onChange={(e) => setFilterItem(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline rounded-lg text-xs focus:outline-none focus:border-primary"
              >
                <option value="All">All Content Items</option>
                {allItemsList.map(item => (
                  <option key={item} value={item}>{item}</option>
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

      {/* Shipments Table Ledger */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b divider-gold text-[11px] font-bold text-on-surface-variant uppercase tracking-wider select-none">
                <th className="py-4 px-4 text-center w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/60 cursor-pointer"
                    checked={currentItems.length > 0 && currentItems.every(item => selectedIds.includes(item.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const toAdd = currentItems.map(item => item.id);
                        setSelectedIds(prev => Array.from(new Set([...prev, ...toAdd])));
                      } else {
                        const toRemove = currentItems.map(item => item.id);
                        setSelectedIds(prev => prev.filter(id => !toRemove.includes(id)));
                      }
                    }}
                  />
                </th>
                <th 
                  className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('id')}
                >
                  Package ID {renderSortIndicator('id')}
                </th>
                <th 
                  className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('devoteeName')}
                >
                  Devotee Pilgrim {renderSortIndicator('devoteeName')}
                </th>
                <th className="py-4 px-6">Dispatch Address</th>
                <th className="py-4 px-6">Sacred Offerings</th>
                <th 
                  className="py-4 px-6 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('bookingDate')}
                >
                  Booking Date {renderSortIndicator('bookingDate')}
                </th>
                <th 
                  className="py-4 px-6 text-center cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('status')}
                >
                  Status {renderSortIndicator('status')}
                </th>
                <th className="py-4 px-6 text-center">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-on-surface divide-y divide-outline-variant/10">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-on-surface-variant font-medium">
                    No matching prasadam shipments found.
                  </td>
                </tr>
              ) : (
                currentItems.map((s) => (
                  <tr key={s.id} className={`transition-colors ${selectedIds.includes(s.id) ? 'bg-primary-container/5 hover:bg-primary-container/10' : 'hover:bg-surface-container-low/30'}`}>
                    <td className="py-4 px-4 text-center w-12">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/60 cursor-pointer"
                        checked={selectedIds.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, s.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== s.id));
                          }
                        }}
                      />
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-primary">
                      {s.id}
                    </td>
                    <td className="py-4 px-6 font-bold">{s.devoteeName}</td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant leading-relaxed max-w-xs truncate" title={s.address}>
                      {s.address}
                    </td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant font-semibold">
                      {s.items}
                    </td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant font-mono">{s.bookingDate}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        s.status === 'Shipped'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : s.status === 'Packed'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {s.status === 'Shipped' ? (
                          <Truck size={12} className="mr-1 shrink-0 text-green-600" />
                        ) : s.status === 'Packed' ? (
                          <Box size={12} className="mr-1 shrink-0 text-blue-600" />
                        ) : (
                          <Clock size={12} className="mr-1 shrink-0 text-amber-600" />
                        )}
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <RequirePermission permission="PRINT_SHIPPING_LABELS">
                          <button
                            onClick={() => handlePrintLabel(s)}
                            className="p-1.5 hover:bg-primary-container/10 text-primary rounded-lg transition-colors cursor-pointer"
                            title="Print Shipping label"
                          >
                            <Printer size={14} />
                          </button>
                        </RequirePermission>
                        
                        <RequirePermission permission="PROCESS_LOGISTICS">
                          {s.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateStatus(s.id, 'Packed')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                            >
                              Pack
                            </button>
                          )}
                          {s.status === 'Packed' && (
                            <button
                              onClick={() => handleUpdateStatus(s.id, 'Shipped')}
                              className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                            >
                              Ship
                            </button>
                          )}
                        </RequirePermission>
                        {s.status === 'Shipped' && (
                          <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <Check size={14} /> Sent
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface-container border-2 border-primary/20 px-6 py-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-4 animate-[slideUp_0.2s_ease-out] w-[90%] md:w-auto min-w-[320px] md:min-w-[600px]">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-on-primary text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
              {selectedIds.length} Selected
            </span>
            <span className="font-sans text-xs text-on-surface-variant font-bold hidden sm:inline">
              Bulk actions for selected shipments:
            </span>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end md:ml-auto">
            <button
              onClick={handleBulkPrintLabels}
              className="px-3.5 py-2 bg-surface-container-high border border-outline hover:border-primary text-on-surface-variant hover:text-primary rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Labels</span>
            </button>
            <button
              onClick={handleBulkMarkPacked}
              className="px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Box size={13} />
              <span>Pack Items</span>
            </button>
            <button
              onClick={handleBulkMarkShipped}
              className="px-3.5 py-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Truck size={13} />
              <span>Ship Items</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <X size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
