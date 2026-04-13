import React from 'react';
import { Hourglass } from 'lucide-react';
import TimerBasic from '@/components/timer';

const WindowOpening = ({
  title = "Booking Window Opens Soon",
  message = "Hold tight! The lottery window for this train will open shortly.",
  second,
  fn
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto my-12 relative flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden bg-white/70 backdrop-blur-xl border border-indigo-100 rounded-3xl shadow-2xl shadow-indigo-900/10 hover:shadow-indigo-900/20 transition-all duration-500 ease-out group z-0">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        
        {/* Animated Icon Container */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-30" />
          <div className="relative p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 shadow-sm rounded-full">
            <Hourglass className="w-12 h-12 text-indigo-600 drop-shadow-sm animate-[spin_4s_ease-in-out_infinite]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-3 max-w-md">
          <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-600 tracking-tight">
            {title}
          </h2>
          <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* The Timer Wrapper */}
        <div className="bg-white/80 border border-slate-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] rounded-2xl px-8 py-5 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Window opens in</span>
          <TimerBasic second={second} fn={fn}/>
        </div>
        
      </div>
    </div>
  );
};

export default WindowOpening;
