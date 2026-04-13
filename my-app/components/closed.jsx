import React from 'react';
import { XOctagon, Clock, CalendarX2 } from 'lucide-react';

const WindowClosed = ({
  title = "Booking Window Closed",
  message = "The booking window for this session has officially ended. Please check back later for future availability."
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto my-12 relative flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden bg-white/70 backdrop-blur-xl border border-rose-100 rounded-3xl shadow-2xl shadow-rose-900/10 hover:shadow-rose-900/20 transition-all duration-500 ease-out group">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        
        {/* Animated Icon Container */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-20" />
          <div className="relative p-5 bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 shadow-sm rounded-full">
            <CalendarX2 className="w-12 h-12 text-rose-600 drop-shadow-sm" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-3 max-w-md">
          <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-orange-600 tracking-tight">
            {title}
          </h2>
          <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Footer/Action area */}
        <div className="pt-4 flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-rose-100/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
          <Clock className="w-4 h-4" />
          <span>Next session opens soon</span>
        </div>
      </div>
    </div>
  );
};

export default WindowClosed;
