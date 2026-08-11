import { type FormEvent, useState } from 'react'

type AuthPageProps = {
  apiBase: string
  onSuccess: (result: { token: string; user: { name: string; email: string } }) => void
  error: string | null
  setError: (value: string | null) => void
  loading: boolean
}

const steps = [
  { label: 'Account', status: 'now' },
  { label: 'Project', status: 'next' },
  { label: 'Import', status: 'next' },
  { label: 'Editor', status: 'next' },
  { label: 'Collision', status: 'next' },
  { label: 'Publish', status: 'next' },
]

export default function AuthPage({ apiBase, onSuccess, error, setError, loading }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [org, setOrg] = useState('')

  const actionLabel = mode === 'login' ? 'Sign in' : 'Create account'
  const submitUrl = `${apiBase}/auth/${mode}`

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const payload: Record<string, string> = { email, password }
    if (mode === 'register') {
      payload.name = name
      if (org.trim()) payload.org = org.trim()
    }

    try {
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) {
        const message = result?.error || 'Unable to authenticate. Please try again.'
        setError(message)
        return
      }

      if (result?.token && result?.user) {
        onSuccess({ token: result.token, user: result.user })
      } else {
        setError('Received invalid response from server.')
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Network error. Check backend server.')
    }
  }

  const switchTo = (newMode: 'login' | 'register') => {
    setMode(newMode)
    setError(null)
  }

  return (
    <section className="mx-auto w-full max-w-[1100px] rounded-[28px] border border-slate-700 bg-slate-950/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.75)] sm:p-10">
      <div className="mb-8 overflow-hidden rounded-[26px] border border-slate-800 bg-slate-900/75 shadow-inner shadow-slate-950">
        <div className="flex items-center gap-4 border-b border-slate-800 bg-slate-950/95 px-5 py-4 text-sm text-slate-400">
          <div className="rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            Sthan Studio
          </div>
          <div className="grid flex-1 grid-cols-3 gap-3 overflow-x-auto text-left text-xs uppercase tracking-[0.20em]">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className={`rounded-3xl border px-3 py-2 ${step.status === 'now' ? 'border-fuchsia-400 bg-slate-950 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
              >
                <p className="text-[10px] text-slate-500">ST {String(index + 1).padStart(2, '0')}</p>
                <p className="font-medium">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6 rounded-[28px] border border-slate-800 bg-slate-900/90 p-5">
          <div className="rounded-[22px] border border-slate-700 bg-slate-950/95 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Stage</p>
            <h3 className="mt-3 text-lg font-semibold text-white">{mode === 'login' ? 'Sign in' : 'Create your account'}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {mode === 'login'
                ? 'Sign in to access your studio projects and editor.'
                : 'One organisation holds your projects, scenes and visitor records.'}
            </p>
          </div>

          <div className="space-y-3 rounded-[22px] border border-slate-700 bg-slate-950/95 p-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Account role</span>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">Owner</span>
            </div>
            <p className="text-sm leading-6 text-slate-400">You and your team can publish tours, import LCC scenes, and manage collision passes.</p>
          </div>

          <div className="space-y-3 rounded-[22px] border border-slate-700 bg-slate-950/95 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Quick start</p>
            <div className="grid gap-2 text-sm text-slate-300">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 px-3 py-3">Create your account</div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 px-3 py-3">Open a project</div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 px-3 py-3">Import LCC</div>
            </div>
          </div>
        </aside>

        <div className="rounded-[28px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 rounded-[24px] border border-slate-800 bg-slate-900/90 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{mode === 'login' ? 'Sign in' : 'Create account'}</p>
                <h1 className="mt-2 text-2xl font-semibold text-white">{mode === 'login' ? 'Continue to your studio' : 'Start your first tour'}</h1>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">{mode === 'login' ? 'access' : 'setup'}</span>
            </div>
            <p className="text-sm leading-6 text-slate-400">
              {mode === 'login'
                ? 'Secure access to your Gaussian splat editor and published project flow.'
                : 'One workspace for scene imports, editor tools and publish-ready tours.'}
            </p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Full name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                  placeholder="Rajan Shrestha"
                  required
                />
              </label>
            )}

            {mode === 'register' && (
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Organisation</span>
                <input
                  value={org}
                  onChange={(event) => setOrg(event.target.value)}
                  className="mt-1 w-full rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                  placeholder="GeoNova"
                />
              </label>
            )}

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Work email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                placeholder="you@example.com"
                type="email"
                required
              />
            </label>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-500">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                placeholder="••••••••••••"
                type="password"
                minLength={6}
                required
              />
            </label>

            {error ? (
              <div className="rounded-3xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-3xl bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Working…' : actionLabel}
            </button>
          </form>

          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-400">
            {mode === 'login' ? (
              <p>
                No account yet?{' '}
                <button type="button" className="font-semibold text-white hover:text-fuchsia-300" onClick={() => switchTo('register')}>
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Already a member?{' '}
                <button type="button" className="font-semibold text-white hover:text-fuchsia-300" onClick={() => switchTo('login')}>
                  Sign in instead
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
