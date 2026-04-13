'use client'

import React from 'react'
import { useSearchParams, redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Loading from '@/components/loading'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Chip } from '@heroui/react'
import { CircleCheckFill, CircleInfo, CreditCard, Ticket } from '@gravity-ui/icons'

const page = () => {
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [loading, setLoading] = React.useState(true)
  const [booking, setBooking] = React.useState('error')
  const [btloading, setBtLoading] = React.useState(false)

  const bookingId = searchParams.get('bookingId')

  const handelClick = async () => {
    setBtLoading(true)
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + '/pay'
    const payload = {
      bookingId: Number(bookingId)
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.accessToken}`
      },
      body: JSON.stringify(payload)
    })
    const data = await response.json()
    if (data.ok) {
      redirect('/my_ticket')
    } else {
      alert('payment failed')
    }
    setBtLoading(false)
  }

  useEffect(() => {
    const fetchBookingDetails = async () => {
      const query = new URLSearchParams({
        bookingId: bookingId,
      }).toString();
      const url = process.env.NEXT_PUBLIC_BACKEND_URL + '/booking?' + query
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
      })
      const data = await response.json()
      if (data.ok) {
        setBooking(data)
        console.log(data)
      } else {
        alert('failed to fetch booking details')
      }
      setLoading(false)
    }
    if (status === 'authenticated') {
      fetchBookingDetails()
    }
  }, [status])

  return (
    loading ? (
      <Loading />
    ) : (
      booking === 'error' ? (
        <div className="app-shell flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
          <CircleInfo className="size-14 text-rose-500" />
          <h1 className="text-2xl font-bold text-rose-600">Error</h1>
          <p className="text-lg text-slate-600">Failed to load booking details. Please try again.</p>
        </div>
      ) : (
        booking.status !== 'selected' ? (
          <div className="app-shell flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
            <div className="mb-2 rounded-full bg-amber-100 p-6 text-amber-600">
              <CircleInfo className="size-16" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Not Selected</h1>
            <p className="max-w-md text-center text-lg text-slate-600">
              You have not been selected for this train ticket. Check back later or try another train.
            </p>
          </div>
        ) : (
          booking.paid ? (
            <div className="app-shell flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
              <div className="mb-2 rounded-full bg-emerald-100 p-6 text-emerald-600">
                <CircleCheckFill className="size-16" />
              </div>
              <h1 className="text-3xl font-black text-slate-800">Ticket Paid</h1>
              <p className="max-w-md text-center text-lg text-slate-600">
                Your payment was successful. You have paid for the ticket.
              </p>
            </div>
          ) : (
            <div className="app-shell flex min-h-[75vh] items-center justify-center py-8">
              <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
                <Chip className="border border-blue-200 bg-blue-50 text-blue-700" variant="flat">
                  Payment required
                </Chip>
                <div className="text-center">
                  <h1 className="mb-2 text-2xl font-extrabold text-slate-800">Complete Payment</h1>
                  <p className="text-slate-500">You have been selected! Please pay to confirm your seat.</p>
                </div>

                <div className="w-full space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Booking ID</span>
                    <span className="font-mono font-bold text-slate-700">#{bookingId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Status</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <Ticket className="size-3.5" />
                      Selected
                    </span>
                  </div>
                </div>

                <Button
                  className="h-12 w-full rounded-full bg-slate-950 text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-slate-800 active:scale-95"
                  onClick={handelClick}
                  disabled={btloading}
                >
                  {btloading && <Spinner data-icon='inline-start' />}
                  <CreditCard className="size-4" />
                  Pay Now
                </Button>
              </div>
            </div>
          )
        )
      )
    )
  )
}

export default page
