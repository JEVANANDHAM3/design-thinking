'use client'

import React, { useEffect, useState } from "react";
import { Chip } from "@heroui/react";
import { Ticket } from "@gravity-ui/icons";
import TicketCard from "@/components/ticket";
import { useSession } from "next-auth/react";
import Loading from "@/components/loading";
import NotFound from "@/components/notfound";

export default function MyTicket() {
  const [train, setTrains] = useState([])
  const [booking, setBooking] = useState([])
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrian = async () => {
      const query = new URLSearchParams({
        email: session?.user.email
      })
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/my_ticket?' + query.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })
      const data = await res.json()
      console.log(data)
      if (data.ok) {
        setTrains(data.trains)
        setBooking(data.booking)
      }
      setLoading(false)
    }
    if (status === 'authenticated') {
      fetchTrian()
    }
  }, [status])

  return (
    loading ? (
      <Loading />
    ) : (
      <div className="app-shell py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Chip className="border border-blue-200 bg-blue-50 text-blue-800" variant="flat">
              Ticket dashboard
            </Chip>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">My Tickets</h1>
            <p className="mt-1 text-sm text-slate-500">Review every booking, selection result, and payment status in one place.</p>
          </div>
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Ticket className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Bookings</p>
              <p className="text-xl font-semibold text-slate-900">{train.length}</p>
            </div>
          </div>
        </div>

        {train.length === 0 ? (
          <NotFound error={true} message="No tickets found yet." />
        ) : (
          <div className="space-y-5">
            {train.map((t, idx) => (
              <TicketCard key={idx} train={t} booking={booking[idx]} />
            ))}
          </div>
        )}
      </div>
    )
  )
}
