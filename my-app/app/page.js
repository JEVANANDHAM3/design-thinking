"use client"

import { Button } from "@/components/ui/button"
import { Chip } from "@heroui/react"
import { ArrowRight, CircleCheck, Rocket, Ticket } from "@gravity-ui/icons"
import { signIn } from "next-auth/react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function Page() {
  const { data: session } = useSession()

  if (session) {
    redirect("/search")
  }

  return (
    <div className="app-shell flex min-h-[calc(100vh-5rem)] items-center py-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-8 text-white shadow-2xl shadow-blue-950/20 sm:p-10">
          <div className="absolute -right-16 top-0 size-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl" />
          <Chip className="border border-white/15 bg-white/10 px-3 py-1 text-white" variant="flat">
            New travel dashboard
          </Chip>
          <div className="mt-6 max-w-xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Book smarter journeys with a cleaner, faster rail experience.
            </h1>
            <p className="text-base leading-7 text-blue-100/85 sm:text-lg">
              Search routes, join lotteries, track ticket status, and complete payment from one polished workspace.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2">Live search flow</div>
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2">Lottery status tracking</div>
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2">Simple ticket management</div>
          </div>
        </section>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 px-8 py-10 shadow-xl shadow-slate-200/60 backdrop-blur">
          <div className="mb-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
              <Ticket className="size-8" />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Welcome back
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              Sign in to continue
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Use your Google account to access search, booking, and ticket updates.
            </p>
          </div>

          <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <Rocket className="size-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Fast entry into train search and booking</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <CircleCheck className="size-5 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">Track selection and payment status clearly</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => signIn("google")}
              className="h-12 rounded-full bg-slate-950 px-6 text-base text-white hover:bg-slate-800"
            >
              Continue with Google
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
