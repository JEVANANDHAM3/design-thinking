"use client"

import React from 'react'
import Link from 'next/link'
import { Chip } from '@heroui/react'
import { ArrowLeft, CircleCheckFill } from '@gravity-ui/icons'
import { Button } from './ui/button'

export default function LotteryDone() {
  return (
    <div className="app-shell flex min-h-[75vh] items-center justify-center py-8 font-sans">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white/90 px-10 py-14 text-center shadow-2xl shadow-slate-200/60 backdrop-blur">
        <Chip className="border border-emerald-200 bg-emerald-50 text-emerald-700" variant="flat">
          Lottery entry received
        </Chip>

        <div className="mx-auto mb-8 mt-6 flex h-[90px] w-[90px] items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-lg shadow-emerald-500/20">
          <CircleCheckFill className="size-12" />
        </div>

        <h1 className="mb-4 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          You're All Set!
        </h1>

        <p className="mb-10 text-lg leading-relaxed text-slate-600">
          Good news, you have already entered the train lottery.
          Keep an eye on your inbox, we'll notify you as soon as the results are announced!
        </p>

        <Button asChild className="h-12 rounded-full bg-slate-950 px-8 text-base text-white hover:bg-slate-800">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
