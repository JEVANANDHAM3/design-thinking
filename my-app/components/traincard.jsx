import React, { useState } from 'react';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Train, Clock, ArrowRight } from 'lucide-react';

const TrainCard = ({ train, bnFunction, bnName, result }) => {
  const [loading, setLoading] = useState(false)
  const [publish, setPublish] = useState(false)
 
  const trainDetails = train
  const name = bnName || 'Book'
  let seat_cost = true
  if (result == 1){
    seat_cost = false
  }

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const handleClick =  async () =>{
    if (result == 1){
      setLoading(true)
    }
    const res =  await bnFunction()
    if (result === 1 && res) {
      setLoading(false)
      setPublish(true)
    }
    if (result === 1 && !res) {
      setLoading(false)
      setPublish(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto my-4 overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 group relative">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row justify-between items-center px-5 py-4 space-y-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
            <Train className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2 truncate">
              <span className="truncate">{trainDetails.train_name}</span>
              <Badge variant="secondary" className="font-mono text-xs text-indigo-700 bg-indigo-50 border-indigo-100 shrink-0">
                {trainDetails.train_number}
              </Badge>
            </CardTitle>
          </div>
        </div>
        {trainDetails.takkal && (
          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 uppercase tracking-widest text-[10px] shrink-0 font-bold ml-2">
            Tatkal
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Journey Section */}
          <div className="flex-1 w-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            {/* Departure */}
            <div className="text-left min-w-0">
              <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{trainDetails.departure_time}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 mt-1 truncate">{trainDetails.from_station}</div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 truncate">{trainDetails.departure_date}</div>
            </div>

            {/* Duration/Route Line */}
            <div className="flex flex-col items-center justify-center px-2 sm:px-4 w-28 sm:w-36 shrink-0">
              <Badge variant="secondary" className="text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 border-none mb-2.5 flex items-center gap-1.5 px-2 py-0.5">
                <Clock className="w-3 h-3" />
                {formatDuration(trainDetails.duration)}
              </Badge>
              <div className="w-full flex items-center relative">
                <div className="w-2 h-2 rounded-full border-2 border-indigo-300 bg-white shrink-0 z-10" />
                <div className="flex-1 border-t-2 border-dotted border-slate-300" />
                <div className="w-2 h-2 rounded-full border-2 border-indigo-300 bg-white shrink-0 z-10" />
                <ArrowRight className="absolute left-1/2 -translate-x-1/2 w-4 h-4 text-slate-300" />
              </div>
            </div>

            {/* Arrival */}
            <div className="text-right min-w-0">
              <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{trainDetails.arrival_time}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 mt-1 truncate">{trainDetails.to_station}</div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 truncate">{trainDetails.arrival_date || "Same Day"}</div>
            </div>
          </div>

          {/* Action Section */}
          <div className="w-full md:w-auto flex flex-col items-center md:items-end md:pl-6 md:border-l border-slate-100 gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0">
            {seat_cost && (
              <div className="text-center md:text-right w-full">
                <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Starts from</span>
                <span className="text-2xl font-black text-indigo-600">₹{Math.min(...trainDetails.fare)}</span>
              </div>
            )}

            <div className="w-full md:w-auto mt-1">
              {publish ? (
                <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-lg border border-emerald-100 text-center shadow-sm">
                  Published Successfully
                </div>
              ) : result !== 1 ? (
                trainDetails.published ? (
                    <div className="text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 mt-1 rounded-lg border border-slate-200 text-center shadow-sm w-full md:w-32 h-10 flex items-center justify-center">
                        Lottery Closed
                    </div>
                ) : (
                    <Button className="w-full md:w-32 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all font-bold h-10 mt-1" onClick={handleClick}>
                    {name}
                    </Button>
                )
              ) : (
                <Button 
                  className="w-full md:w-32 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all font-bold h-10" 
                  onClick={handleClick} 
                  disabled={loading}
                >
                  {loading && <Spinner className="mr-2 h-4 w-4" />}
                  {loading ? 'Publishing...' : 'Publish'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {seat_cost && (
        <CardFooter className="bg-slate-50/70 p-0 border-t border-slate-100/80">
          <div className="w-full grid grid-cols-3 divide-x divide-slate-100/80">
            {[
              { name: 'Economy', price: trainDetails.fare[0], seats: trainDetails.seats[0] },
              { name: 'Business', price: trainDetails.fare[1], seats: trainDetails.seats[1] },
              { name: 'First Class', price: trainDetails.fare[2], seats: trainDetails.seats[2] },
            ].map((cls, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-3 sm:py-4 transition-colors cursor-pointer hover:bg-white/90">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1">{cls.name}</span>
                <span className="text-sm sm:text-base font-bold text-slate-800">₹{cls.price}</span>
                <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold mt-1 sm:mt-1.5 flex items-center before:content-[''] before:w-1.5 before:h-1.5 before:bg-emerald-400 before:rounded-full before:mr-1.5">
                  {cls.seats} Available
                </span>
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default TrainCard;
