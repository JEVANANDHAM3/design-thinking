import { redirect } from 'next/navigation'
import React from 'react'
import { ArrowLeft, CircleInfo } from '@gravity-ui/icons'
import { Button } from './ui/button'

const NotFound = ({ error, message }) => {
  const handleClick = () => {
    redirect('/search')
  }

  return (
    <div className="app-shell flex min-h-[65vh] items-center justify-center py-8">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-center shadow-xl shadow-slate-200/60 backdrop-blur">
        <div className="mx-auto flex size-18 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          <CircleInfo className="size-8" />
        </div>
        <p className="mt-6 text-3xl font-semibold text-slate-900">
          {error ? "Error" : "Page Not Found"}
        </p>
        <p className="mt-4 text-base text-slate-600">
          {error ? message : "Sorry, the page you are looking for could not be found."}
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            className="rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800"
            onClick={handleClick}
          >
            <ArrowLeft className="size-4" />
            Return Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
