'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CalendarDays, Ticket, Sparkles, Shield, CreditCard, AlertTriangle, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Premium Ticket Card Component
 * Displays booking info with payment status, countdown timer, and action buttons.
 * 
 * statuses: 'pending' | 'selected' | 'notselected' | 'payment_pending' | 'confirmed' | 'payment_failed' | 'expired'
 */
const TicketCard = ({ train, booking }) => {
  const router = useRouter();
  const {
    train_number,
    train_name,
    from_station,
    to_station,
    departure_time,
    departure_date,
    arrival_time,
    arrival_date,
    takkal,
    duration,
  } = train;

  const { id, status, seat_class, paid, selected_at } = booking;

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const handlePayClick = (bookingId) => {
    const query = new URLSearchParams({ bookingId: bookingId });
    router.push(`/pay?${query.toString()}`);
  };

  // ─── Countdown Timer ───
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!selected_at) return;
    if (!['selected', 'payment_pending', 'payment_failed'].includes(status)) return;

    const selectedTime = new Date(selected_at);
    const expiryTime = new Date(selectedTime.getTime() + 5 * 60 * 1000);

    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [selected_at, status]);

  const formatCountdown = (seconds) => {
    if (seconds === null || seconds === undefined) return '5:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isExpiringSoon = timeLeft !== null && timeLeft < 60;

  // ─── Status Configuration ───
  const statusConfig = {
    pending: {
      label: 'Pending',
      badge: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm ring-1 ring-amber-500/20',
      bar: 'bg-gradient-to-r from-amber-300 to-amber-500',
      icon: '⏳',
    },
    selected: {
      label: 'Pay Now',
      badge: 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm ring-1 ring-blue-500/20',
      bar: 'bg-gradient-to-r from-blue-400 to-indigo-500',
      icon: '🎉',
    },
    notselected: {
      label: 'Not Selected',
      badge: 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm ring-1 ring-rose-500/20',
      bar: 'bg-gradient-to-r from-rose-400 to-red-500',
      icon: '❌',
    },
    payment_pending: {
      label: 'Payment Pending',
      badge: 'bg-violet-50 text-violet-700 border-violet-200 shadow-sm ring-1 ring-violet-500/20',
      bar: 'bg-gradient-to-r from-violet-400 to-purple-500',
      icon: '💳',
    },
    confirmed: {
      label: 'Confirmed',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm ring-1 ring-emerald-500/20',
      bar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      icon: '✅',
    },
    payment_failed: {
      label: 'Payment Failed',
      badge: 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm ring-1 ring-orange-500/20',
      bar: 'bg-gradient-to-r from-orange-400 to-red-500',
      icon: '⚠️',
    },
    expired: {
      label: 'Expired',
      badge: 'bg-gray-50 text-gray-600 border-gray-200 shadow-sm ring-1 ring-gray-400/20',
      bar: 'bg-gradient-to-r from-gray-300 to-gray-500',
      icon: '⏰',
    },
  };

  const seatClassLabel = {
    economy: 'Economy',
    business: 'Business',
    first: 'First Class',
  };

  const cfg = statusConfig[status] ?? statusConfig.pending;

  // Determine if we should show payment actions
  const showPayButton = ['selected', 'payment_pending', 'payment_failed'].includes(status) && !paid;
  const showCountdown = showPayButton && timeLeft !== null && timeLeft > 0;

  return (
    <div className="group relative bg-white rounded-3xl shadow-xl shadow-indigo-100/40 border border-indigo-50/80 overflow-hidden w-full max-w-3xl mx-auto my-6 font-sans hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out z-0">
      {/* Decorative gradient blur background inside the card */}
      <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute bottom-0 left-0 -z-10 w-48 h-48 bg-gradient-to-tr from-blue-100/40 to-teal-100/40 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Top Status Bar Gradient */}
      <div className={`h-1.5 w-full ${cfg.bar}`} />

      {/* Header Section */}
      <div className="px-5 py-4 sm:px-6 sm:py-5 flex gap-3 justify-between items-center bg-white/40 backdrop-blur-sm border-b border-indigo-50/50">
        <div className="flex items-center gap-3 truncate">
          <div className="p-2 bg-indigo-50 rounded-xl shadow-sm border border-indigo-100/50 shrink-0">
            <Ticket className="text-indigo-600" size={18} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate leading-tight">
              {train_name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-indigo-600 text-[10px] sm:text-xs font-bold tracking-wider">
                #{train_number}
              </span>
              {takkal && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-orange-100 text-orange-800 px-2 py-0.5 text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-widest border border-orange-200/50 shadow-sm shrink-0">
                  <Sparkles size={10} className="text-orange-600" />
                  Tatkal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.badge} shrink-0 backdrop-blur-md transition-all`}
        >
          <span>{cfg.icon}</span>
          {cfg.label}
        </span>
      </div>

      {/* Journey Section (Body) */}
      <div className="px-5 py-6 sm:px-8 sm:py-8 flex flex-row items-center justify-between gap-4">
        {/* Departure */}
        <div className="flex flex-col items-start text-left shrink-0">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums tracking-tighter">
            {departure_time}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">
            {from_station}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-indigo-600 mt-1 bg-indigo-50 px-2 py-0.5 rounded-md">
            {departure_date}
          </span>
        </div>

        {/* Duration / Visual Connector */}
        <div className="flex flex-col items-center justify-center space-y-2.5 flex-1 px-4 sm:px-8">
          <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200/80 shadow-sm shadow-slate-100 px-3 py-1 rounded-full whitespace-nowrap z-10 transition-transform hover:scale-105">
            {formatDuration(duration)}
          </span>
          <div className="w-full flex items-center relative overflow-visible py-2">
            <div className="h-2.5 w-2.5 rounded-full border-2 border-indigo-500 bg-white shadow-[0_0_8px_rgba(99,102,241,0.4)] z-10 shrink-0 ring-4 ring-indigo-50" />
            <div className="flex-1 border-t-2 border-dashed border-indigo-200 mx-1 group-hover:border-indigo-400 transition-colors duration-500" />
            <div className="h-2.5 w-2.5 rounded-full border-2 border-indigo-500 bg-white shadow-[0_0_8px_rgba(99,102,241,0.4)] z-10 shrink-0 ring-4 ring-indigo-50" />
            <div className="absolute inset-0 flex justify-center items-center">
              <span className="text-lg sm:text-xl drop-shadow-md opacity-70 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 ease-in-out">
                🚂
              </span>
            </div>
          </div>
        </div>

        {/* Arrival */}
        <div className="flex flex-col items-end text-right shrink-0">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums tracking-tighter">
            {arrival_time}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">
            {to_station}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-indigo-600 mt-1 bg-indigo-50 px-2 py-0.5 rounded-md">
            {arrival_date ?? 'Same Day'}
          </span>
        </div>
      </div>

      {/* Bottom Footer Section: Booking Details + Payment Actions */}
      <div className="bg-slate-50/50 backdrop-blur-md border-t border-slate-100 px-5 py-4 flex flex-wrap justify-between gap-4 items-center">
        <div className="flex gap-8 sm:gap-12">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              Booking Ref
            </span>
            <span className="text-sm font-black text-slate-800 tabular-nums tracking-wide">#{id}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Class
            </span>
            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {seatClassLabel[seat_class] ?? seat_class}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* ─── CONFIRMED (Paid) ─── */}
          {(status === 'confirmed' || (status === 'selected' && paid)) && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span className="text-xs font-extrabold text-emerald-700">Confirmed & Paid</span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/10 rounded-full px-2 py-1">
                <Shield size={12} className="text-emerald-600" />
                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Secure</span>
              </div>
            </div>
          )}

          {/* ─── EXPIRED ─── */}
          {status === 'expired' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-300/60 rounded-full px-3 py-1.5">
                <XCircle size={14} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-600">Payment Window Expired</span>
              </div>
            </div>
          )}

          {/* ─── SHOW PAY BUTTON ─── */}
          {showPayButton && (
            <div className="flex flex-col items-end gap-2">
              {/* Countdown Timer */}
              {showCountdown && (
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  isExpiringSoon 
                    ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <Timer size={12} />
                  <span>{formatCountdown(timeLeft)} left</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                {status === 'payment_failed' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                    <AlertTriangle size={10} />
                    Failed
                  </span>
                )}
                <button
                  onClick={() => handlePayClick(id)}
                  id={`pay-btn-${id}`}
                  className="group/btn relative overflow-hidden bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold py-2 px-5 rounded-xl shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 transition-all duration-200 ease-out active:scale-95 flex items-center gap-2"
                >
                  <CreditCard size={14} className="relative z-10" />
                  <span className="relative z-10">{status === 'payment_failed' ? 'Retry Payment' : 'Pay Now'}</span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
