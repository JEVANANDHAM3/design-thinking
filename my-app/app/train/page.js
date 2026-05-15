'use client';

import { redirect, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Loading from "@/components/loading"
import TrainCard from "@/components/traincard";
import NotFound from "@/components/notfound";
import { useSession } from "next-auth/react";
import { Truck } from "lucide-react";


import { Suspense } from "react"

function SearchTrainContent() {
    const { data: session, status } = useSession()
    const searchParams = useSearchParams()
    const [trainResults, setTrainResults] = useState([]);

    const from = searchParams.get('from_station')
    const to = searchParams.get('to_station')
    const date = searchParams.get('date')  
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!from || !to ) {
            setTrainResults([])
            setLoading(false)
            return
        }

        const fetchTrains = async () => {
            setLoading(true)
            try {
                const url = new URLSearchParams({
                    from_station: from,
                    to_station: to,
                    date: date
                })
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get_trains?${url.toString()}`, {
                  headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                  }
                })
                const data = await res.json()
                if (data.ok) {
                    setTrainResults(data.journeys)
                    console.log(data)
                } else {
                    setTrainResults([])
                }
            } catch (error) {
                console.error('Failed to load train results', error)
                setTrainResults([])
            }
            setLoading(false)
        }
        
        if (status === 'authenticated'){
            fetchTrains()
        }
    
    }, [ from, status, to, date])

    const handleClick = (train) => {
        const {id}  = train
        redirect(`/book?journey_id=${id}&from_station=${from}&to_station=${to}`)
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-5xl mx-auto px-4 space-y-4">
                <h1 className="text-3xl font-bold text-slate-900">Train Results</h1>

                {loading ? (
                    <Loading/>
                ) : (
                    trainResults.length > 0 ? (
                    <>
                <p className="text-sm text-slate-600">From <strong>{from || 'N/A'}</strong> to <strong>{to || 'N/A'}</strong></p>
                    <div className="flex flex-col gap-6">
                        {trainResults.map((train, idx) => (
                            <TrainCard key={train.id || idx} train={train} bnFunction={() => handleClick(train)} />
                        ))}
                    </div>
                        </>
                    ):(
                        <NotFound error={true} message="No trains found"/>
                    )
                )}
            </div>
        </div>
    )
}

export default function SearchTrain() {
    return (
        <Suspense fallback={<Loading />}>
            <SearchTrainContent />
        </Suspense>
    )
}
