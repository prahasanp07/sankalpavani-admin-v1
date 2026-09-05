'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  List,
  Check,
  X,
  Clock,
  User,
  Users,
  CheckCircle,
  Tag,
  CreditCard,
  Printer,
  CheckCircle2,
  QrCode,
  Smartphone,
  Building,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import RequirePermission from './RequirePermission';

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
  persons?: number;
  age?: number | string;
  gender?: string;
  pilgrims?: Pilgrim[];
  paymentMode?: 'Cash' | 'UPI' | 'Card' | 'Net Banking';
  assignedArchaka?: string;
  assignedArchakaAvatar?: string;
  sevaStatus?: 'Scheduled' | 'Performed' | 'Cancelled';
}

interface Archaka {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Duty-Assign';
  avatar?: string;
  avatarColor?: string;
}

interface SevaOption {
  name: string;
  price: number;
  timeRange: string;
  personsPerSeva?: number;
  extraPersonCost?: number;
  aboutSeva?: string;
  instructions?: string;
  capacity?: number;
}

const DEFAULT_SEVAS: SevaOption[] = [
  { name: 'Archana Pooja', price: 101, timeRange: '06:00 AM - 08:30 PM', personsPerSeva: 1, extraPersonCost: 0, aboutSeva: 'Traditional chanting of 108 names of the deity.', instructions: 'Wear traditional attire.', capacity: 200 },
  { name: 'Maha Abhisheka', price: 1500, timeRange: '06:00 AM - 08:00 AM', personsPerSeva: 2, extraPersonCost: 500, aboutSeva: 'Sacred bathing ritual performed on the main deity.', instructions: 'Report 15 minutes early.', capacity: 5 },
  { name: 'Annadanam Seva', price: 2100, timeRange: '12:00 PM - 02:30 PM', personsPerSeva: 4, extraPersonCost: 300, aboutSeva: 'Serving holy meals to visiting pilgrims.', instructions: 'No specific dress code.', capacity: 10 },
  { name: 'Vahan Pooja', price: 1100, timeRange: '09:00 AM - 05:00 PM', personsPerSeva: 1, extraPersonCost: 0, aboutSeva: 'Blessing of new vehicles at the temple temple entrance.', instructions: 'Park vehicle at the gate.', capacity: 15 },
  { name: 'Chandi Homa', price: 5001, timeRange: '07:00 AM - 11:30 AM', personsPerSeva: 3, extraPersonCost: 1000, aboutSeva: 'Powerful fire ritual dedicated to Goddess Durga.', instructions: 'Wear clean ethnic clothing.', capacity: 1 },
  { name: 'Sahasranama Archana', price: 501, timeRange: '05:30 PM - 07:00 PM', personsPerSeva: 2, extraPersonCost: 200, aboutSeva: 'Recitation of 1000 holy names of the deity.', instructions: 'Traditional ethnic wear required.', capacity: 50 }
];

const DEFAULT_BOOKINGS: Booking[] = [
  { receiptNo: 'SV-2026-0612', devoteeName: 'Raghavendran Iyer', gotra: 'Bharadwaja', nakshetra: 'Krittika', sevaName: 'Maha Abhisheka', amount: 1500, paymentStatus: 'Paid', bookingDate: '2026-06-28', timeSlot: '07:30 AM', persons: 2 },
  { receiptNo: 'SV-2026-0613', devoteeName: 'Venkatesh Prasad', gotra: 'Kashyapa', nakshetra: 'Rohini', sevaName: 'Archana Pooja', amount: 101, paymentStatus: 'Paid', bookingDate: '2026-06-28', timeSlot: '09:00 AM', persons: 1 },
  { receiptNo: 'SV-2026-0614', devoteeName: 'Deepika Rao', gotra: 'Vasishta', nakshetra: 'Ashwini', sevaName: 'Annadanam Seva', amount: 2100, paymentStatus: 'Paid', bookingDate: '2026-06-28', timeSlot: '12:00 PM', persons: 4 },
  { receiptNo: 'SV-2026-0615', devoteeName: 'Suresh Kumar', gotra: 'Srivatsa', nakshetra: 'Revati', sevaName: 'Vahan Pooja', amount: 1100, paymentStatus: 'Pending', bookingDate: '2026-06-27', timeSlot: '04:30 PM', persons: 1 },
  { receiptNo: 'SV-2026-0616', devoteeName: 'Meenakshi Sundaram', gotra: 'Atri', nakshetra: 'Anuradha', sevaName: 'Archana Pooja', amount: 101, paymentStatus: 'Paid', bookingDate: '2026-06-27', timeSlot: '10:00 AM', persons: 1 },
  { receiptNo: 'SV-2026-0617', devoteeName: 'Vikram Hegde', gotra: 'Viswamitra', nakshetra: 'Sravana', sevaName: 'Chandi Homa', amount: 5001, paymentStatus: 'Paid', bookingDate: '2026-06-26', timeSlot: '06:00 AM', persons: 3 },
  { receiptNo: 'SV-2026-0618', devoteeName: 'Anantha Padmanabha', gotra: 'Kaushika', nakshetra: 'Uttara Phalguni', sevaName: 'Sahasranama Archana', amount: 501, paymentStatus: 'Paid', bookingDate: '2026-06-25', timeSlot: '08:30 AM', persons: 2 },
  { receiptNo: 'SV-2026-0619', devoteeName: 'Shruthi Vishwanath', gotra: 'Gautama', nakshetra: 'Punarvasu', sevaName: 'Maha Abhisheka', amount: 1500, paymentStatus: 'Refunded', bookingDate: '2026-06-25', timeSlot: '07:30 AM', persons: 2 },
  { receiptNo: 'SV-2026-0620', devoteeName: 'Hari Prasad Bhat', gotra: 'Angirasa', nakshetra: 'Jyeshtha', sevaName: 'Archana Pooja', amount: 101, paymentStatus: 'Paid', bookingDate: '2026-06-24', timeSlot: '11:00 AM', persons: 1 },
  { receiptNo: 'SV-2026-0621', devoteeName: 'Narayana Murthy', gotra: 'Shandilya', nakshetra: 'Pushya', sevaName: 'Chandi Homa', amount: 5001, paymentStatus: 'Pending', bookingDate: '2026-06-23', timeSlot: '06:00 AM', persons: 3 },
  { receiptNo: 'SV-2026-0622', devoteeName: 'Vijayalakshmi R.', gotra: 'Kashyapa', nakshetra: 'Hasta', sevaName: 'Sahasranama Archana', amount: 501, paymentStatus: 'Paid', bookingDate: '2026-06-22', timeSlot: '09:30 AM', persons: 2 },
  { receiptNo: 'SV-2026-0623', devoteeName: 'Srinivasa Raghavan', gotra: 'Bharadwaja', nakshetra: 'Swati', sevaName: 'Annadanam Seva', amount: 2100, paymentStatus: 'Paid', bookingDate: '2026-06-21', timeSlot: '12:30 PM', persons: 4 },
  { receiptNo: 'SV-2026-0624', devoteeName: 'Kalyani Deshpande', gotra: 'Vasishta', nakshetra: 'Chitra', sevaName: 'Vahan Pooja', amount: 1100, paymentStatus: 'Paid', bookingDate: '2026-06-20', timeSlot: '03:00 PM', persons: 1 }
];

const gotramsList = [
  'Bharadwaja',
  'Kashyapa',
  'Vashishta',
  'Gautama',
  'Atri',
  'Vishwamitra',
  'Jamadagni',
  'Angirasa',
  'Shandilya',
  'Haritasa',
  'Kaundinya',
  'Srivatsa'
];

const nakshatramsList = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Poorva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Moola', 'Poorvashadha', 'Uttarashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Poorvabhadra', 'Uttarabhadra', 'Revati'
];

