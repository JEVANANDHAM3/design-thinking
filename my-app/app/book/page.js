'use client'
import React, { use, useEffect } from 'react'

import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import LotteryForm from '@/components/lotteryform'
import NotFound from '@/components/notfound'
import Loading from '@/components/loading'
import { useRouter } from 'next/navigation'
import WindowOpening from '@/components/opening'
import WindowClosed from '@/components/closed'
import { preconnect } from 'react-dom'
import { da } from 'date-fns/locale'


const page = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const journey_id = searchParams.get('journey_id')
  const from_station = searchParams.get('from_station')
  const to_station = searchParams.get('to_station')

  const { data: session, status: authStatus } = useSession()

  const [hasTrain, setHasTrain] = useState(false)
  const [loading, setLoading] = useState(true)
  const [train, setTrain] = useState(null)

  const [opening, setOpening] = useState(null)
  const [seconds, setSeconds] = useState(null)
  const [res, setRes] = useState(null)

  // Stable fetch function
  const fetchData = async () => {
    if (!journey_id || authStatus !== 'authenticated') return

    try {
      const query = new URLSearchParams({
        journey_id: journey_id,
        from_station: from_station || '',
        to_station: to_station || ''
      })

      // Fetch Train Details
      const trainUrl = process.env.NEXT_PUBLIC_BACKEND_URL + `/one_train?${query.toString()}`
      const trainRes = await fetch(trainUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })
      const trainData = await trainRes.json()

      if (trainData.ok) {
        trainData.train.journey_id = journey_id
        setTrain(trainData.train)
        setHasTrain(true)
      } else {
        setHasTrain(false)
      }

      // Fetch Lottery Timing
      const timeUrl = process.env.NEXT_PUBLIC_BACKEND_URL + `/get_time?${new URLSearchParams({ journey_id }).toString()}`
      const timeRes = await fetch(timeUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })
      const timeData = await timeRes.json()

      if (timeData.ok) {
        setOpening(timeData.status)
        setRes(timeData)
        if (timeData.status === 'opening' || timeData.status === 'open') {
          setSeconds(timeData.seconds)
        }
      }
    } catch (err) {
      console.error("Failed to fetch booking page data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchData()
    } else if (authStatus === 'unauthenticated') {
      setLoading(false)
    }
  }, [authStatus, journey_id])

  if (loading) return <div className="p-3"><Loading /></div>

  if (!hasTrain) return <div className="p-3"><NotFound /></div>

  return (
    <div className='p-3'>
      {opening === 'opening' ? (
        <WindowOpening second={seconds} fn={fetchData} />
      ) : opening === 'closed' ? (
        <WindowClosed />
      ) : opening === 'open' ? (
        <LotteryForm train={train} second={seconds} fn={fetchData} />
      ) : (
        <Loading />
      )}
    </div>
  )
}

export default page