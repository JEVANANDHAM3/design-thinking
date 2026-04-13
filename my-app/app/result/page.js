'use client'
import React, { useEffect, useState } from "react";
import Loading from "@/components/loading";
import NotFound from "@/components/notfound";
import TrainCard from "@/components/traincard";
import { useSession } from "next-auth/react";

export default function resultPage(){
    const [trains, setTrains] = useState([])
    const [loading, setLoading] = useState(true)
    const { data : session } = useSession()

    const handlePublish = async (key)=>{
        const query = new URLSearchParams({
            journey_id: key
        })
        
        
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + '/publish_lottery?' + query.toString()
        const res = await fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            },
        })
        const response = await res.json()
        if (response.ok){
            return true
        } else {
            return false
        }

    }
 
    useEffect(() => {
        setLoading(true)
        const fetchTrian = async () =>{
            const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/un_published_trains')
            const data = await res.json()
            console.log(data)
            if (data.ok){
                setTrains(data.trains)
            }
            setLoading(false)
        }
        fetchTrian()
    }, [])

    return(
        loading ? (
            <Loading/>
        ):(
            trains.length === 0 ? 
            (<NotFound error={true} message="No trian Available for the publishing"/>)
            :
            (<div className="px-4">
        {
            trains.map( (journey) =>{
                return(
                    <TrainCard key={journey.id}  train={journey} bnName={'Publish'} bnFunction={() => handlePublish(journey.id)} result={1}/>
                )
            })
        }
        </div>)
        )
    )
}
