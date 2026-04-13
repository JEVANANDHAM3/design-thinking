'use client'
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Loading from '@/components/loading'
import LotteryDone from '@/components/done'
import { Button } from './ui/button';
import TimerBasic from '@/components/timer';
import { Ticket, Sparkles, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LotteryForm = ({train , second, fn}) => {
  // Mock train details matching the provided database schema
  const trainDetails =train
  const { data : session } = useSession()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    travelClass: 'economy',
    train_number : train.train_number,
  });
  const [btLoading, setBtLoading] = useState(false)


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    setBtLoading(true)
    e.preventDefault();
    const payload = {
      'user_email': session?.user?.email,
      'journey_id': Number(train.journey_id),
      'seat_class': formData.travelClass.toLowerCase(),
      'status':'pending'
    }
    console.log(payload)
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + '/lottery'

    const res = await fetch(url,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.accessToken}`
      },
      body: JSON.stringify(payload)
    })

    const response = await res.json()
    
    if (response.ok){
      setSubmitted(true)
    } else {
      alert('Failed to submit')
    }
    setBtLoading(false)

  };

  useEffect(() => {

    const checkSubmitted = async () => {
      const query = new URLSearchParams({
        email: session?.user?.email,
        journey_id: train.journey_id,
      })
      const url = process.env.NEXT_PUBLIC_BACKEND_URL + '/check_lottery?'+query.toString()
      
      const res = await fetch(url,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
      })
      const response = await res.json()
      if (response.ok){
        setSubmitted(true)
      }
      setLoading(false)
    }
    checkSubmitted()
  },[])

  return (
    loading ? (
      <Loading/>
    ):(
    submitted ? (
      <LotteryDone />
    ) : (
    <div className="relative max-w-3xl mx-auto p-6 space-y-8 min-h-screen font-sans flex flex-col items-center md:pt-16 hover:z-10 z-0">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 -z-10 w-72 h-72 bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-3xl rounded-full opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-56 h-56 bg-gradient-to-tr from-blue-200/40 to-teal-200/40 blur-2xl rounded-full opacity-50 pointer-events-none" />

       {/* Form Section */}
       <div className="w-full bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-white p-8 md:p-10 relative overflow-hidden transition-all duration-500 hover:shadow-indigo-200/50">
         {/* Subtle top border gradient */}
         <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
         
         <div className="flex flex-col items-center justify-center mb-10 pb-8 border-b border-slate-200/60">
           <div className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-indigo-100/50 shadow-sm">
             <Clock size={14} className="animate-pulse duration-1000" />
             <span>Lottery Closes In</span>
           </div>
           <TimerBasic second={second} fn={fn}/>
         </div>

         <div className="mb-10 flex flex-col items-center text-center">
           <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 tracking-tight">Reserve Your Seat</h3>
           <div className="mt-5 flex items-center gap-2.5 text-sm md:text-base font-medium text-slate-600 bg-white shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] px-6 py-2.5 rounded-full border border-slate-100 hover:shadow-[0_4px_20px_-5px_rgba(79,70,229,0.1)] transition-shadow duration-300">
             <span>Join the lottery for train</span>
             <span className="flex items-center justify-center bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md tracking-wider shadow-sm">
               #{trainDetails.train_number}
             </span>
           </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center w-full">
           <div className="w-full max-w-md space-y-5">
             <div className="group relative">
               <label htmlFor="travelClass" className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                 <Ticket size={16} />
                 Travel Class
               </label>
               <Select
                 value={formData.travelClass}
                 onValueChange={(value) => setFormData({ ...formData, travelClass: value })}
               >
                 <SelectTrigger className="w-full pl-5 pr-4 py-6 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer font-semibold text-slate-700 shadow-sm hover:border-slate-200 text-base">
                   <SelectValue placeholder="Select Travel Class" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border border-slate-100 bg-white/95 backdrop-blur-2xl shadow-2xl p-1 z-50">
                   <SelectItem value="economy" className="cursor-pointer font-semibold text-slate-700 focus:bg-indigo-50 focus:text-indigo-700 py-3 px-4 rounded-lg outline-none transition-colors">
                     Economy (₹{trainDetails.fare[0]}) • {trainDetails.seats[0]} left
                   </SelectItem>
                   <SelectItem value="business" className="cursor-pointer font-semibold text-slate-700 focus:bg-indigo-50 focus:text-indigo-700 py-3 px-4 rounded-lg outline-none transition-colors">
                     Business (₹{trainDetails.fare[1]}) • {trainDetails.seats[1]} left
                   </SelectItem>
                   <SelectItem value="first" className="cursor-pointer font-semibold text-slate-700 focus:bg-indigo-50 focus:text-indigo-700 py-3 px-4 rounded-lg outline-none transition-colors">
                     First Class (₹{trainDetails.fare[2]}) • {trainDetails.seats[2]} left
                   </SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>

           <Button
             type="submit"
             disabled={btLoading}
             className="w-full max-w-md mt-6 relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 px-6 rounded-2xl shadow-[0_6px_20px_-6px_rgba(37,99,235,0.5)] hover:shadow-[0_10px_25px_-5px_rgba(37,99,235,0.6)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] group flex justify-center items-center gap-3 border border-blue-500/50"
           >
             <Sparkles size={20} className="text-white/80 group-hover:text-white transition-colors duration-300" />
             <span className="tracking-wide font-bold text-base">Enter Lottery Now</span>
           </Button>
         </form>
       </div>
    </div>
    )
  )
  );
};

export default LotteryForm;
