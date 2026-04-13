"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { 
  Train, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Timer, 
  AlertCircle, 
  CheckCircle2, 
  Ticket, 
  IndianRupee, 
  Map, 
  ArrowRight
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DatePickerField = ({ label, name, value, onChange }) => (
  <div className="flex flex-col gap-2 space-y-1">
    <Label className="text-sm font-semibold text-slate-700">{label}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-medium w-full rounded-xl transition-all h-12 shadow-sm border-slate-200 bg-white hover:bg-slate-50",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-3 h-5 w-5 text-blue-500" />
          {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden shadow-2xl border-slate-100" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          onSelect={(date) => onChange(name, date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  </div>
);

const TimePickerField = ({ label, name, value, onChange, required = false }) => (
  <div className="flex flex-col gap-2 space-y-1">
    <Label htmlFor={name} className="text-sm font-semibold text-slate-700">{label}</Label>
    <Input
      type="time"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="h-12 w-full rounded-xl border-slate-200 bg-white font-medium shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-800"
    />
  </div>
);

const InputField = ({ label, name, value, onChange, placeholder, icon: Icon, type = "text" }) => (
  <div className="flex flex-col gap-2 space-y-1">
    <Label htmlFor={name} className="text-sm font-semibold text-slate-700">{label}</Label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-3.5 top-3.5 h-5 w-5 text-blue-500 transition-colors pointer-events-none" />}
      <Input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className={cn(
          "h-12 rounded-xl border-slate-200 bg-white font-medium shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent text-slate-800",
          Icon ? "pl-11" : "pl-4"
        )}
      />
    </div>
  </div>
);

export default function AddTrain() {
  const { data: session } = useSession();
  const formatTime = (t) => `${t}:00`;  
  const [train, setTrain] = useState({
    train_number: "",
    train_name: "",
    from_station: "",
    to_station: "",
    departure_date: "",
    departure_time: "",
    arrival_date: "",
    arrival_time: "",
    duration: "",
    takkal: false,
    opening_date: "",
    opening_time: "",
    closing_date: "",
    closing_time: "",
    classes: {
      economy: { seats: 0, fare: 0 },
      business: { seats: 0, fare: 0 },
      first: { seats: 0, fare: 0 }
    }
  });

  const [notification, setNotification] = useState(null);

  const validateTakkal = () => {
    return true
    if (!train.takkal) return true;

    const errors = [];
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Check opening_time > now + 2 hours
    if (train.opening_date && train.opening_time) {
      const openingDateTime = new Date(`${train.opening_date}T${train.opening_time}`);
      if (openingDateTime <= twoHoursFromNow) {
        errors.push("Opening time must be at least 2 hours from now");
      }
    } else if (train.takkal && (!train.opening_date || !train.opening_time)) {
      errors.push("Opening date and time are required for Takkal");
    }

    // Check opening_date < closing_date
    if (train.opening_date <= train.closing_date) {
      if (train.opening_date >= train.closing_date) {
        errors.push("Opening date must be before closing date");
      }
    } else if (train.takkal && (!train.closing_date || !train.opening_date)) {
      errors.push("Closing date is required for Takkal");
    }

    // Check opening_time < closing_time (only if same date)
    if (train.opening_date === train.closing_date && train.opening_time && train.closing_time) {
      if (train.opening_time >= train.closing_time) {
        errors.push("Opening time must be before closing time");
      }
    } else if (train.takkal && (!train.closing_time || !train.opening_time)) {
      errors.push("Closing time is required for Takkal");
    }

    if (errors.length > 0) {
      setNotification({
        type: "error",
        title: "Validation Error",
        message: errors.join(" | ")
      });
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTrain((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (notification) setNotification(null);
  };

  const handleDateChange = (name, date) => {
    setTrain((prev) => ({
      ...prev,
      [name]: date ? format(date, "yyyy-MM-dd") : ""
    }));
    if (notification) setNotification(null);
  };

  const handleCheckboxChange = (name, checked) => {
    setTrain((prev) => ({
      ...prev,
      [name]: checked
    }));
    if (notification) setNotification(null);
  };

  const handleClassField = (className, field, value) => {
    if (isNaN(value)) return;
    setTrain((prev) => ({
      ...prev,
      classes: {
        ...prev.classes,
        [className]: {
          ...prev.classes[className],
          [field]:  Number(value) 
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateTakkal()) {
      return;
    }

    const url = process.env.NEXT_PUBLIC_BACKEND_URL+'/add_train'
    
    // Transform frontend format to backend schema
    const payload = {
      train_number: Number(train.train_number),
      train_name: train.train_name,
      from_station: train.from_station,
      to_station: train.to_station,
      departure_date: train.departure_date,
      departure_time: train.departure_time,
      arrival_date: train.arrival_date,
      arrival_time: train.arrival_time,
      duration: Number(train.duration),
      takkal: train.takkal,
      opening_date: train.opening_date,
      opening_time: formatTime(train.opening_time),
      closing_date: train.closing_date,
      closing_time: formatTime(train.closing_time),
      seats: [train.classes.economy.seats, train.classes.business.seats, train.classes.first.seats],
      fare: [train.classes.economy.fare, train.classes.business.fare, train.classes.first.fare]
    }

    try {
      const response = await fetch(url,{
        method: "POST",
        headers:{
          'Content-Type':'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body:JSON.stringify(payload)
      });
      console.log(response);
      setNotification({
        type: "success",
        title: "Success",
        message: "Train added successfully!"
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: "error",
        title: "Submission Error",
        message: "Failed to add train. Check connection."
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl shadow-blue-500/10 mb-4 border border-blue-100">
            <Train className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Add New Route</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Configure train details, schedules, and class seating visually</p>
        </div>

        {notification && (
          <Alert className={cn(
            "mb-8 border-none text-white shadow-lg animate-in fade-in slide-in-from-top-4",
            notification.type === "error" ? "bg-red-500" : "bg-emerald-500"
          )}>
            {notification.type === "error" ? <AlertCircle className="h-5 w-5 text-white" /> : <CheckCircle2 className="h-5 w-5 text-white" />}
            <AlertTitle className="font-bold text-lg">{notification.title}</AlertTitle>
            <AlertDescription className="text-white/90 font-medium">
              {notification.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity Section */}
          <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl ring-1 ring-slate-200 overflow-hidden rounded-2xl">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-600/20">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Train Identity</h3>
            </div>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputField label="Train Number" name="train_number" value={train.train_number} onChange={handleChange} icon={Ticket} placeholder="e.g. 12045" />
              <InputField label="Train Name" name="train_name" value={train.train_name} onChange={handleChange} icon={Train} placeholder="e.g. Shatabdi Express" />
            </CardContent>
          </Card>

          {/* Route Section */}
          <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl ring-1 ring-slate-200 overflow-hidden rounded-2xl">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-600/20">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Route & Stations</h3>
            </div>
            <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full">
                <InputField label="From Station" name="from_station" value={train.from_station} onChange={handleChange} icon={MapPin} placeholder="Origin Station" />
              </div>
              <div className="hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 mt-6 border border-slate-200 text-slate-400">
                <ArrowRight className="w-6 h-6" />
              </div>
              <div className="w-full">
                <InputField label="To Station" name="to_station" value={train.to_station} onChange={handleChange} icon={MapPin} placeholder="Destination Station" />
              </div>
            </CardContent>
          </Card>

          {/* Schedule Section */}
          <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl ring-1 ring-slate-200 overflow-hidden rounded-2xl">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-md shadow-emerald-600/20">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Schedule Details</h3>
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                <DatePickerField label="Departure Date" name="departure_date" value={train.departure_date} onChange={handleDateChange} />
                <TimePickerField label="Departure Time" name="departure_time" value={train.departure_time} onChange={handleChange} required />
                <DatePickerField label="Arrival Date" name="arrival_date" value={train.arrival_date} onChange={handleDateChange} />
                <TimePickerField label="Arrival Time" name="arrival_time" value={train.arrival_time} onChange={handleChange} required />
              </div>
              <div className="max-w-sm">
                <InputField label="Total Duration" name="duration" value={train.duration} onChange={handleChange} icon={Timer} placeholder="e.g., 5h 30m" />
              </div>
            </CardContent>
          </Card>

          {/* Takkal Section */}
          <Card className={cn(
            "border-0 shadow-xl overflow-hidden rounded-2xl transition-all duration-300 ring-1",
            train.takkal ? "bg-blue-50/50 ring-blue-200 shadow-blue-200/40" : "bg-white/80 ring-slate-200 shadow-slate-200/40"
          )}>
            <div className={cn(
              "px-8 py-5 border-b flex items-center gap-4 transition-colors",
              train.takkal ? "bg-blue-100/50 border-blue-100" : "bg-gradient-to-r from-orange-50 to-amber-50/50 border-slate-100"
            )}>
              <div className={cn(
                "p-2 rounded-lg text-white shadow-md transition-colors",
                train.takkal ? "bg-blue-600 shadow-blue-600/20" : "bg-orange-500 shadow-orange-500/20"
              )}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Takkal Configuration</h3>
                <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                  <Checkbox 
                    id="takkal" 
                    checked={train.takkal} 
                    onCheckedChange={(c) => handleCheckboxChange("takkal", c)}
                    className="h-5 w-5 rounded-md data-[state=checked]:bg-blue-600 data-[state=checked]:text-white border-slate-300"
                  />
                  <Label htmlFor="takkal" className="text-sm font-bold text-slate-700 cursor-pointer select-none">Enable Takkal Quota</Label>
                </div>
              </div>
            </div>
            
            {train.takkal && (
              <CardContent className="p-8 animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                  <DatePickerField label="Opening Date" name="opening_date" value={train.opening_date} onChange={handleDateChange} />
                  <TimePickerField label="Opening Time" name="opening_time" value={train.opening_time} onChange={handleChange} />
                  <DatePickerField label="Closing Date" name="closing_date" value={train.closing_date} onChange={handleDateChange} />
                  <TimePickerField label="Closing Time" name="closing_time" value={train.closing_time} onChange={handleChange} />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Classes Section */}
          <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl ring-1 ring-slate-200 overflow-hidden rounded-2xl">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-slate-800 p-2 rounded-lg text-white shadow-md">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Class Configurations</h3>
            </div>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4 pb-4 border-b border-slate-100 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <div>Class Type</div>
                  <div>Available Seats</div>
                  <div>Fare per Seat (₹)</div>
                </div>
                {Object.entries(train.classes).map(([classKey, classInfo]) => (
                  <div key={classKey} className="grid grid-cols-[1.5fr_1fr_1fr] gap-4 items-center">
                    <div className="font-bold text-slate-700 capitalize flex items-center gap-2 text-lg">
                        {classKey}
                    </div>
                    <div>
                      <Input
                        id={`${classKey}-seats`}
                        value={classInfo.seats}
                        onChange={(e) => handleClassField(classKey, "seats", e.target.value)}
                        className="h-11 rounded-lg border-slate-200 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 font-medium"
                        placeholder="0"
                      />
                    </div>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id={`${classKey}-fare`}
                        value={classInfo.fare}
                        onChange={(e) => handleClassField(classKey, "fare", e.target.value)}
                        className="pl-9 h-11 rounded-lg border-slate-200 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 font-medium"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
          >
            Publish New Train
          </Button>
        </form>

        <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
          <Card className="border border-slate-200 bg-slate-50/50 shadow-none">
            <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Dev Preview</h2>
            </div>
            <CardContent className="p-0">
              <pre className="text-[11px] text-slate-500 p-6 overflow-auto max-h-60 rounded-b-xl">
                {JSON.stringify(train, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

