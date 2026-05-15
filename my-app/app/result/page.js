'use client'
import React, { useEffect, useState } from "react";
import Loading from "@/components/loading";
import NotFound from "@/components/notfound";
import TrainCard from "@/components/traincard";
import { useSession } from "next-auth/react";

export default function resultPage(){
    const [trains, setTrains] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { data : session } = useSession()

    const fetchTrains = async () => {
        setLoading(true)
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/un_published_trains')
            const data = await res.json()
            console.log(data)
            if (data.ok){
                setTrains(data.trains)
            }
        } catch(e) {
            console.error('Failed to fetch trains:', e)
        }
        setLoading(false)
    }

    const handlePublish = async (key) => {
        setError(null)
        const query = new URLSearchParams({
            journey_id: key
        })
        
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + '/publish_lottery?' + query.toString()
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const response = await res.json()
            console.log('Publish response:', response)
            if (response.ok){
                // Re-fetch to remove published train from list
                await fetchTrains()
                return true
            } else {
                setError(response.message || 'Publish failed. Please try again.')
                return false
            }
        } catch(e) {
            setError('Network error. Please try again.')
            return false
        }
    }
 
    useEffect(() => {
        fetchTrains()
    }, [])

    return(
        loading ? (
            <Loading/>
        ):(
            <div className="px-4">
                {error && (
                    <div className="max-w-3xl mx-auto my-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                        ⚠️ {error}
                    </div>
                )}
                {trains.length === 0 ? 
                (<NotFound error={true} message="No train Available for publishing"/>)
                :
                (<div>
            {
                trains.map( (journey) =>{
                    return(
                        <TrainCard key={journey.id}  train={journey} bnName={'Publish'} bnFunction={() => handlePublish(journey.id)} result={1}/>
                    )
                })
            }
            </div>)
                }
            </div>
        )
    )
}
