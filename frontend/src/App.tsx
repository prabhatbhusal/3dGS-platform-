import { useEffect, useState } from 'react'
import DashboardShell from './layouts/DashboardShell'
import AuthPage from './features/AuthPage'
import HomePage from './features/HomePage'
import './globals.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    setLoading(true)
    fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          localStorage.removeItem('token')
          setToken(null)
          throw new Error('Session expired. Please sign in again.')
        }
        return res.json()
      })
      .then((data) => {
        setUser(data)
        setError(null)
      })
      .catch((err) => {
        if (err instanceof Error) setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleAuthResult = ({ token, user }: { token: string; user: { name: string; email: string } }) => {
    localStorage.setItem('token', token)
    setToken(token)
    setUser(user)
    setError(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setError(null)
  }

  return (
    <DashboardShell user={user} onLogout={handleLogout}>
      {user ? (
        <HomePage apiBase={API_BASE} token={token || ''} />
      ) : (
        <AuthPage apiBase={API_BASE} onSuccess={handleAuthResult} error={error} setError={setError} loading={loading} />
      )}
    </DashboardShell>
  )
}
