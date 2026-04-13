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


const page =  () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const journey_id = searchParams.get('journey_id')
  const from_station = searchParams.get('from_station')
  const to_station = searchParams.get('to_station')

  const { data : session } = useSession()

  const [status, setStatus] = useState(false)
  const [loading,setLoading] = useState(true)
  const [train, setTrain] = useState(null)

  const [opening, setOpening] = useState(null)
  const [seconds, setSeconds] = useState(null)
  const [res, setRes] = useState(null)

  useEffect(() => {
    const query = new URLSearchParams({
      journey_id: journey_id,
      from_station: from_station,
      to_station: to_station
    })

    const url = process.env.NEXT_PUBLIC_BACKEND_URL + `/one_train?${query.toString()}`


    const fetchtrain = async () =>{
      const response = await fetch(
        url,{
          headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`
          }
        }
      )
      const data = await response.json()

      if (data.ok){
        data.train.journey_id = journey_id
        setTrain(data.train)
        setStatus(true)
      }
    }

    fetchtrain()

  },[])


  useEffect(() => {
    if (!journey_id) return

    const fetchTime = async () => {
      const query = new URLSearchParams({
        journey_id: journey_id,
      })
      const url = process.env.NEXT_PUBLIC_BACKEND_URL + `/get_time?${query.toString()}`
      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`
          }
        })
        const data = await response.json()
        console.log(data)
        if (data.ok) {
          setOpening(data.status)
          setRes(data)
        }

      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchTime()
  }, [opening,journey_id])

  useEffect(()=>{
    if (opening === 'opening' || opening === 'open'){
      setSeconds(res.seconds)
    }
  },[opening])

    const fetchTime = async () => {
      const query = new URLSearchParams({
        journey_id: journey_id,
      })
      const url = process.env.NEXT_PUBLIC_BACKEND_URL + `/get_time?${query.toString()}`
      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`
          }
        })
        const data = await response.json()
        console.log(data)
        if (data.ok) {
          setOpening(data.status)
          setRes(data)
        }

      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }

  return (
    <div className='p-3'>
      {
        loading ? (
          <Loading/>
        ) :
      status ? (
        opening === 'opening' ? (
          <WindowOpening second={seconds} fn={fetchTime}/>
        ):(
          opening === 'closed'? (
            <WindowClosed/>
          ):(
            <LotteryForm train={train} second={seconds} fn={fetchTime}/>
          )
        )
      ) :
      (
        <NotFound/>
      )
    }
    </div>
  )
}

export default page