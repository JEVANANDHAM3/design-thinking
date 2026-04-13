"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, Chip } from "@heroui/react"
import { ArrowRight, House, Magnifier, Person, Ticket } from "@gravity-ui/icons"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const { data: session } = useSession()
  const [toggle, setToggle] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = () => {
    setToggle((prev) => !prev)
  }

  const handleTicket = () => {
    setToggle(false)
    router.push("/my_ticket")
  }

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setToggle(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const links = [
    { href: "/search", label: "Search", icon: Magnifier },
    { href: "/my_ticket", label: "My Tickets", icon: Ticket },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="app-shell flex min-h-18 items-center justify-between gap-4 py-4">
        <Link href={session ? "/search" : "/"} className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-amber-400 text-white shadow-lg shadow-blue-500/20">
            <Ticket className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Smart Rail
            </p>
          </div>
        </Link>

        {session ? (
          <nav className="hidden items-center gap-2 md:flex">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  pathname === href
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        ) : (
          <Chip
            color="warning"
            variant="flat"
            className="hidden border border-amber-200/70 bg-amber-50/80 px-3 py-1 text-amber-900 md:inline-flex"
          >
            Sign in to search and book
          </Chip>
        )}

        {!session ? (
          <Button
            onClick={() => signIn("google")}
            className="rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800"
          >
            <ArrowRight className="size-4" />
            Sign in
          </Button>
        ) : (
          <div className="relative flex items-center gap-4" ref={dropdownRef}>
            <button
              type="button"
              className="flex items-center cursor-pointer gap-3 rounded-full border border-slate-200 bg-white/80 px-2 py-2 shadow-sm transition hover:border-slate-300 hover:bg-white"
              onClick={handleClick}
            >
              <Avatar className="cursor-pointer">
                <Avatar.Image alt={session.user.name} src={session.user.image} />
                <Avatar.Fallback><Person /></Avatar.Fallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="max-w-32 truncate text-sm font-semibold text-slate-900">
                  {session.user.name}
                </p>
                <p className="max-w-32 truncate text-xs text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </button>

            {toggle && (
              <div className="absolute right-0  top-full mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
                <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                  <p className="text-sm font-semibold text-slate-900">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <div className="p-2">
                  <button
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    onClick={handleTicket}
                  >
                    <Ticket className="size-4" />
                    My Tickets
                  </button>
                  {/* <button
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    onClick={() => {
                      setToggle(false)
                      router.push("/search")
                    }}
                  >
                    <House className="size-4" />
                    Search Trains
                  </button> */}
                  <button
                    className="mt-1 flex cursor-pointer w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    onClick={() => signOut()}
                  >
                    <ArrowRight className="size-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
