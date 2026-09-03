'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  CalendarCheck,
  Truck,
  IndianRupee,
  ArrowRight,
  MoreVertical,
  CheckCircle,
  Clock,
  Printer,
  Send,
  Timer,
  RefreshCw,
  X,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Pilgrim {
  name: string;
  gotra: string;
  nakshetra: string;
  age?: number | string;
  gender?: string;
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
  sevaStatus?: 'Scheduled' | 'Performed' | 'Cancelled';
  persons?: number;
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

const DEFAULT_SHIPMENTS = [
  { id: 'PR-1090', devoteeName: 'Srinivasan Naidu', status: 'Pending' },
  { id: 'PR-1091', devoteeName: 'Rekha Deshmukh', status: 'Packed' },
  { id: 'PR-1092', devoteeName: 'Anil Vasudevan', status: 'Shipped' },
  { id: 'PR-1093', devoteeName: 'Preeti Mittal', status: 'Pending' },
  { id: 'PR-1094', devoteeName: 'Manoj Bajpayee', status: 'Pending' },
  { id: 'PR-1095', devoteeName: 'Kavitha Ramaswamy', status: 'Packed' },
  { id: 'PR-1096', devoteeName: 'Ramesh Chennithala', status: 'Shipped' },
  { id: 'PR-1097', devoteeName: 'Swati Shinde', status: 'Pending' },
  { id: 'PR-1098', devoteeName: 'Jagdish Chandra', status: 'Pending' },
  { id: 'PR-1099', devoteeName: 'Lakshmi Narayanan', status: 'Packed' },
  { id: 'PR-1100', devoteeName: 'Girish Karnad', status: 'Shipped' },
  { id: 'PR-1101', devoteeName: 'Asha Bhosle', status: 'Pending' }
];

const getTodayDateString = (bookingsList: Booking[]) => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const actualToday = `${year}-${month}-${day}`;

  const hasTodayBookings = bookingsList.some(b => b.bookingDate === actualToday);
  if (hasTodayBookings) return actualToday;

  if (bookingsList.length === 0) return actualToday;
  const dates = bookingsList.map(b => b.bookingDate);
  return dates.reduce((max, d) => d > max ? d : max, dates[0]);
};

interface DashboardPortalProps {
  onNavigate: (tabId: string) => void;
}

