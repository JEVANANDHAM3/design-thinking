import React from 'react'

const login = () => {
  return (
    
<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white px-8 py-10 shadow-xl shadow-slate-200/40">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Welcome back
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Sign in to continue
          </h1>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => signIn("google")}
            className="flex items-center justify-center gap-3 rounded-2xl bg-gray-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path fill="#4285F4" d="M23.64 12.2c0-.78-.07-1.53-.2-2.25H12.2v4.26h6.19c-.27 1.44-1.08 2.66-2.29 3.48v2.9h3.7c2.16-1.99 3.41-4.92 3.41-8.39z"/>
                <path fill="#34A853" d="M12.2 24c2.97 0 5.47-.98 7.29-2.66l-3.7-2.9c-1.03.69-2.35 1.1-3.59 1.1-2.76 0-5.1-1.86-5.94-4.36H2.47v2.73C4.27 21.95 8.01 24 12.2 24z"/>
                <path fill="#FBBC05" d="M6.26 14.18a7.28 7.28 0 0 1 0-4.36V7.09H2.47a11.98 11.98 0 0 0 0 9.82l3.79-2.73z"/>
                <path fill="#EA4335" d="M12.2 4.8c1.61 0 3.05.55 4.2 1.64l3.15-3.15C17.66 1.32 15 0 12.2 0 8.01 0 4.27 2.05 2.47 5.09l3.79 2.73c.84-2.5 3.18-4.36 5.94-4.36z"/>
              </svg>
            </span>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}

export default login