// Safe manual formatting
const formatDateString = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const shiftMockBookingsToToday = (bookingsList: Booking[]): Booking[] => {
  if (bookingsList.length === 0) return bookingsList;
  const dates = bookingsList.map(b => b.bookingDate);
  const latestDateStr = dates.reduce((max, d) => d > max ? d : max, dates[0]);
  const [ly, lm, ld] = latestDateStr.split('-').map(Number);
  const latestDate = new Date(ly, lm - 1, ld);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - latestDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return bookingsList.map(b => {
    const [by, bm, bd] = b.bookingDate.split('-').map(Number);
    const bDate = new Date(by, bm - 1, bd);
    const shiftedDate = new Date(bDate.getTime() + diffDays * 24 * 60 * 60 * 1000);
    const yyyy = shiftedDate.getFullYear();
    const mm = String(shiftedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(shiftedDate.getDate()).padStart(2, '0');
    return {
      ...b,
      bookingDate: `${yyyy}-${mm}-${dd}`
    };
  });
};

export default function CalendarView() {
  // Calendar Navigation
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => formatDateString(new Date()));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sevas, setSevas] = useState<SevaOption[]>(DEFAULT_SEVAS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  // New Booking Form State
  const [newBookingForm, setNewBookingForm] = useState(() => {
    const todayStr = formatDateString(new Date());
    return {
      devoteeName: '',
      gotra: gotramsList[0],
      nakshetra: nakshatramsList[0],
      sevaName: DEFAULT_SEVAS[0].name,
      amount: DEFAULT_SEVAS[0].price,
      bookingDate: todayStr,
      timeSlot: '09:00 AM',
      paymentStatus: 'Pending' as Booking['paymentStatus'],
      persons: 1,
      age: '',
      gender: '',
      paymentMode: 'Cash' as Booking['paymentMode'],
      assignedArchakaId: '',
      pilgrims: [] as Pilgrim[]
    };
  });

  const [archakas, setArchakas] = useState<Archaka[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Payment Gateway / UPI QR Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentGatewayType, setPaymentGatewayType] = useState<'UPI' | 'Card' | 'Net Banking'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('882');

  const openPaymentGateway = (mode: 'UPI' | 'Card' | 'Net Banking') => {
    setPaymentGatewayType(mode);
    setPaymentModalOpen(true);
  };

  const simulatePaymentSuccess = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentModalOpen(false);
      setNewBookingForm(prev => ({
        ...prev,
        paymentStatus: 'Paid',
        paymentMode: paymentGatewayType
      }));
      triggerToast('Thank you payment is successful Seva is booked');
    }, 1000);
  };

  const openAddBookingModal = (customDate?: string) => {
    const todayStr = formatDateString(new Date());
    const targetDate = customDate 
      ? (customDate < todayStr ? todayStr : customDate) 
      : (selectedDateStr < todayStr ? todayStr : selectedDateStr);

    if (customDate && customDate < todayStr) {
      triggerToast("Cannot register bookings for past dates. Defaulting to today.");
    }

    setNewBookingForm({
      devoteeName: '',
      gotra: gotramsList[0],
      nakshetra: nakshatramsList[0],
      sevaName: sevas[0]?.name || DEFAULT_SEVAS[0].name,
      amount: calculateBookingCost(sevas[0]?.name || DEFAULT_SEVAS[0].name, 1),
      bookingDate: targetDate,
      timeSlot: '09:00 AM',
      paymentStatus: 'Pending',
      persons: 1,
      age: '',
      gender: '',
      paymentMode: 'Cash',
      assignedArchakaId: '',
      pilgrims: []
    });
    setShowAddModal(true);
  };

  // Helper to determine the booking slot availability status of a given date (dateStr: YYYY-MM-DD)
  const getDayAvailabilityStatus = (dateStr: string) => {
    // 1. Get all bookings for this date
    const dateBookings = bookings.filter(b => b.bookingDate === dateStr);

    // 2. If there are no bookings, all slots for all sevas are fully available -> Green!
    if (dateBookings.length === 0) {
      return { status: 'Available', color: 'green', bgClass: 'bg-green-500/10 text-green-700 border-green-200/50' };
    }

    // 3. For each seva in our system, let's see how many slots are booked versus capacity
    let hasFullyBookedSeva = false;
    let hasAvailableSeva = false;

    sevas.forEach(s => {
      const sevaBookings = dateBookings.filter(b => b.sevaName === s.name);
      const capacity = s.capacity ?? 20;

      if (capacity !== 999999) {
        if (sevaBookings.length >= capacity) {
          hasFullyBookedSeva = true;
        } else {
          hasAvailableSeva = true;
        }
      } else {
        hasAvailableSeva = true;
      }
    });

    // If all slots for all sevas are fully booked:
    if (!hasAvailableSeva) {
      return { status: 'Not Available', color: 'red', bgClass: 'bg-red-500/10 text-red-700 border-red-200/50' };
    }

    // If some sevas are fully booked but some are still available:
    if (hasFullyBookedSeva) {
      return { status: 'Partially Available', color: 'yellow', bgClass: 'bg-amber-500/10 text-amber-700 border-amber-200/50' };
    }

    // Default fallback is Available
    return { status: 'Available', color: 'green', bgClass: 'bg-green-500/10 text-green-700 border-green-200/50' };
  };

  // Sync / Load Bookings and Sevas
  const loadData = async () => {
    if (typeof window !== 'undefined') {
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
              timeSlot: b.slotTime,
              persons: b.totalPersons,
              paymentMode: b.paymentMethod as any,
              pilgrims: []
            }));
            setBookings(mapped);
            return;
          }
        }
      } catch (err) {
        console.warn('Using local bookings fallback');
      }

      const cachedB = localStorage.getItem('sankalpvani_bookings');
      if (cachedB) {
        try {
          setBookings(JSON.parse(cachedB));
        } catch (e) {
          const shifted = shiftMockBookingsToToday(DEFAULT_BOOKINGS);
          setBookings(shifted);
        }
      } else {
        const shifted = shiftMockBookingsToToday(DEFAULT_BOOKINGS);
        localStorage.setItem('sankalpvani_bookings', JSON.stringify(shifted));
        setBookings(shifted);
      }

      // Sync Seva Master list if available
      const cachedS = localStorage.getItem('sankalpvani_sevas');
      if (cachedS) {
        try {
          const parsedSevas = JSON.parse(cachedS);
          if (Array.isArray(parsedSevas)) {
            const mapped = parsedSevas.map((s: any) => ({
              name: s.name,
              price: s.price,
              timeRange: s.timeRange || '09:00 AM - 12:00 PM',
              personsPerSeva: s.personsPerSeva || 1,
              extraPersonCost: s.extraPersonCost || 0,
              aboutSeva: s.aboutSeva || '',
              instructions: s.instructions || '',
              capacity: s.capacity
            }));
            setSevas(mapped);
            // Default first item to state form
            if (mapped.length > 0) {
              setNewBookingForm(prev => ({
                ...prev,
                sevaName: mapped[0].name,
                amount: mapped[0].price
              }));
            }
          }
        } catch (e) { }
      }

      // Sync Priests/Archakas
      const cachedP = localStorage.getItem('sankalpvani_priests');
      const DEFAULT_PRIESTS: Archaka[] = [
        { id: '1', name: 'Raghavan Bhattar', role: 'Chief Archaka', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
        { id: '2', name: 'Sunder Raman', role: 'Second Priest', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
        { id: '3', name: 'Madhavan Shastri', role: 'Purohit', status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
        { id: '4', name: 'Vasudevan Swamy', role: 'Assistant Priest', status: 'On Leave', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
        { id: '5', name: 'Ganesha Dikshidar', role: 'Rigveda Scholar', status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }
      ];
      if (cachedP) {
        try {
          const parsed = JSON.parse(cachedP);
          if (Array.isArray(parsed)) {
            const mapped = parsed.map((p: any, idx: number) => ({
              id: p.id || String(idx + 1),
              name: p.name,
              role: p.role || 'Archaka',
              status: p.status || 'Active',
              avatar: p.avatar || DEFAULT_PRIESTS[idx % DEFAULT_PRIESTS.length].avatar,
              avatarColor: p.avatarColor
            }));
            setArchakas(mapped);
          }
        } catch (e) {
          setArchakas(DEFAULT_PRIESTS);
        }
      } else {
        localStorage.setItem('sankalpvani_priests', JSON.stringify(DEFAULT_PRIESTS));
        setArchakas(DEFAULT_PRIESTS);
      }
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sankalpvani_bookings_updated', loadData);
    window.addEventListener('sankalpvani_priests_updated', loadData);
    return () => {
      window.removeEventListener('sankalpvani_bookings_updated', loadData);
      window.removeEventListener('sankalpvani_priests_updated', loadData);
    };
  }, []);

  useEffect(() => {
    if (!newBookingForm.assignedArchakaId) {
      setConflictWarning(null);
      return;
    }
    const archaka = archakas.find(a => a.id === newBookingForm.assignedArchakaId);
    if (!archaka) {
      setConflictWarning(null);
      return;
    }

    if (archaka.status === 'On Leave') {
      setConflictWarning(`Warning: ${archaka.name} is currently marked "On Leave" in the registry.`);
      return;
    }

    const hasConflict = bookings.some(b => 
      b.bookingDate === newBookingForm.bookingDate &&
      b.timeSlot === newBookingForm.timeSlot &&
      b.assignedArchaka === archaka.name
    );

    if (hasConflict) {
      setConflictWarning(`Conflict: ${archaka.name} is already assigned to a seva booking at ${newBookingForm.timeSlot} on this date.`);
    } else {
      setConflictWarning(null);
    }
  }, [
    newBookingForm.bookingDate,
    newBookingForm.timeSlot,
    newBookingForm.assignedArchakaId,
    bookings,
    archakas
  ]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const triggerPrint = (booking: Booking) => {
    const refCode = booking.receiptNo.replace(/\D/g, '') || '20260612';
    triggerToast(`Receipt ${booking.receiptNo} (Verification Ref Code: ${refCode}) sent to on-site thermal printer...`);
  };

  const notifyUpdate = (updated: Booking[]) => {
    localStorage.setItem('sankalpvani_bookings', JSON.stringify(updated));
    setBookings(updated);
    window.dispatchEvent(new Event('sankalpvani_bookings_updated'));
  };

  // Handle month switches
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const snapToToday = () => {
    // Fall back to June 28, 2026 if actual today is empty, or snap to actual today
    const realToday = new Date();
    setCurrentDate(new Date(realToday.getFullYear(), realToday.getMonth(), realToday.getDate()));
    setSelectedDateStr(formatDateString(realToday));
  };

  // Grid Calculation
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const cells: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Trailing previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
    cells.push({
      date: d,
      isCurrentMonth: false,
      dateStr: formatDateString(d)
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentYear, currentMonth, i);
    cells.push({
      date: d,
      isCurrentMonth: true,
      dateStr: formatDateString(d)
    });
  }

  // Next month leading days (pad to 35 or 42 grid cells)
  const totalCellsNeeded = cells.length > 35 ? 42 : 35;
  const nextMonthDaysNeeded = totalCellsNeeded - cells.length;
  for (let i = 1; i <= nextMonthDaysNeeded; i++) {
    const d = new Date(currentYear, currentMonth + 1, i);
    cells.push({
      date: d,
      isCurrentMonth: false,
      dateStr: formatDateString(d)
    });
  }

  // Dynamic Cost Calculation helper
  const calculateBookingCost = (sevaName: string, personsCount: number): number => {
    const selectedSeva = sevas.find(s => s.name === sevaName);
    if (!selectedSeva) return 0;
    const basePrice = selectedSeva.price;
    const basePersons = selectedSeva.personsPerSeva || 1;
    const extraCost = selectedSeva.extraPersonCost || 0;
    const extraPersons = Math.max(0, personsCount - basePersons);
    return basePrice + (extraPersons * extraCost);
  };

  // Seva Select Change Handler
  const handleSevaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSeva = sevas.find(s => s.name === e.target.value);
    if (selectedSeva) {
      setNewBookingForm(prev => ({
        ...prev,
        sevaName: selectedSeva.name,
        amount: calculateBookingCost(selectedSeva.name, prev.persons)
      }));
    }
  };

  const handlePersonsCountChange = (newCount: number) => {
    const p = Math.max(1, newCount);
    setNewBookingForm(prev => {
      const currentPilgrimsCount = prev.pilgrims ? prev.pilgrims.length : 0;
      const targetPilgrimsCount = p - 1;

      let nextPilgrims = [...(prev.pilgrims || [])];
      if (targetPilgrimsCount > currentPilgrimsCount) {
        for (let i = currentPilgrimsCount; i < targetPilgrimsCount; i++) {
          nextPilgrims.push({
            name: '',
            gotra: prev.gotra || gotramsList[0],
            nakshetra: prev.nakshetra || nakshatramsList[0],
            age: '',
            gender: 'Male'
          });
        }
      } else if (targetPilgrimsCount < currentPilgrimsCount) {
        nextPilgrims = nextPilgrims.slice(0, targetPilgrimsCount);
      }

      return {
        ...prev,
        persons: p,
        pilgrims: nextPilgrims,
        amount: calculateBookingCost(prev.sevaName, p)
      };
    });
  };

  const addPilgrimField = () => {
    setNewBookingForm(prev => {
      const nextPilgrims = [...(prev.pilgrims || []), {
        name: '',
        gotra: prev.gotra || gotramsList[0],
        nakshetra: prev.nakshetra || nakshatramsList[0],
        age: '',
        gender: 'Male'
      }];
      const nextPersons = 1 + nextPilgrims.length;
      return {
        ...prev,
        pilgrims: nextPilgrims,
        persons: nextPersons,
        amount: calculateBookingCost(prev.sevaName, nextPersons)
      };
    });
  };

  const removePilgrimField = (index: number) => {
    setNewBookingForm(prev => {
      const nextPilgrims = (prev.pilgrims || []).filter((_, i) => i !== index);
      const nextPersons = 1 + nextPilgrims.length;
      return {
        ...prev,
        pilgrims: nextPilgrims,
        persons: nextPersons,
        amount: calculateBookingCost(prev.sevaName, nextPersons)
      };
    });
  };

  const updatePilgrimField = (index: number, field: keyof Pilgrim, value: any) => {
    setNewBookingForm(prev => {
      const nextPilgrims = (prev.pilgrims || []).map((p, i) => {
        if (i === index) {
          return { ...p, [field]: value };
        }
        return p;
      });
      return {
        ...prev,
        pilgrims: nextPilgrims
      };
    });
  };

  const isTimeSlotValid = (time: string) => {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM|am|pm)$/i;
    return timeRegex.test(time.trim());
  };

  // Submit Booking Form
  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();

    const todayStr = formatDateString(new Date());
    if (newBookingForm.bookingDate < todayStr) {
      alert('Cannot register or schedule bookings for past dates. Please select today or a future date.');
      return;
    }

    if (!newBookingForm.devoteeName.trim()) {
      alert('Please enter devotee name');
      return;
    }

    const timeSlotClean = newBookingForm.timeSlot.trim();
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM|am|pm)$/i;
    const match = timeSlotClean.match(timeRegex);
    if (!match) {
      alert('Please enter a valid time slot in format "hh:mm AM/PM" (e.g., "09:00 AM" or "05:30 PM").');
      return;
    }

    // Normalize format to e.g. "09:00 AM"
    let [_, hoursStr, minutesStr, ampm] = match;
    let hours = parseInt(hoursStr, 10);
    const normalizedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const normalizedTimeSlot = `${normalizedHours}:${minutesStr} ${ampm.toUpperCase()}`;

    const uniqueId = `SV-${newDateYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const selectedArchaka = archakas.find(a => a.id === newBookingForm.assignedArchakaId);
    const newBooking: Booking = {
      receiptNo: uniqueId,
      devoteeName: newBookingForm.devoteeName,
      gotra: newBookingForm.gotra || gotramsList[0],
      nakshetra: newBookingForm.nakshetra || nakshatramsList[0],
      sevaName: newBookingForm.sevaName,
      amount: newBookingForm.amount,
      paymentStatus: newBookingForm.paymentStatus,
      bookingDate: newBookingForm.bookingDate,
      timeSlot: normalizedTimeSlot,
      persons: newBookingForm.persons,
      age: newBookingForm.age,
      gender: newBookingForm.gender,
      paymentMode: newBookingForm.paymentMode,
      assignedArchaka: selectedArchaka?.name,
      assignedArchakaAvatar: selectedArchaka?.avatar,
      pilgrims: newBookingForm.pilgrims
    };

    try {
      fetch('/api/v1/temples/temple_vidyashankara/bookings?trustId=trust_sringeri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sevaId: 'seva_svt_rudrabhisheka',
          bookingDate: newBooking.bookingDate,
          slotTime: newBooking.timeSlot,
          primaryDevoteeName: newBooking.devoteeName,
          primaryPhone: '+91 98450 11000',
          gotra: newBooking.gotra,
          nakshatra: newBooking.nakshetra,
          pilgrims: newBooking.pilgrims,
          paymentMethod: newBooking.paymentMode,
          isHomeDelivery: false
        })
      }).catch(e => console.warn('Background backend booking registration fallback'));
    } catch (e) {
      console.warn('Booking post error');
    }

    const updated = [newBooking, ...bookings];
    notifyUpdate(updated);

    // Reset Form
    setNewBookingForm({
      devoteeName: '',
      gotra: gotramsList[0],
      nakshetra: nakshatramsList[0],
      sevaName: sevas[0]?.name || '',
      amount: sevas[0]?.price || 0,
      bookingDate: selectedDateStr,
      timeSlot: '09:00 AM',
      paymentStatus: 'Pending',
      persons: 1,
      age: '',
      gender: 'Male',
      paymentMode: 'Cash',
      assignedArchakaId: '',
      pilgrims: []
    });

    const shouldPrint = (window as any)._shouldPrintOnSubmit;
    delete (window as any)._shouldPrintOnSubmit;

    setShowAddModal(false);
    if (shouldPrint) {
      triggerPrint(newBooking);
    } else {
      triggerToast(`Booking registration generated: ${uniqueId}`);
    }
  };

  const newDateYear = () => {
    try {
      return newBookingForm.bookingDate.split('-')[0];
    } catch (e) {
      return '2026';
    }
  };

  // Change Booking Status
  const handleUpdateStatus = (receiptNo: string, newStatus: Booking['paymentStatus']) => {
    const updated = bookings.map(b => {
      if (b.receiptNo === receiptNo) {
        return { ...b, paymentStatus: newStatus };
      }
      return b;
    });
    notifyUpdate(updated);
    if (activeBooking && activeBooking.receiptNo === receiptNo) {
      setActiveBooking({ ...activeBooking, paymentStatus: newStatus });
    }
    triggerToast(`Transaction status updated to ${newStatus}`);
  };

  // Get color for payment status
  const getStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/10 text-green-700 border-green-600/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-700 border-amber-600/20';
      case 'Refunded':
        return 'bg-red-500/10 text-red-700 border-red-600/20';
      default:
        return 'bg-surface-variant text-on-surface-variant border-outline-variant/30';
    }
  };

  // Month Display Name
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Bookings filtered for active date selection
  const activeDayBookings = bookings.filter(b => b.bookingDate === selectedDateStr);

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-primary-container text-on-primary-container border border-primary/20 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-primary animate-bounce" />
          <span className="font-sans text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-primary tracking-wider uppercase mb-1">
            <span>Home</span>
            <span className="text-on-surface-variant/40">/</span>
            <span>Calendar</span>
          </div>
          <h2 className="font-serif text-3xl font-semibold text-primary">{monthName}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Snap Today / Navigation */}
          <div className="flex items-center bg-surface-container-low border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={prevMonth}
              className="p-2.5 hover:bg-primary-container/5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={snapToToday}
              className="px-4 py-2 text-xs font-bold text-primary hover:bg-primary-container/5 transition-colors cursor-pointer border-x border-outline-variant/20"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2.5 hover:bg-primary-container/5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* View switcher */}
          <div className="flex bg-surface-container-low border border-outline-variant/30 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
                }`}
              title="Month Grid"
            >
              <Calendar size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
                }`}
              title="Agenda List"
            >
              <List size={15} />
            </button>
          </div>

          {/* Register new Seva */}
          <RequirePermission 
            permission="REGISTER_BOOKINGS"
            showLockedUI={true}
            lockedMessage="Booking Locked"
          >
            <button
              onClick={() => openAddBookingModal()}
              className="flex items-center gap-1.5 bg-primary hover:bg-on-primary-container text-on-primary font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm hover:shadow-md transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus size={14} />
              <span>Add Booking</span>
            </button>
          </RequirePermission>
        </div>
      </div>

      {/* Main Content Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Calendar Grid / List Agenda */}
        <div className="lg:col-span-7 space-y-6">

          {viewMode === 'grid' ? (
            <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 p-4">
              {/* Slots Availability Legend */}
              <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 mb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low/30 px-4 py-2 rounded-xl border border-outline-variant/10">
                <span className="text-[9px] text-on-surface-variant font-extrabold">Sevas Slots:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                  <span>Partially Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm animate-pulse" />
                  <span>Not Available</span>
                </div>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 text-center font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 border-b divider-gold pb-3">
                <span className="text-error/90">Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span className="text-primary">Sat</span>
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((cell, idx) => {
                  const dayBookings = bookings.filter(b => b.bookingDate === cell.dateStr);
                  const isSelected = selectedDateStr === cell.dateStr;
                  const todayStr = formatDateString(new Date());
                  const isToday = todayStr === cell.dateStr;
                  const availability = getDayAvailabilityStatus(cell.dateStr);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      onDoubleClick={() => {
                        if (cell.dateStr < todayStr) {
                          triggerToast("Cannot register bookings for past dates");
                          return;
                        }
                        setSelectedDateStr(cell.dateStr);
                        openAddBookingModal(cell.dateStr);
                      }}
                      className={`min-h-[55px] sm:min-h-[62px] md:min-h-[72px] lg:min-h-[80px] p-1.5 rounded-xl border flex flex-col justify-between transition-all select-none cursor-pointer border-t-4 ${availability.color === 'red'
                        ? 'border-t-red-500'
                        : availability.color === 'yellow'
                          ? 'border-t-amber-400'
                          : 'border-t-green-500'
                        } ${cell.isCurrentMonth
                          ? isSelected
                            ? 'bg-primary-container/10 border-primary ring-1 ring-primary'
                            : 'bg-surface-container-low/50 border-outline-variant/20 hover:bg-surface-container-low hover:border-primary/30'
                          : 'bg-surface-container-lowest/20 border-outline-variant/10 text-on-surface-variant/40 hover:bg-surface-container-lowest/50'
                        }`}
                      title={cell.dateStr < todayStr
                        ? `Past date (View bookings only)`
                        : `Double-click to register new seva booking \n(Slots Availability: ${availability.status})`
                      }
                    >
                      {/* Date Indicator Header */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${isToday
                              ? 'bg-primary text-on-primary shadow-sm font-extrabold'
                              : isSelected
                                ? 'text-primary font-bold'
                                : 'text-on-surface font-semibold'
                              }`}
                          >
                            {cell.date.getDate()}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${availability.color === 'red'
                              ? 'bg-red-500 shadow-sm animate-pulse'
                              : availability.color === 'yellow'
                                ? 'bg-amber-400 shadow-sm'
                                : 'bg-green-500 shadow-sm'
                              }`}
                            title={`Slots Availability: ${availability.status}`}
                          />
                        </div>

                        {/* Dot indicator for mobile */}
                        {dayBookings.length > 0 && (
                          <div className="flex gap-0.5 md:hidden">
                            {dayBookings.slice(0, 3).map((b, bIdx) => (
                              <span
                                key={bIdx}
                                className={`w-1 h-1 rounded-full ${b.paymentStatus === 'Paid'
                                  ? 'bg-green-500'
                                  : b.paymentStatus === 'Pending'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                  }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bookings events stack on desktop */}
                      <div className="hidden md:flex flex-col gap-1 mt-1.5 overflow-hidden flex-1 justify-end">
                        {dayBookings.slice(0, 2).map((b) => (
                          <div
                            key={b.receiptNo}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveBooking(b);
                              setShowDetailModal(true);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border truncate hover:scale-[1.02] transition-transform ${b.paymentStatus === 'Paid'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : b.paymentStatus === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            title={`${b.devoteeName} - ${b.sevaName}`}
                          >
                            {b.devoteeName.split(' ')[0]}: {b.sevaName}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <span className="text-[9px] font-bold text-primary pl-1">
                            +{dayBookings.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            /* Agenda List view */
            <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold text-primary border-b divider-gold pb-3 flex items-center gap-1.5">
                <Calendar size={18} /> Month Schedule Bookings List
              </h3>

              {bookings.filter(b => {
                const parts = b.bookingDate.split('-');
                return parseInt(parts[0]) === currentYear && parseInt(parts[1]) - 1 === currentMonth;
              }).length === 0 ? (
                <div className="text-center py-10 text-on-surface-variant/60 font-sans text-xs">
                  No bookings scheduled for this month.
                </div>
              ) : (
                <div className="border border-outline-variant/20 rounded-xl overflow-hidden shadow-inner divide-y divide-outline-variant/15">
                  {[...bookings]
                    .filter(b => {
                      const parts = b.bookingDate.split('-');
                      return parseInt(parts[0]) === currentYear && parseInt(parts[1]) - 1 === currentMonth;
                    })
                    .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.timeSlot.localeCompare(a.timeSlot))
                    .map((b) => (
                      <div
                        key={b.receiptNo}
                        onClick={() => {
                          setActiveBooking(b);
                          setShowDetailModal(true);
                        }}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:bg-surface-container-low/30 transition-colors cursor-pointer gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {b.devoteeName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-on-surface">{b.devoteeName}</span>
                              <span className="font-mono text-[9px] font-bold text-primary bg-primary-container/10 px-1.5 py-0.5 rounded-full border border-primary/10">
                                {b.receiptNo}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 font-sans text-xs text-on-surface-variant font-medium mt-1">
                              <span className="text-primary font-bold">{b.sevaName}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5"><Clock size={11} /> {b.bookingDate} at {b.timeSlot}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                          <span className="font-bold text-sm">₹{b.amount}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(b.paymentStatus)}`}>
                            {b.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Selected Day Agenda details / sidebar preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 p-6 space-y-4">

            {/* Header selection info */}
            <div className="border-b divider-gold pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                  <span>Seva Overview -</span>
                  <span className="font-mono text-sm font-semibold text-on-surface-variant">
                    {selectedDateStr || formatDateString(new Date())}
                  </span>
                </h3>
              </div>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-container/20 border border-primary/20 text-xs font-bold text-primary">
                {activeDayBookings.length}
              </span>
            </div>

            {/* List Agenda for active selection */}
            {activeDayBookings.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant/60 font-sans text-xs flex flex-col items-center gap-2">
                <span>No bookings scheduled for this date.</span>
                {selectedDateStr >= formatDateString(new Date()) ? (
                  <button
                    onClick={() => openAddBookingModal(selectedDateStr)}
                    className="text-primary hover:text-on-primary-container text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add Booking
                  </button>
                ) : (
                  <span className="text-[10px] text-on-surface-variant/50 italic">
                    Past date (Bookings closed)
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 hide-scrollbar">
                {activeDayBookings.map((b) => (
                  <div
                    key={b.receiptNo}
                    onClick={() => {
                      setActiveBooking(b);
                      setShowDetailModal(true);
                    }}
                    className="p-4 bg-surface-container-low/40 border border-outline-variant/20 rounded-xl hover:bg-surface-container-low hover:border-primary/30 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex gap-3">
                      {/* Devotee Initials Avatar Column */}
                      <div className="shrink-0 flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-inner">
                          {b.devoteeName.charAt(0)}
                        </div>
                      </div>

                      {/* Main Details Column */}
                      <div className="flex-grow min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-on-surface truncate">{b.devoteeName}</h4>
                            <div className="flex items-center gap-1.5 text-[9px] text-on-surface-variant font-medium mt-0.5">
                              <span className="font-mono bg-surface-container-low px-1.5 py-0.5 rounded border border-outline-variant/30 text-on-surface-variant/70 font-semibold">{b.receiptNo}</span>
                              <span>•</span>
                              <span className="font-semibold text-primary">{b.paymentMode || 'Cash'}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="font-bold text-xs sm:text-sm text-on-surface">₹{b.amount}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${getStatusColor(b.paymentStatus)}`}>
                              {b.paymentStatus}
                            </span>
                          </div>
                        </div>

                        <div className="bg-surface-container-low/30 border border-outline-variant/15 p-2 rounded-lg space-y-1">
                          <div className="text-primary text-[10px] sm:text-[11px] font-bold">{b.sevaName}</div>
                          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-on-surface-variant/80 font-medium">
                            <Clock size={10} className="text-primary shrink-0" />
                            <span>{sevas.find(s => s.name === b.sevaName)?.timeRange || b.timeSlot}</span>
                          </div>
                        </div>

                        {b.assignedArchaka ? (
                          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-on-surface-variant font-semibold bg-primary/5 border border-primary/10 pl-1.5 pr-2.5 py-1 rounded-full w-fit shadow-xs">
                            {b.assignedArchakaAvatar ? (
                              <img 
                                src={b.assignedArchakaAvatar} 
                                alt={b.assignedArchaka} 
                                className="w-5 h-5 rounded-full object-cover border border-primary/20 shadow-sm shrink-0"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-primary-container/30 border border-primary/15 flex items-center justify-center text-primary font-bold text-[8px] shrink-0">
                                {b.assignedArchaka.charAt(0)}
                              </div>
                            )}
                            <span>Archaka: {b.assignedArchaka}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-on-surface-variant/40 font-medium px-2 py-1 bg-surface-container-low border border-outline-variant/10 rounded-full w-fit">
                            <span className="material-symbols-outlined text-[12px] text-on-surface-variant/40">person_off</span>
                            <span>No Archaka assigned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-2">
              <RequirePermission 
                permission="REGISTER_BOOKINGS"
                showLockedUI={true}
                lockedMessage="Seva Registration Restricted"
                className="w-full justify-center py-2.5"
              >
                <button
                  onClick={() => openAddBookingModal(selectedDateStr)}
                  className="w-full border border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Register Seva Booking</span>
                </button>
              </RequirePermission>
            </div>

          </div>
        </div>

      </div>

      {/* MODAL: Register New Seva Booking */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />

          <div className="bg-surface-container-lowest w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col relative z-10 animate-[scaleIn_0.2s_ease-out]">
            {/* Header */}
            <div className="px-6 py-4 border-b divider-gold flex justify-between items-center bg-surface-container-low shrink-0">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <Calendar size={18} />
                  New Devotee Seva Booking
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-outline-variant/15 text-on-surface-variant hover:text-on-surface rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form wrapper */}
            <form onSubmit={handleAddBooking} className="flex flex-col flex-grow overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Devotee Name */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Devotee Full Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-3.5 text-primary" />
                    <input
                      type="text"
                      required
                      value={newBookingForm.devoteeName}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, devoteeName: e.target.value })}
                      placeholder="e.g. Ramesh Hegde"
                      className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Age (Optional) */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Age (Optional)</label>
                  <input
                    type="number"
                    value={newBookingForm.age}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, age: e.target.value })}
                    placeholder="Age (Optional)"
                    className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Gender (Optional) */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Gender (Optional)</label>
                  <select
                    value={newBookingForm.gender}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, gender: e.target.value })}
                    className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none appearance-none cursor-pointer text-on-surface font-semibold text-on-surface-variant"
                  >
                    <option value="">Select Gender (Optional)...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Gotra */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Gotra</label>
                  <select
                    value={newBookingForm.gotra}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, gotra: e.target.value })}
                    className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none appearance-none cursor-pointer text-on-surface font-semibold text-on-surface-variant"
                  >
                    {gotramsList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Nakshatra */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nakshatra / Rashi</label>
                  <select
                    value={newBookingForm.nakshetra}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, nakshetra: e.target.value })}
                    className="w-full px-3 py-2.5 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none appearance-none cursor-pointer text-on-surface font-semibold text-on-surface-variant"
                  >
                    {nakshatramsList.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                {/* Seva Offering Type */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Seva Offering</label>
                  <div className="relative">
                    <Tag size={13} className="absolute left-3 top-3.5 text-primary" />
                    <select
                      value={newBookingForm.sevaName}
                      onChange={handleSevaChange}
                      className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none appearance-none cursor-pointer font-semibold text-primary"
                    >
                      {sevas.map(s => (
                        <option key={s.name} value={s.name}>
                          {s.name} (Base Price: ₹{s.price})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* No. of Persons */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">No. of Persons</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newBookingForm.persons}
                    onChange={(e) => {
                      const p = Math.max(1, Number(e.target.value));
                      handlePersonsCountChange(p);
                    }}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Booking Date */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Schedule Date</label>
                    <span className="text-[9px] font-semibold text-primary/80">Future / Today only</span>
                  </div>
                  <input
                    type="date"
                    required
                    min={formatDateString(new Date())}
                    value={newBookingForm.bookingDate}
                    onChange={(e) => {
                      const selected = e.target.value;
                      const todayStr = formatDateString(new Date());
                      if (selected && selected < todayStr) {
                        alert("Cannot schedule seva bookings for past dates. Please choose today or a future date.");
                        return;
                      }
                      setNewBookingForm({ ...newBookingForm, bookingDate: selected });
                    }}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Time slot picker */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Selected Slot / Timing</label>
                  <div className="relative">
                    <Clock size={13} className="absolute left-3 top-3.5 text-primary" />
                    <input
                      type="text"
                      required
                      value={newBookingForm.timeSlot}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, timeSlot: e.target.value })}
                      placeholder="e.g. 09:00 AM"
                      className={`w-full pl-9 pr-4 py-2.5 bg-surface-container-low border rounded-xl text-xs focus:outline-none transition-all ${
                        newBookingForm.timeSlot && !isTimeSlotValid(newBookingForm.timeSlot)
                          ? 'border-red-500 focus:border-red-600 bg-red-50/10'
                          : 'border-outline focus:border-primary'
                      }`}
                    />
                  </div>
                  {newBookingForm.timeSlot && !isTimeSlotValid(newBookingForm.timeSlot) && (
                    <span className="text-[9px] text-red-500 font-semibold pl-1 animate-[fadeIn_0.2s_ease-out]">
                      Invalid format. Use &quot;hh:mm AM/PM&quot; (e.g. 09:30 AM).
                    </span>
                  )}
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Ticket Cost (Amount)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-primary font-bold">₹</span>
                    <input
                      type="number"
                      required
                      disabled
                      value={newBookingForm.amount}
                      className="w-full pl-7 pr-4 py-2 bg-surface-container-low border border-outline rounded-xl text-xs font-bold text-on-surface opacity-75 select-none"
                    />
                  </div>
                  {(() => {
                    const selectedSeva = sevas.find(s => s.name === newBookingForm.sevaName);
                    if (!selectedSeva) return null;
                    const basePersons = selectedSeva.personsPerSeva || 1;
                    const extraCost = selectedSeva.extraPersonCost || 0;
                    if (extraCost > 0) {
                      return (
                        <span className="text-[9px] text-primary font-semibold pl-1">
                          Base includes {basePersons} {basePersons === 1 ? 'person' : 'persons'}. Extra persons charged at ₹{extraCost} each.
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Dynamic Extra Pilgrims / Persons Section */}
                <div className="sm:col-span-2 border-t border-outline-variant/10 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-primary" />
                      <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">
                        Pilgrims / Extra Persons ({newBookingForm.pilgrims?.length || 0})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addPilgrimField}
                      className="px-2.5 py-1 text-[10px] font-bold border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={10} />
                      Add Extra Person
                    </button>
                  </div>

                  {/* Pilgrim input fields list */}
                  {newBookingForm.pilgrims && newBookingForm.pilgrims.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {newBookingForm.pilgrims.map((p, idx) => (
                        <div key={idx} className="bg-surface-container-low/40 border border-outline-variant/30 rounded-xl p-3 space-y-2.5 relative">
                          <button
                            type="button"
                            onClick={() => removePilgrimField(idx)}
                            className="absolute top-2 right-2 p-1 text-on-surface-variant hover:text-red-500 rounded-lg hover:bg-red-500/5 transition-colors cursor-pointer"
                          >
                            <X size={12} />
                          </button>

                          <div className="text-[10px] font-bold text-primary tracking-wide">
                            Extra Person #{idx + 1}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {/* Pilgrim Name */}
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[9px] font-semibold text-on-surface-variant uppercase">Full Name</label>
                              <input
                                type="text"
                                required
                                value={p.name}
                                onChange={(e) => updatePilgrimField(idx, 'name', e.target.value)}
                                placeholder="Name"
                                className="w-full px-2 py-1.5 bg-surface-container-low border border-outline rounded-lg text-xs focus:outline-none"
                              />
                            </div>

                            {/* Pilgrim Gotra */}
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[9px] font-semibold text-on-surface-variant uppercase">Gotra</label>
                              <select
                                value={p.gotra}
                                onChange={(e) => updatePilgrimField(idx, 'gotra', e.target.value)}
                                className="w-full px-2 py-1.5 bg-surface-container-low border border-outline rounded-lg text-xs focus:outline-none cursor-pointer"
                              >
                                {gotramsList.map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </div>

                            {/* Pilgrim Nakshatra */}
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[9px] font-semibold text-on-surface-variant uppercase">Nakshatra</label>
                              <select
                                value={p.nakshetra}
                                onChange={(e) => updatePilgrimField(idx, 'nakshetra', e.target.value)}
                                className="w-full px-2 py-1.5 bg-surface-container-low border border-outline rounded-lg text-xs focus:outline-none cursor-pointer"
                              >
                                {nakshatramsList.map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low/20">
                      <span className="text-[10px] text-on-surface-variant/60 font-medium">
                        No extra persons added yet. Click &apos;Add Extra Person&apos; or change the persons count to add.
                      </span>
                    </div>
                  )}
                </div>

                {/* Mode of Payment & Pay button */}
                <div className="flex flex-col gap-1.5 sm:col-span-2 bg-surface-container-low/40 p-3.5 rounded-2xl border border-outline-variant/30">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                      <CreditCard size={12} className="text-primary" />
                      <span>Mode of Payment</span>
                    </label>
                    {newBookingForm.paymentStatus === 'Paid' && (
                      <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Payment Completed
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                    <div className="sm:col-span-6 relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-primary text-[16px]">payments</span>
                      <select
                        value={newBookingForm.paymentMode || 'Cash'}
                        onChange={(e) => {
                          const mode = e.target.value as Booking['paymentMode'];
                          setNewBookingForm({ ...newBookingForm, paymentMode: mode });
                        }}
                        className="w-full pl-9 pr-4 py-2.5 bg-surface-container border border-outline rounded-xl text-xs focus:outline-none appearance-none cursor-pointer font-bold text-on-surface"
                      >
                        <option value="Cash">Cash (Counter Collection)</option>
                        <option value="UPI">UPI (QR Code / Dynamic VPA)</option>
                        <option value="Card">Card (Credit / Debit Card)</option>
                        <option value="Net Banking">Net Banking</option>
                      </select>
                    </div>

                    <div className="sm:col-span-6">
                      {newBookingForm.paymentMode === 'UPI' ? (
                        <button
                          type="button"
                          onClick={() => openPaymentGateway('UPI')}
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                        >
                          <QrCode size={14} />
                          <span>Pay via UPI (Generate QR)</span>
                        </button>
                      ) : newBookingForm.paymentMode === 'Card' || newBookingForm.paymentMode === 'Net Banking' ? (
                        <button
                          type="button"
                          onClick={() => openPaymentGateway(newBookingForm.paymentMode as any)}
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                        >
                          <CreditCard size={14} />
                          <span>Pay ₹{newBookingForm.amount} (Payment Gateway)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setNewBookingForm(prev => ({ ...prev, paymentStatus: 'Paid' }));
                            triggerToast('Cash payment received & marked as Paid');
                          }}
                          className="w-full py-2.5 px-3 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                          <Check size={14} className="text-green-600" />
                          <span>Mark Cash as Paid</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Gateway Status - Appears only when payment is successful */}
                {newBookingForm.paymentStatus === 'Paid' && (
                  <div className="flex flex-col gap-1 sm:col-span-2 animate-[fadeIn_0.3s_ease-out]">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-green-700">Payment Gateway Status</label>
                    <div className="p-3.5 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-between gap-2.5 text-green-800 text-xs font-bold shadow-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-600 shrink-0 animate-bounce" />
                        <span>Thank you payment is successful Seva is booked</span>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-green-600 text-white font-bold tracking-wide">
                        PAID
                      </span>
                    </div>
                  </div>
                )}

                {/* Conflict warning banner */}
                {conflictWarning && (
                  <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] p-3.5 rounded-xl sm:col-span-2">
                    <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0">warning</span>
                    <span className="font-bold">{conflictWarning}</span>
                  </div>
                )}

                {/* Dynamic Info Cards from Selected Seva */}
                {sevas.find(s => s.name === newBookingForm.sevaName)?.aboutSeva && (
                  <div className="flex flex-col gap-1 sm:col-span-2 bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary">About Seva</span>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      {sevas.find(s => s.name === newBookingForm.sevaName)?.aboutSeva}
                    </p>
                  </div>
                )}

                {sevas.find(s => s.name === newBookingForm.sevaName)?.instructions && (
                  <div className="flex flex-col gap-1 sm:col-span-2 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700">Instructions / Guidelines</span>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      {sevas.find(s => s.name === newBookingForm.sevaName)?.instructions}
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Action Buttons */}
              <div className="border-t divider-gold px-6 py-4 flex justify-end gap-3 bg-surface-container-low shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-outline-variant/40 hover:bg-surface-container text-xs font-bold text-on-surface-variant rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => { (window as any)._shouldPrintOnSubmit = true; }}
                  className="px-4 py-2 bg-[#8F4E00] hover:bg-[#7a4300] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  <span>Generate & Print</span>
                </button>
                <button
                  type="submit"
                  onClick={() => { (window as any)._shouldPrintOnSubmit = false; }}
                  className="px-5 py-2 bg-primary hover:bg-on-primary-container text-on-primary text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check size={14} />
                  <span>Generate Booking Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Booking Event details & Status update */}
      {showDetailModal && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="absolute inset-0" onClick={() => setShowDetailModal(false)} />

          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col relative z-10 animate-[scaleIn_0.2s_ease-out]">
            {/* Header */}
            <div className="px-6 py-4 border-b divider-gold flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">Booking Event details</h3>
                <span className="font-mono text-[9px] font-bold text-primary mt-1 inline-block">{activeBooking.receiptNo}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-outline-variant/15 text-on-surface-variant hover:text-on-surface rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-3 font-sans text-xs">

                {/* Devotee Info */}
                <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant font-medium">Devotee Name</span>
                  <span className="font-bold text-on-surface">
                    {activeBooking.devoteeName} {activeBooking.age ? `(Age: ${activeBooking.age}, ${activeBooking.gender || 'Male'})` : ''}
                  </span>
                </div>

                {/* Gotra / Nakshetra */}
                <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant font-medium">Gotra / Nakshatra</span>
                  <span className="font-bold text-on-surface font-mono">{activeBooking.gotra} / {activeBooking.nakshetra}</span>
                </div>

                {/* Pilgrims List if available */}
                {activeBooking.pilgrims && activeBooking.pilgrims.length > 0 && (
                  <div className="border-b border-outline-variant/10 pb-2">
                    <span className="text-on-surface-variant font-medium block mb-1">Pilgrims Roster ({activeBooking.pilgrims.length})</span>
                    <div className="space-y-1 pl-2">
                      {activeBooking.pilgrims.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] font-sans">
                          <span className="text-on-surface-variant">• {p.name} {p.age ? `(Age: ${p.age}, ${p.gender})` : ''}</span>
                          <span className="font-mono text-on-surface-variant">{p.gotra || p.gotram} / {p.nakshetra || p.nakshatram}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seva name */}
                <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant font-medium">Booked Seva offering</span>
                  <span className="font-bold text-primary">{activeBooking.sevaName}</span>
                </div>

                {/* Date / Time */}
                <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant font-medium">Timing & Date</span>
                  <span className="font-bold text-on-surface font-mono">{activeBooking.bookingDate} at {activeBooking.timeSlot}</span>
                </div>

                {/* Cost */}
                <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant font-medium">Pooja cost</span>
                  <span className="font-bold text-on-surface text-sm">₹{activeBooking.amount}</span>
                </div>

                {/* Payment Mode */}
                <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant font-medium">Mode of Payment</span>
                  <span className="font-bold text-on-surface">{activeBooking.paymentMode || 'Cash'}</span>
                </div>

                {/* Assigned Archaka */}
                <div className="flex justify-between border-b border-outline-variant/10 pb-2 items-center">
                  <span className="text-on-surface-variant font-medium">Assigned Archaka</span>
                  <div className="flex items-center gap-2">
                    {activeBooking.assignedArchaka ? (
                      <>
                        {activeBooking.assignedArchakaAvatar && (
                          <img 
                            src={activeBooking.assignedArchakaAvatar} 
                            alt={activeBooking.assignedArchaka} 
                            className="w-5 h-5 rounded-full object-cover border border-primary/20 shadow-sm"
                          />
                        )}
                        <span className="font-bold text-on-surface">{activeBooking.assignedArchaka}</span>
                      </>
                    ) : (
                      <span className="font-medium text-on-surface-variant/60 italic">Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Status Updater */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-on-surface-variant font-medium">Edit status</span>

                  <div className="relative">
                    <select
                      value={activeBooking.paymentStatus}
                      onChange={(e) => handleUpdateStatus(activeBooking.receiptNo, e.target.value as Booking['paymentStatus'])}
                      className={`pl-3 pr-8 py-1.5 border rounded-xl text-xs font-bold cursor-pointer focus:outline-none appearance-none ${getStatusColor(activeBooking.paymentStatus)}`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                    <ChevronRight size={12} className="absolute right-2.5 top-2.5 rotate-90 text-current pointer-events-none" />
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="border-t divider-gold pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => triggerPrint(activeBooking)}
                  className="px-4 py-2 bg-[#8F4E00] hover:bg-[#7a4300] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2 bg-primary hover:bg-on-primary-container text-on-primary text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Payment Gateway & UPI QR Code Simulation (MVP) */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="absolute inset-0" onClick={() => !isProcessingPayment && setPaymentModalOpen(false)} />

          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-2xl border border-primary/30 overflow-hidden flex flex-col relative z-10 animate-[scaleIn_0.2s_ease-out]">
            {/* Header */}
            <div className="px-6 py-4 border-b divider-gold flex justify-between items-center bg-surface-container-low shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  {paymentGatewayType === 'UPI' ? <QrCode size={18} /> : <CreditCard size={18} />}
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-primary">
                    {paymentGatewayType === 'UPI' ? 'UPI Payment Gateway' : paymentGatewayType === 'Card' ? 'Debit / Credit Card Gateway' : 'Net Banking Portal'}
                  </h3>
                  <p className="text-[10px] text-on-surface-variant font-medium">
                    256-Bit SSL Encrypted Sacred Payment Gateway
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 hover:bg-outline-variant/15 text-on-surface-variant hover:text-on-surface rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 text-xs font-sans">
              {/* Summary Pill */}
              <div className="p-3.5 bg-primary/5 rounded-2xl border border-primary/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Devotee Seva Total</span>
                  <span className="font-serif text-sm font-bold text-primary">{newBookingForm.sevaName}</span>
                  <span className="text-[11px] text-on-surface-variant block mt-0.5">Devotee: {newBookingForm.devoteeName || 'Primary Devotee'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">Payable</span>
                  <span className="font-mono text-xl font-bold text-primary">₹{newBookingForm.amount}</span>
                </div>
              </div>

              {/* Mode Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentGatewayType('UPI')}
                  className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    paymentGatewayType === 'UPI'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  UPI QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGatewayType('Card')}
                  className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    paymentGatewayType === 'Card'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGatewayType('Net Banking')}
                  className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    paymentGatewayType === 'Net Banking'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  NetBanking
                </button>
              </div>

              {/* UPI QR Code View */}
              {paymentGatewayType === 'UPI' && (
                <div className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-3">
                  <div className="p-3 bg-white rounded-2xl border-2 border-primary/20 shadow-md flex flex-col items-center">
                    {/* SVG QR Code Simulation */}
                    <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center relative">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-900 fill-current">
                        {/* QR Corners */}
                        <rect x="5" y="5" width="25" height="25" rx="3" fill="#1e1e1e" />
                        <rect x="8" y="8" width="19" height="19" rx="2" fill="#ffffff" />
                        <rect x="11" y="11" width="13" height="13" fill="#1e1e1e" />

                        <rect x="70" y="5" width="25" height="25" rx="3" fill="#1e1e1e" />
                        <rect x="73" y="8" width="19" height="19" rx="2" fill="#ffffff" />
                        <rect x="76" y="11" width="13" height="13" fill="#1e1e1e" />

                        <rect x="5" y="70" width="25" height="25" rx="3" fill="#1e1e1e" />
                        <rect x="8" y="73" width="19" height="19" rx="2" fill="#ffffff" />
                        <rect x="11" y="76" width="13" height="13" fill="#1e1e1e" />

                        {/* QR Patterns */}
                        <rect x="36" y="8" width="8" height="8" fill="#1e1e1e" />
                        <rect x="50" y="8" width="8" height="8" fill="#1e1e1e" />
                        <rect x="36" y="22" width="8" height="8" fill="#1e1e1e" />
                        <rect x="50" y="22" width="8" height="8" fill="#1e1e1e" />

                        <rect x="8" y="36" width="8" height="8" fill="#1e1e1e" />
                        <rect x="22" y="36" width="8" height="8" fill="#1e1e1e" />
                        <rect x="8" y="50" width="8" height="8" fill="#1e1e1e" />
                        <rect x="22" y="50" width="8" height="8" fill="#1e1e1e" />

                        <rect x="36" y="36" width="28" height="28" rx="4" fill="#8F4E00" />
                        <rect x="42" y="42" width="16" height="16" rx="2" fill="#ffffff" />
                        <circle cx="50" cy="50" r="5" fill="#8F4E00" />

                        <rect x="70" y="36" width="8" height="8" fill="#1e1e1e" />
                        <rect x="84" y="36" width="8" height="8" fill="#1e1e1e" />
                        <rect x="70" y="50" width="8" height="8" fill="#1e1e1e" />
                        <rect x="84" y="50" width="8" height="8" fill="#1e1e1e" />

                        <rect x="36" y="70" width="8" height="8" fill="#1e1e1e" />
                        <rect x="50" y="70" width="8" height="8" fill="#1e1e1e" />
                        <rect x="36" y="84" width="8" height="8" fill="#1e1e1e" />
                        <rect x="50" y="84" width="8" height="8" fill="#1e1e1e" />

                        <rect x="70" y="70" width="8" height="8" fill="#1e1e1e" />
                        <rect x="84" y="70" width="8" height="8" fill="#1e1e1e" />
                        <rect x="70" y="84" width="8" height="8" fill="#1e1e1e" />
                        <rect x="84" y="84" width="8" height="8" fill="#1e1e1e" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-zinc-700 mt-1">sringeri.math@icici</span>
                  </div>

                  <p className="text-[11px] text-center text-on-surface-variant">
                    Scan with <strong className="text-on-surface">GPay, PhonePe, Paytm, BHIM</strong> to complete seva payment.
                  </p>
                </div>
              )}

              {/* Card Gateway View */}
              {paymentGatewayType === 'Card' && (
                <div className="space-y-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase">Card Number</label>
                    <div className="relative">
                      <CreditCard size={14} className="absolute left-3 top-3 text-primary" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-outline rounded-xl font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase">Valid Thru</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 bg-surface border border-outline rounded-xl font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2 bg-surface border border-outline rounded-xl font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-green-700 font-medium">
                    <ShieldCheck size={14} className="text-green-600" />
                    <span>Protected by 3D-Secure 2.0 OTP verification</span>
                  </div>
                </div>
              )}

              {/* Net Banking View */}
              {paymentGatewayType === 'Net Banking' && (
                <div className="space-y-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block">Select Popular Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Canara Bank', 'Kotak Mahindra'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2 rounded-xl text-xs font-bold border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          selectedBank === b
                            ? 'bg-primary-container/20 border-primary text-primary shadow-xs'
                            : 'bg-surface border-outline-variant/40 text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        <Building size={13} className="shrink-0" />
                        <span className="truncate">{b}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulation Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={simulatePaymentSuccess}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-container hover:from-primary/90 hover:to-primary-container/90 text-on-primary rounded-2xl text-xs font-bold shadow-sacred transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Authenticating & Processing Payment...</span>
                    </>
                  ) : paymentGatewayType === 'UPI' ? (
                    <>
                      <Smartphone size={14} />
                      <span>Simulate Devotee UPI App Approval</span>
                    </>
                  ) : paymentGatewayType === 'Card' ? (
                    <>
                      <ShieldCheck size={14} />
                      <span>Authorize ₹{newBookingForm.amount} via Card</span>
                    </>
                  ) : (
                    <>
                      <Building size={14} />
                      <span>Proceed to {selectedBank} & Authorize</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