export default function DashboardPortal({ onNavigate }: DashboardPortalProps) {
  const [hoveredTrend, setHoveredTrend] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const doughnutCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const barCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDevoteeModal, setShowDevoteeModal] = useState(false);
  const [showRecentBookingsModal, setShowRecentBookingsModal] = useState(false);

  // Today's Devotees Modal filtering and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeva, setSelectedSeva] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [expandedSevas, setExpandedSevas] = useState<Record<string, boolean>>({
    'Maha Abhisheka': true
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);

  const loadPrasadamShipments = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sankalpvani_prasadam');
      if (cached) {
        try {
          setShipments(JSON.parse(cached));
          return;
        } catch (e) {}
      }
      setShipments(DEFAULT_SHIPMENTS);
    }
  }, []);

  const [kpiValues, setKpiValues] = useState({
    sevas: 0,
    bookings: 0,
    dispatch: 8,
    collections: 0
  });

  const [trends, setTrends] = useState([
    { day: "Mon", amount: 12000, height: "40%" },
    { day: "Tue", amount: 15500, height: "55%" },
    { day: "Wed", amount: 14500, height: "45%" },
    { day: "Thu", amount: 19000, height: "70%" },
    { day: "Fri", amount: 24500, height: "85%" },
    { day: "Sat", amount: 18000, height: "60%" },
    { day: "Sun", amount: 21000, height: "75%" }
  ]);

  const [transactions, setTransactions] = useState([
    { name: "Rahul Sharma", initial: "R", type: "Archana", amount: "₹501", status: "Completed", date: "Today", bg: "bg-secondary-container text-on-secondary-container" },
    { name: "Priya Patel", initial: "P", type: "Annadanam", amount: "₹2,100", status: "Completed", date: "Today", bg: "bg-primary-container text-on-primary-container" },
    { name: "Amit Kumar", initial: "A", type: "Vahan Puja", amount: "₹1,100", status: "Pending", date: "Yesterday", bg: "bg-tertiary-container text-on-tertiary-container" }
  ]);

  const loadBookings = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sankalpvani_bookings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Booking[];
          setBookings(parsed);

          const todayStr = getTodayDateString(parsed);
          const todayDevotees = parsed
            .filter(b => b.bookingDate === todayStr && b.sevaStatus !== 'Cancelled')
            .reduce((sum, b) => sum + (b.persons || (b.pilgrims ? b.pilgrims.length + 1 : 1)), 0);
          const recentBookingsCount = parsed.length;
          const totalColl = parsed
            .filter(b => b.paymentStatus === 'Paid')
            .reduce((sum, b) => sum + b.amount, 0);

          setKpiValues({
            sevas: todayDevotees,
            bookings: recentBookingsCount,
            dispatch: 8,
            collections: totalColl
          });
        } catch (e) { }
      } else {
        localStorage.setItem('sankalpvani_bookings', JSON.stringify(DEFAULT_BOOKINGS));
        setBookings(DEFAULT_BOOKINGS);

        const todayStr = getTodayDateString(DEFAULT_BOOKINGS);
        const todayDevotees = DEFAULT_BOOKINGS
          .filter(b => b.bookingDate === todayStr && b.sevaStatus !== 'Cancelled')
          .reduce((sum, b) => sum + (b.persons || (b.pilgrims ? b.pilgrims.length + 1 : 1)), 0);
        const recentBookingsCount = DEFAULT_BOOKINGS.length;
        const totalColl = DEFAULT_BOOKINGS
          .filter(b => b.paymentStatus === 'Paid')
          .reduce((sum, b) => sum + b.amount, 0);

        setKpiValues({
          sevas: todayDevotees,
          bookings: recentBookingsCount,
          dispatch: 8,
          collections: totalColl
        });
      }
    }
  }, []);

  React.useEffect(() => {
    loadBookings();

    window.addEventListener('sankalpvani_bookings_updated', loadBookings);
    return () => {
      window.removeEventListener('sankalpvani_bookings_updated', loadBookings);
    };
  }, [loadBookings]);

  const [templePhoto, setTemplePhoto] = useState<string>('https://images.unsplash.com/photo-1602631985686-2bb06089d482?auto=format&fit=crop&q=80&w=800');

  const loadTemplePhoto = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sankalpvani_temple_details');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const photos = parsed.photos || [];
          const idx = parsed.bannerPhotoIndex ?? parsed.primaryPhotoIndex ?? 0;
          if (photos[idx]) {
            setTemplePhoto(photos[idx]);
          } else if (photos[0]) {
            setTemplePhoto(photos[0]);
          }
        } catch (e) { }
      }
    }
  }, []);

  React.useEffect(() => {
    loadTemplePhoto();
    window.addEventListener('sankalpvani_temple_details_updated', loadTemplePhoto);
    return () => {
      window.removeEventListener('sankalpvani_temple_details_updated', loadTemplePhoto);
    };
  }, [loadTemplePhoto]);

  React.useEffect(() => {
    loadPrasadamShipments();
    window.addEventListener('sankalpvani_prasadam_updated', loadPrasadamShipments);
    window.addEventListener('storage', loadPrasadamShipments);
    return () => {
      window.removeEventListener('sankalpvani_prasadam_updated', loadPrasadamShipments);
      window.removeEventListener('storage', loadPrasadamShipments);
    };
  }, [loadPrasadamShipments]);

  React.useEffect(() => {
    if (!doughnutCanvasRef.current) return;

    const rawChartData = [
      bookings.filter(b => b.sevaName === 'Maha Abhisheka' && b.sevaStatus !== 'Cancelled').length,
      bookings.filter(b => b.sevaName === 'Archana Pooja' && b.sevaStatus !== 'Cancelled').length,
      bookings.filter(b => b.sevaName === 'Annadanam Seva' && b.sevaStatus !== 'Cancelled').length,
      bookings.filter(b => b.sevaName === 'Vahan Pooja' && b.sevaStatus !== 'Cancelled').length,
      bookings.filter(b => b.sevaName === 'Chandi Homa' && b.sevaStatus !== 'Cancelled').length
    ];
    const chartData = rawChartData.some(v => v > 0) ? rawChartData : [35, 25, 20, 12, 8];

    const chart = new Chart(doughnutCanvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Maha Abhisheka', 'Archana Pooja', 'Annadanam Seva', 'Vahan Pooja', 'Chandi Homa'],
        datasets: [{
          data: chartData,
          backgroundColor: [
            '#8f4e00', // primary saffron
            '#e49339', // gold orange
            '#c27013', // amber gold
            '#f7b05b', // light saffron
            '#6d3800'  // dark bronze
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    return () => {
      chart.destroy();
    };
  }, [bookings]);

  React.useEffect(() => {
    if (!barCanvasRef.current) return;

    // Helper to map bookingDate to day of week
    const getDayOfWeek = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
      } catch (e) {
        return '';
      }
    };

    // Group bookings by day of week and sum up collections
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseCollections = daysOfWeek.map(day => {
      const amount = bookings
        .filter(b => b.paymentStatus === 'Paid' && getDayOfWeek(b.bookingDate) === day)
        .reduce((sum, b) => sum + b.amount, 0);
      return { day, amount };
    });

    const maxAmount = Math.max(...baseCollections.map(c => c.amount));
    const trendsList = baseCollections.map(c => {
      const pct = maxAmount > 0 ? Math.round((c.amount / maxAmount) * 100) : 0;
      return {
        day: c.day,
        amount: c.amount,
        height: `${Math.max(15, pct)}%`
      };
    });

    const hasCollections = bookings.some(b => b.paymentStatus === 'Paid' && b.amount > 0);
    const finalTrends = hasCollections ? trendsList : [
      { day: "Mon", amount: 12000, height: "40%" },
      { day: "Tue", amount: 15500, height: "55%" },
      { day: "Wed", amount: 14500, height: "45%" },
      { day: "Thu", amount: 19000, height: "70%" },
      { day: "Fri", amount: 24500, height: "85%" },
      { day: "Sat", amount: 18000, height: "60%" },
      { day: "Sun", amount: 21000, height: "75%" }
    ];

    const chart = new Chart(barCanvasRef.current, {
      type: 'bar',
      data: {
        labels: finalTrends.map(t => t.day),
        datasets: [{
          label: 'Collections (₹)',
          data: finalTrends.map(t => t.amount),
          backgroundColor: '#8f4e00',
          borderRadius: 8,
          borderWidth: 0,
          hoverBackgroundColor: '#a85f05'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: 'Outfit, sans-serif',
                size: 11,
                weight: 'bold'
              },
              color: '#757575'
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                family: 'Outfit, sans-serif',
                size: 11,
                weight: 'bold'
              },
              color: '#757575'
            }
          }
        }
      }
    });

    return () => {
      chart.destroy();
    };
  }, [bookings]);



  const todayStr = getTodayDateString(bookings);
  const todayBookings = bookings.filter(b => b.bookingDate === todayStr);

  const sevasStatus = [
    { name: 'Maha Abhisheka', capacity: 15 },
    { name: 'Archana Pooja', capacity: 200 },
    { name: 'Annadanam Seva', capacity: 100 },
    { name: 'Vahan Pooja', capacity: 30 },
    { name: 'Chandi Homa', capacity: 10 }
  ].map(s => {
    const count = todayBookings
      .filter(b => b.sevaName === s.name && b.sevaStatus !== 'Cancelled')
      .reduce((sum, b) => sum + (b.persons || (b.pilgrims ? b.pilgrims.length + 1 : 1)), 0);
    let colorClass = 'text-green-700 bg-green-50 border-green-200';
    let label = 'Available';
    if (count >= s.capacity) {
      colorClass = 'text-red-700 bg-red-50 border-red-200 animate-pulse';
      label = 'House Full';
    } else if (count >= s.capacity * 0.8) {
      colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
      label = 'Almost Full';
    }
    return {
      ...s,
      count,
      colorClass,
      label
    };
  })
    .sort((a, b) => b.count - a.count);

  const pendingCount = shipments.filter(s => s.status === 'Pending').length;
  const packedCount = shipments.filter(s => s.status === 'Packed').length;
  const shippedCount = shipments.filter(s => s.status === 'Shipped').length;

  const totalPackages = pendingCount + packedCount + shippedCount;
  const dispatchPercentage = totalPackages > 0 ? Math.round((shippedCount / totalPackages) * 100) : 0;

  const dispatchStatusList = [
    { name: 'Shipped', count: shippedCount, label: 'Shipped', colorClass: 'text-green-700 bg-green-50 border-green-200' },
    { name: 'Packed', count: packedCount, label: 'Packed', colorClass: 'text-amber-700 bg-amber-50 border-amber-200' },
    { name: 'Pending', count: pendingCount, label: 'Pending', colorClass: 'text-red-700 bg-red-50 border-red-200' }
  ];

  const recentTransactions = bookings.slice(0, 3).map((b, idx) => {
    const bgClasses = [
      "bg-secondary-container text-on-secondary-container",
      "bg-primary-container text-on-primary-container",
      "bg-tertiary-container text-on-tertiary-container"
    ];
    const shortName = b.sevaName === 'Maha Abhisheka' ? 'Abhisheka'
      : b.sevaName === 'Archana Pooja' ? 'Archana'
      : b.sevaName === 'Annadanam Seva' ? 'Annadanam'
      : b.sevaName === 'Vahan Pooja' ? 'Vahan Puja'
      : b.sevaName === 'Chandi Homa' ? 'Chandi Homa'
      : b.sevaName.split(' ')[0];

    return {
      name: b.devoteeName,
      initial: b.devoteeName.charAt(0).toUpperCase() || 'D',
      type: shortName,
      amount: `₹${b.amount}`,
      status: b.paymentStatus === 'Paid' ? 'Completed' : b.paymentStatus === 'Refunded' ? 'Refunded' : 'Pending',
      date: b.bookingDate === todayStr ? 'Today' : 'Past',
      bg: bgClasses[idx % 3]
    };
  });

  const finalTransactions = recentTransactions.length > 0 ? recentTransactions : [
    { name: "Rahul Sharma", initial: "R", type: "Archana", amount: "₹501", status: "Completed", date: "Today", bg: "bg-secondary-container text-on-secondary-container" },
    { name: "Priya Patel", initial: "P", type: "Annadanam", amount: "₹2,100", status: "Completed", date: "Today", bg: "bg-primary-container text-on-primary-container" },
    { name: "Amit Kumar", initial: "A", type: "Vahan Puja", amount: "₹1,100", status: "Pending", date: "Yesterday", bg: "bg-tertiary-container text-on-tertiary-container" }
  ];

  const kpis = [
    {
      title: "Today's Sevas",
      value: String(kpiValues.sevas),
      change: "+12%",
      changeText: "vs yesterday",
      isPositive: true,
      color: "border-primary",
      bgColor: "bg-primary-container/20",
      textColor: "text-primary",
      icon: Heart
    },
    {
      title: "Recent Bookings",
      value: String(kpiValues.bookings),
      change: "Last 4 hours",
      changeText: "",
      isPositive: null,
      color: "border-secondary",
      bgColor: "bg-secondary-container/20",
      textColor: "text-secondary",
      icon: CalendarCheck
    },
    {
      title: "Prasadam to Dispatch",
      value: String(kpiValues.dispatch),
      progress: 65,
      isProgress: true,
      color: "border-tertiary",
      bgColor: "bg-tertiary-container/20",
      textColor: "text-tertiary",
      icon: Truck
    },
    {
      title: "Total Collections",
      value: `₹${kpiValues.collections.toLocaleString('en-IN')}`,
      change: "+5%",
      changeText: "vs yesterday",
      isPositive: true,
      color: "border-secondary-fixed",
      bgColor: "bg-secondary-fixed/50",
      textColor: "text-secondary-fixed-dim",
      icon: IndianRupee
    }
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleUpdateSevaStatus = (receiptNo: string, newStatus: 'Scheduled' | 'Performed' | 'Cancelled') => {
    const updated = bookings.map(b => {
      if (b.receiptNo === receiptNo) {
        return { ...b, sevaStatus: newStatus };
      }
      return b;
    });
    setBookings(updated);
    localStorage.setItem('sankalpvani_bookings', JSON.stringify(updated));
    window.dispatchEvent(new Event('sankalpvani_bookings_updated'));
    triggerToast(`Booking ${receiptNo} marked as ${newStatus}`);
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    // Simulate real database fetching delay
    setTimeout(() => {
      loadBookings();
      loadPrasadamShipments();
      setIsRefreshing(false);
      triggerToast("All temple datasets synchronized with primary database!");
    }, 900);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-primary-container text-on-primary-container border border-primary/20 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-primary animate-pulse" />
          <span className="font-sans text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Welcome Section Banner Card */}
      <div className="border border-dashed border-outline-variant/70 rounded-[24px] p-4 bg-surface-container-lowest flex flex-col md:flex-row items-stretch gap-6 shadow-sm">
        {/* Banner image covering roughly 3/4ths of the container on md+ screens */}
        <div className="relative w-full md:w-5/6 h-64 md:h-56 rounded-2xl overflow-hidden shadow-inner shrink-0 bg-surface-container-low/40 flex items-center justify-center">
          {/* Crisp, original image covering the container */}
          <img
            src={templePhoto}
            alt="Temple Banner"
            className="relative z-10 w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
          {/* Subtle gradient overlay to match our aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-20" />
        </div>

        {/* Welcome Text on the right side */}
        <div className="w-full md:w-1/4 flex flex-col justify-center py-2">
          <h2 className="font-serif text-xl font-bold text-primary tracking-tight">
            Namaste Admin.
          </h2>
          <p className="font-sans text-xs text-on-surface-variant font-medium mt-1 leading-snug">
            Here&apos;s what&apos;s happening today at the Temple.
          </p>
        </div>
      </div>

      {/* Stats Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div
          id="stat-card-today-devotees"
          onClick={() => setShowDevoteeModal(true)}
          className="bg-surface-container-lowest rounded-xl shadow-sacred border-t-4 border-primary p-6 hover:-translate-y-1 transition-all duration-300 border border-outline-variant/20 cursor-pointer hover:shadow-md hover:bg-surface-container-low active:scale-[0.98] flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">TODAY&apos;S SEVAS</p>
                <h3 className="font-display-lg text-on-surface mt-1 font-bold flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">{kpiValues.sevas}</span>
                  <span className="text-xs font-semibold text-on-surface-variant/80">/ 355</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
                <Users size={18} />
              </div>
            </div>

            {/* Top 3 Sevas status and capacity */}
            <div className="space-y-2 mt-4 pt-3.5 border-t border-outline-variant/10">
              {sevasStatus.slice(0, 3).map((s, idx) => {
                const getSevaShortName = (n: string) => {
                  if (n === 'Maha Abhisheka') return 'Abhisheka';
                  if (n === 'Archana Pooja') return 'Archana';
                  if (n === 'Annadanam Seva') return 'Annadanam';
                  if (n === 'Vahan Pooja') return 'Vahan Puja';
                  if (n === 'Chandi Homa') return 'Chandi Homa';
                  return n.split(' ')[0];
                };
                return (
                  <div key={idx} className="flex justify-between items-center text-[10px] sm:text-xs font-sans">
                    <span className="font-semibold text-on-surface-variant truncate pr-2" title={s.name}>
                      {getSevaShortName(s.name)}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold font-mono text-on-surface text-[10px]">
                        {s.count}/{s.capacity}
                      </span>
                      <span className={`px-2 py-[1px] rounded-full text-[8px] font-bold border ${s.colorClass}`}>
                        {s.label === 'House Full' ? 'Full' : s.label === 'Almost Full' ? 'Near' : 'Avail'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trend Indicator Row */}
          <div className="flex items-center gap-1.5 text-green-600 font-bold bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl w-fit text-[11px] mt-4 shadow-xs">
            <span className="material-symbols-outlined text-[14px] font-extrabold">trending_up</span>
            <span>+12% vs yesterday</span>
          </div>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => setShowRecentBookingsModal(true)}
          className="bg-surface-container-lowest rounded-xl shadow-sacred border-t-4 border-secondary p-6 hover:-translate-y-1 transition-all duration-300 border border-outline-variant/20 cursor-pointer hover:shadow-md hover:bg-surface-container-low active:scale-[0.98]"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">Recent Bookings</p>
              <h3 className="font-display-lg text-3xl text-on-surface mt-1 font-bold">{kpiValues.bookings}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">event_available</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] mr-1">schedule</span>
            <span>Last 4 hours</span>
            <span className="text-on-surface-variant/70 ml-2">• Click to view list</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sacred border-t-4 border-tertiary p-6 hover:-translate-y-1 transition-all duration-300 border border-outline-variant/20 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">PRASADAM DISPATCH</p>
                <h3 className="font-display-lg text-on-surface mt-1 font-bold flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">{shippedCount}</span>
                  <span className="text-xs font-semibold text-on-surface-variant/80">/ {totalPackages}</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-tertiary-container/30 flex items-center justify-center text-tertiary shrink-0">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </div>
            </div>

            {/* Top 3 Sevas dispatch status */}
            <div className="space-y-2 mt-4 pt-3.5 border-t border-outline-variant/10">
              {dispatchStatusList.map((s, idx) => {
                return (
                  <div key={idx} className="flex justify-between items-center text-[10px] sm:text-xs font-sans">
                    <span className="font-semibold text-on-surface-variant truncate pr-2" title={s.name}>
                      {s.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold font-mono text-on-surface text-[10px]">
                        {s.count}
                      </span>
                      <span className={`px-2 py-[1px] rounded-full text-[8px] font-bold border ${s.colorClass}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress / Trend Indicator Row */}
          <div className="flex items-center gap-1.5 text-teal-600 font-bold bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl w-fit text-[11px] mt-4 shadow-xs">
            <span className="material-symbols-outlined text-[14px] font-extrabold">check_circle</span>
            <span>{dispatchPercentage}% Shipped Today</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sacred border-t-4 border-outline p-6 hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">Total Collections</p>
              <h3 className="font-display-lg text-3xl text-on-surface mt-1 font-bold">₹{(kpiValues.collections / 1000).toFixed(1)}k</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-on-secondary-fixed-variant">
              <span className="material-symbols-outlined">currency_rupee</span>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="material-symbols-outlined text-[16px] text-green-600 mr-1">trending_up</span>
            <span className="text-green-600 font-semibold">+5%</span>
            <span className="text-on-surface-variant ml-2">vs yesterday</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left column (Charts & Table) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Donation Area-Bar Chart */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sacred p-6 border border-outline-variant/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-sans text-lg font-bold text-on-surface">Donation Trends (Last 7 Days)</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`text-primary hover:bg-primary-container/10 p-2 rounded-full transition-all cursor-pointer ${isRefreshing ? 'opacity-50' : ''}`}
                  title="Refresh Datasets"
                >
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => triggerToast('Generating specialized trends analysis reports...')}
                  className="text-primary hover:bg-primary-container/10 p-2 rounded-full transition-all cursor-pointer"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Chart.js Bar Chart */}
            <div className="w-full h-64 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 p-3 relative overflow-hidden">
              <canvas ref={barCanvasRef} className="w-full h-full" />
            </div>
          </div>

          {/* Activity Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sacred overflow-hidden border border-outline-variant/30">
            <div className="px-6 py-5 border-b divider-gold flex justify-between items-center">
              <h3 className="font-sans text-lg font-bold text-on-surface">Recent Transactions</h3>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-primary text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b divider-gold text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="py-4 px-6">Devotee Name</th>
                    <th className="py-4 px-6">Seva Type</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-on-surface divide-y divide-outline-variant/10">
                  {finalTransactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6 flex items-center">
                        <div className={`w-8 h-8 rounded-full ${tx.bg} flex items-center justify-center font-bold text-xs mr-3`}>
                          {tx.initial}
                        </div>
                        <span className="font-semibold text-on-surface">{tx.name}</span>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">{tx.type}</td>
                      <td className="py-4 px-6 font-semibold">{tx.amount}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tx.status === 'Completed'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30'
                          }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right column (Donut & Quick Actions) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Seva Popularity Doughnut Chart */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sacred p-6 border border-outline-variant/20 flex flex-col">
            <h3 className="font-sans text-lg font-bold text-on-surface mb-6">Seva Popularity</h3>
            <div className="flex-grow flex flex-col items-center justify-center relative">
              <div className="w-full h-56 relative mb-6">
                <canvas ref={doughnutCanvasRef} />
              </div>
            </div>

            {/* Custom Premium Legends List */}
            <div className="space-y-3 pt-4 border-t border-outline-variant/10">
              {(() => {
                const getYesterdayDateString = (todayDateStr: string) => {
                  try {
                    const d = new Date(todayDateStr);
                    d.setDate(d.getDate() - 1);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  } catch (e) {
                    return '';
                  }
                };
                const yesterdayStr = getYesterdayDateString(todayStr);

                const defaultLegendItems = [
                  { name: 'Maha Abhisheka', today: 35, yesterday: 30, color: '#8f4e00' },
                  { name: 'Archana Pooja', today: 25, yesterday: 28, color: '#e49339' },
                  { name: 'Annadanam Seva', today: 20, yesterday: 15, color: '#c27013' },
                  { name: 'Vahan Pooja', today: 12, yesterday: 12, color: '#f7b05b' },
                  { name: 'Chandi Homa', today: 8, yesterday: 15, color: '#6d3800' }
                ];

                const hasAnyTodayOrYesterdayBookings = bookings.some(b => b.bookingDate === todayStr || b.bookingDate === yesterdayStr);

                const legendItems = hasAnyTodayOrYesterdayBookings
                  ? defaultLegendItems.map(item => {
                      const todayCount = todayBookings.filter(b => b.sevaName === item.name && b.sevaStatus !== 'Cancelled').length;
                      const yesterdayCount = bookings.filter(b => b.bookingDate === yesterdayStr && b.sevaName === item.name && b.sevaStatus !== 'Cancelled').length;
                      return {
                        ...item,
                        today: todayCount,
                        yesterday: yesterdayCount
                      };
                    })
                  : defaultLegendItems;

                return legendItems.map((item, idx) => {
                  const diff = item.today - item.yesterday;
                  const isRise = diff > 0;
                  const isFall = diff < 0;

                  return (
                    <div key={idx} className="border-b border-outline-variant/10 last:border-0 pb-2.5 last:pb-0 font-sans">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-on-surface">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-bold font-mono text-xs sm:text-sm" style={{ color: item.color }}>
                          {item.today}
                        </span>
                      </div>

                      {/* Yesterday vs Today, Rise/Fall indicator */}
                      <div className="flex items-center justify-between text-[10px] mt-1 pl-6">
                        <span className="text-on-surface-variant/75 font-semibold">
                          Yesterday Vs today: <span className="font-mono text-on-surface font-bold">{item.yesterday}</span> vs <span className="font-mono text-on-surface font-bold">{item.today}</span>
                        </span>
                        {isRise && (
                          <span className="text-green-600 font-bold flex items-center gap-0.5 shrink-0">
                            <span className="material-symbols-outlined text-[12px] font-extrabold">trending_up</span>
                            <span>+{diff} Rise</span>
                          </span>
                        )}
                        {isFall && (
                          <span className="text-red-600 font-bold flex items-center gap-0.5 shrink-0">
                            <span className="material-symbols-outlined text-[12px] font-extrabold">trending_down</span>
                            <span>{Math.abs(diff)} Fall</span>
                          </span>
                        )}
                        {!isRise && !isFall && (
                          <span className="text-on-surface-variant/50 font-bold shrink-0">
                            No Change
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Quick Actions Bento Box */}
          <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden">
            {/* Decorative bindu/temple curves */}
            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full border-4 border-primary/10 pointer-events-none"></div>
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full border-2 border-primary/20 pointer-events-none"></div>

            <h3 className="font-sans text-lg font-bold text-on-surface mb-4 relative z-10">Quick Actions</h3>

            <div className="space-y-3 relative z-10">
              <button
                onClick={() => onNavigate('prasadam')}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-on-surface border border-outline-variant/50 rounded-xl transition-all duration-200 group shadow-sm cursor-pointer"
              >
                <div className="flex items-center">
                  <Printer className="mr-3 text-primary group-hover:text-on-primary" size={18} />
                  <span className="font-semibold text-sm">Generate Prasadam Slips</span>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => triggerToast('Successfully dispatched temple schedules via SMS & Email gateway!')}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-on-surface border border-outline-variant/50 rounded-xl transition-all duration-200 group shadow-sm cursor-pointer"
              >
                <div className="flex items-center">
                  <Send className="mr-3 text-primary group-hover:text-on-primary" size={18} />
                  <span className="font-semibold text-sm">Configure Push Notifications</span>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => onNavigate('temple_info')}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-on-surface border border-outline-variant/50 rounded-xl transition-all duration-200 group shadow-sm cursor-pointer"
              >
                <div className="flex items-center">
                  <Timer className="mr-3 text-primary group-hover:text-on-primary" size={18} />
                  <span className="font-semibold text-sm">Update Darshan Timings</span>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {showDevoteeModal && (() => {
        const todayStr = getTodayDateString(bookings);
        const filteredTodayBookings = bookings
          .filter(b => b.bookingDate === todayStr)
          .filter(b => {
            // Search term check
            const matchSearch =
              b.devoteeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              b.receiptNo.toLowerCase().includes(searchTerm.toLowerCase());

            // Seva filter check
            const matchSeva = selectedSeva === 'All' || b.sevaName === selectedSeva;

            // Seva Status filter check
            const statusValue = b.sevaStatus || 'Scheduled';
            const matchStatus = selectedStatus === 'All' || statusValue === selectedStatus;

            return matchSearch && matchSeva && matchStatus;
          });

        // Dynamic calculations for the 3 stats cards
        const totalDevoteesToday = filteredTodayBookings.reduce((sum, b) => {
          const persons = b.persons || (b.pilgrims ? b.pilgrims.length + 1 : 1);
          return sum + persons;
        }, 0);

        const uniqueSevasToday = new Set(filteredTodayBookings.map(b => b.sevaName)).size;
        const activeSevaSlotsCount = new Set(filteredTodayBookings.map(b => b.timeSlot)).size;

        const checkinsCompletedCount = filteredTodayBookings
          .filter(b => b.sevaStatus === 'Performed')
          .reduce((sum, b) => {
            const persons = b.persons || (b.pilgrims ? b.pilgrims.length + 1 : 1);
            return sum + persons;
          }, 0);

        const checkinPercentage = totalDevoteesToday > 0 
          ? Math.round((checkinsCompletedCount / totalDevoteesToday) * 100) 
          : 0;

        const sevasListForToday = Array.from(new Set(filteredTodayBookings.map(b => b.sevaName)));

        const toggleSevaAccordion = (sevaName: string) => {
          setExpandedSevas(prev => ({
            ...prev,
            [sevaName]: !prev[sevaName]
          }));
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
            <div className="bg-surface-container-lowest w-full max-w-4xl rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh] animate-[scaleIn_0.2s_ease-out]">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b divider-gold flex justify-between items-center bg-surface-container-low">
                <div>
                  <h3 className="font-serif text-xl font-bold text-primary">Devotees Snap</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                    Live registry of pilgrims scheduled for pooja performance today ({todayStr}).
                  </p>
                </div>
                <button
                  onClick={() => setShowDevoteeModal(false)}
                  className="p-1.5 hover:bg-outline-variant/10 text-on-surface-variant hover:text-on-surface rounded-xl transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto p-6 space-y-6 flex-grow bg-surface-container-lowest/30">
                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Total Devotees Today */}
                  <div className="bg-white/75 backdrop-blur-xs border border-outline-variant/30 rounded-2xl p-4 flex flex-col justify-between shadow-sacred-sm relative">
                    <div className="flex justify-between items-start">
                      <div className="w-9 h-9 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] font-bold">groups</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                        <span className="w-1 h-1 bg-green-600 rounded-full animate-ping" />
                        Live
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Total Devotees Today</p>
                      <h4 className="font-serif text-2xl font-bold text-on-surface mt-0.5">{totalDevoteesToday}</h4>
                    </div>
                  </div>

                  {/* Card 2: Active Seva Slots */}
                  <div className="bg-white/75 backdrop-blur-xs border border-outline-variant/30 rounded-2xl p-4 flex flex-col justify-between shadow-sacred-sm relative">
                    <div className="flex justify-between items-start">
                      <div className="w-9 h-9 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] font-bold">calendar_month</span>
                      </div>
                      <span className="inline-flex items-center text-[8px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        Across {uniqueSevasToday} Categories
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Active Seva Slots</p>
                      <h4 className="font-serif text-2xl font-bold text-on-surface mt-0.5">{activeSevaSlotsCount}</h4>
                    </div>
                  </div>

                  {/* Card 3: Check-ins Completed */}
                  <div className="bg-white/75 backdrop-blur-xs border border-outline-variant/30 rounded-2xl p-4 flex flex-col justify-between shadow-sacred-sm relative">
                    <div className="flex justify-between items-start">
                      <div className="w-9 h-9 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] font-bold">check_circle</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">Check-ins Completed</span>
                        <span className="text-sm font-extrabold text-on-surface font-mono">{checkinPercentage}%</span>
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <div className="w-full bg-surface-container-high rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-primary h-1 rounded-full transition-all duration-500" 
                          style={{ width: `${checkinPercentage}%` }}
                        />
                      </div>
                      <p className="text-[8px] font-bold text-on-surface-variant/80 mt-1.5 text-right">
                        {checkinsCompletedCount} of {totalDevoteesToday} checked in
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search and Filters Toolbar */}
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-1 border-t border-outline-variant/10 pt-4">
                  {/* Search Bar */}
                  <div className="relative w-full md:w-2/5">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search Devotee / Receipt..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                      }}
                      className="pl-9 pr-4 py-2 w-full text-xs font-semibold rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/50"
                    />
                  </div>

                  {/* Filters Group */}
                  <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
                    {/* Seva Dropdown */}
                    <select
                      value={selectedSeva}
                      onChange={(e) => {
                        setSelectedSeva(e.target.value);
                      }}
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-primary cursor-pointer transition-all"
                    >
                      <option value="All">All Sevas</option>
                      <option value="Maha Abhisheka">Maha Abhisheka</option>
                      <option value="Archana Pooja">Archana Pooja</option>
                      <option value="Annadanam Seva">Annadanam Seva</option>
                      <option value="Vahan Pooja">Vahan Pooja</option>
                      <option value="Chandi Homa">Chandi Homa</option>
                    </select>

                    {/* Seva Status Dropdown */}
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                      }}
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-primary cursor-pointer transition-all"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Performed">Performed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Accordions Group by Seva */}
                <div className="space-y-4">
                  {sevasListForToday.length > 0 ? (
                    sevasListForToday.map((sevaName, sIdx) => {
                      const sevaBookings = filteredTodayBookings.filter(b => b.sevaName === sevaName);
                      const firstSlot = sevaBookings[0]?.timeSlot || '09:00 AM';
                      const totalSevaPilgrims = sevaBookings.reduce((sum, b) => sum + (b.persons || (b.pilgrims ? b.pilgrims.length + 1 : 1)), 0);
                      const performedSevaPilgrims = sevaBookings
                        .filter(b => b.sevaStatus === 'Performed')
                        .reduce((sum, b) => sum + (b.persons || (b.pilgrims ? b.pilgrims.length + 1 : 1)), 0);
                      const checkinSevaPct = totalSevaPilgrims > 0 ? Math.round((performedSevaPilgrims / totalSevaPilgrims) * 100) : 0;
                      
                      const isExpanded = expandedSevas[sevaName] ?? false;

                      return (
                        <div key={sIdx} className="bg-white border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sacred-sm transition-all duration-300">
                          {/* Accordion Header */}
                          <div 
                            onClick={() => toggleSevaAccordion(sevaName)}
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-surface-container-lowest transition-colors select-none"
                          >
                            <div className="flex flex-col gap-1">
                              <h4 className="font-serif text-base font-bold text-primary">{sevaName}</h4>
                              <div className="flex items-center gap-2 text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                                <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-mono text-[8px]">
                                  <span className="material-symbols-outlined text-[10px]">schedule</span>
                                  {firstSlot}
                                </span>
                                <span>•</span>
                                <span>{totalSevaPilgrims} Pilgrims</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              {/* Check-in status bar */}
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[8px] font-bold uppercase tracking-wider text-on-surface-variant/80">Check-in Status</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-14 bg-surface-container-high rounded-full h-1 overflow-hidden">
                                    <div className="bg-primary h-1 rounded-full" style={{ width: `${checkinSevaPct}%` }} />
                                  </div>
                                  <span className="text-[9px] font-mono font-bold text-on-surface-variant">{checkinSevaPct}%</span>
                                </div>
                              </div>

                              {/* Chevron expand arrow */}
                              <div className="p-1 hover:bg-outline-variant/10 text-on-surface-variant hover:text-on-surface rounded-full transition-all">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </div>

                          {/* Accordion Content */}
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-outline-variant/10 bg-surface-container-lowest/30 pt-3">
                              <div className="border border-outline-variant/20 rounded-xl overflow-hidden shadow-inner bg-white">
                                <table className="w-full text-left border-collapse font-sans">
                                  <thead>
                                    <tr className="bg-surface-container-low border-b divider-gold text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                                      <th className="py-2.5 px-3">Receipt #</th>
                                      <th className="py-2.5 px-3">Devotee Name</th>
                                      <th className="py-2.5 px-3">Gotra / Nakshatra</th>
                                      <th className="py-2.5 px-3 text-center">Timings</th>
                                      <th className="py-2.5 px-3 text-center">Persons</th>
                                      <th className="py-2.5 px-3 text-center">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="text-xs font-semibold text-on-surface divide-y divide-outline-variant/10">
                                    {sevaBookings.map((d, i) => {
                                      const totalPersons = d.persons || (d.pilgrims ? d.pilgrims.length + 1 : 1);
                                      return (
                                        <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                                          <td className="py-2.5 px-3 font-mono font-bold text-primary">{d.receiptNo}</td>
                                          <td className="py-2.5 px-3 align-top">
                                            <div className="font-bold text-on-surface">{d.devoteeName}</div>
                                            {d.pilgrims && d.pilgrims.length > 0 && (
                                              <div className="mt-1.5 pl-2 border-l-2 border-primary/30 space-y-0.5 text-left">
                                                <div className="text-[8px] text-primary uppercase font-bold tracking-wider">Extra Persons:</div>
                                                {d.pilgrims.map((p, pIdx) => (
                                                  <div key={pIdx} className="text-[9px] text-on-surface-variant/90 font-medium truncate max-w-[150px]">
                                                    • {p.name}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-3 align-top">
                                            <div className="font-semibold text-on-surface-variant">{d.gotra} / {d.nakshetra}</div>
                                            {d.pilgrims && d.pilgrims.length > 0 && (
                                              <div className="mt-1.5 pl-2 space-y-0.5 text-left">
                                                <div className="h-[10px]" />
                                                {d.pilgrims.map((p, pIdx) => (
                                                  <div key={pIdx} className="text-[9px] text-on-surface-variant/60 font-mono">
                                                    {p.gotra || p.gotram || '—'} / {p.nakshetra || p.nakshatram || '—'}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-3 align-top text-center">
                                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-mono text-[9px]">
                                              {d.timeSlot}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3 align-top text-center font-bold text-on-surface-variant">
                                            {totalPersons}
                                          </td>
                                          <td className="py-2.5 px-3 align-top text-center">
                                            <select
                                              value={d.sevaStatus || 'Scheduled'}
                                              onChange={(e) => handleUpdateSevaStatus(d.receiptNo, e.target.value as any)}
                                              className={`px-2 py-1 text-[10px] font-bold rounded-lg border cursor-pointer outline-none transition-all ${(d.sevaStatus || 'Scheduled') === 'Performed'
                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                : (d.sevaStatus || 'Scheduled') === 'Cancelled'
                                                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                                }`}
                                            >
                                              <option value="Scheduled">Scheduled</option>
                                              <option value="Performed">Performed</option>
                                              <option value="Cancelled">Cancelled</option>
                                            </select>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="border border-outline-variant/20 rounded-2xl p-8 text-center text-on-surface-variant/60 font-medium font-sans bg-white">
                      No bookings found matching filters.
                    </div>
                  )}
                </div>

                {/* Disclaimer disclaimer text */}
                <p className="text-[10px] text-on-surface-variant/80 italic mt-6 border-t border-outline-variant/10 pt-4 text-center">
                  * Timings represent the designated ritual slots. Ask pilgrims to report at the queue check-point 15 minutes before the start time with official photo ID.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/10 flex justify-end gap-3">
                <button
                  onClick={() => setShowDevoteeModal(false)}
                  className="px-4 py-2 bg-primary hover:bg-on-primary-container text-on-primary text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showRecentBookingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[90vh] animate-[scaleIn_0.2s_ease-out]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b divider-gold flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-serif text-xl font-bold text-primary">Recent Bookings Registry</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Real-time list of pooja tickets purchased within the last 4 hours.
                </p>
              </div>
              <button
                onClick={() => setShowRecentBookingsModal(false)}
                className="p-1.5 hover:bg-outline-variant/10 text-on-surface-variant hover:text-on-surface rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content - Table */}
            <div className="overflow-y-auto p-6 space-y-4">
              <div className="border border-outline-variant/20 rounded-xl overflow-hidden shadow-inner">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-surface-container-low border-b divider-gold text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      <th className="py-3 px-4">Receipt #</th>
                      <th className="py-3 px-4">Devotee Name</th>
                      <th className="py-3 px-4">Booked Seva</th>
                      <th className="py-3 px-4 text-center">Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-on-surface divide-y divide-outline-variant/10">
                    {[...bookings]
                      .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.receiptNo.localeCompare(a.receiptNo))
                      .slice(0, 10)
                      .map((tx, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-primary">{tx.receiptNo}</td>
                          <td className="py-3 px-4 font-bold">{tx.devoteeName}</td>
                          <td className="py-3 px-4 text-primary font-bold">{tx.sevaName}</td>
                          <td className="py-3 px-4 text-center text-on-surface-variant">{tx.bookingDate}</td>
                          <td className="py-3 px-4 font-bold text-on-surface">₹{tx.amount}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${tx.paymentStatus === 'Paid'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : tx.paymentStatus === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                              {tx.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-on-surface-variant text-center leading-relaxed">
                * View full receipt logs and print temple darshan check-in receipts from the <strong>Transactions Ledger</strong> tab.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/10 flex justify-end gap-3">
              <button
                onClick={() => setShowRecentBookingsModal(false)}
                className="px-4 py-2 bg-primary hover:bg-on-primary-container text-on-primary text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
