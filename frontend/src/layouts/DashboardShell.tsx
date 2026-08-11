import type { PropsWithChildren } from 'react'
import { ShieldCheck, Sparkles, Layers, LogOut, UserCircle2 } from 'lucide-react'

type DashboardShellProps = PropsWithChildren<{
  user: { name: string; email: string } | null
  onLogout: () => void
}>

function ShellButton({ label, icon: Icon }: { label: string; icon: typeof ShieldCheck }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800">
      <Icon className="h-4 w-4 text-slate-300" />
      {label}
    </button>
  )
}

export default function DashboardShell({ children, user, onLogout }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-4 rounded-[32px] border border-slate-800 bg-slate-950/95 px-6 py-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Arrival Platform</p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">3D Gaussian Splat Editor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Realtime 3D edits with live splat preview, built for authenticated users and scene designers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ShellButton icon={Sparkles} label="Realtime save" />
            <ShellButton icon={Layers} label="Scene layer" />
            <ShellButton icon={ShieldCheck} label="Protected flow" />
            {user ? (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4 text-slate-300" />
                Logout
              </button>
            ) : null}
          </div>
        </header>
        <main className="flex-1">
          <div className="mb-6 flex flex-col gap-2 rounded-[28px] border border-slate-800 bg-slate-900/90 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-3 text-sm text-slate-300">
              <UserCircle2 className="h-5 w-5 text-indigo-400" />
              {user ? (
                <span>Signed in as <strong className="text-white">{user.name}</strong> ({user.email})</span>
              ) : (
                <span>Sign in to unlock the editor and uploads.</span>
              )}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
