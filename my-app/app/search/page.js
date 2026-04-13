"use client";

import { redirect } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Magnifier, Ticket } from "@gravity-ui/icons";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Home() {
  const [formData, setFormData] = useState({
    from_station: "",
    to_station: "",
    date: new Date(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date: date || new Date(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = { ...formData };
    if (urlParams.date) {
      urlParams.date = format(urlParams.date, "yyyy-MM-dd");
    }
    const url = new URLSearchParams(urlParams).toString();
    redirect(`/train?${url}`);
  };

  return (
    <div className="app-shell py-8 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Magnifier className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Find your train</h2>
            <p className="text-sm text-slate-500">Search by station pair and continue to booking.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="from_station" className="mb-2 block text-sm font-medium text-slate-700">
                From
              </label>
              <input
                type="text"
                id="from_station"
                name="from_station"
                value={formData.from_station}
                onChange={handleChange}
                placeholder="Departure station"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
                required
              />
            </div>

            <div>
              <label htmlFor="to_station" className="mb-2 block text-sm font-medium text-slate-700">
                To
              </label>
              <input
                type="text"
                id="to_station"
                name="to_station"
                value={formData.to_station}
                onChange={handleChange}
                placeholder="Arrival station"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal rounded-2xl border-slate-200 bg-slate-50 px-4 py-6 text-slate-900 outline-none transition hover:border-blue-500 hover:bg-white hover:ring-4 hover:ring-blue-500/15 ${
                      !formData.date && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5 text-slate-400" />
                    {formData.date ? format(formData.date, "PPP") : <span className="text-slate-400">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between mt-6">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <Ticket className="size-4" />
              </div>
              Search results keep the existing booking flow intact.
            </div>
            <Button
              type="submit"
              className="h-12 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
            >
              Search Trains
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
