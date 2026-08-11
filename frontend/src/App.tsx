import { useEffect, useState } from 'react'
import './App.css'

type User = { id: number; name: string }
type Message = { id: number; from: string; text: string; createdAt: number }

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    fetch('/api/users').then((r) => r.json()).then(setUsers).catch(() => setUsers([]))
    fetch('/api/messages').then((r) => r.json()).then(setMessages).catch(() => setMessages([]))
  }, [])

  const addUser = async () => {
    if (!name) return
    const r = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    const u = await r.json()
    setUsers((s) => [...s, u])
    setName('')
  }

  const sendMessage = async () => {
    if (!currentUser || !text) return
    const r = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: currentUser.name, text }) })
    const m = await r.json()
    setMessages((s) => [...s, m])
    setText('')
  }

  return (
    <div className="app-root">
      <header>
        <h1>Arrival-like Platform (no Viber)</h1>
      </header>

      <section className="panel">
        <h2>Users</h2>
        <div className="users-list">
          {users.map((u) => (
            <button key={u.id} onClick={() => setCurrentUser(u)} className={currentUser?.id === u.id ? 'active' : ''}>
              {u.name}
            </button>
          ))}
        </div>
        <div className="add-user">
          <input placeholder="New user name" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={addUser}>Add User</button>
        </div>
      </section>

      <section className="panel">
        <h2>Messages</h2>
        <div className="messages">
          {messages.map((m) => (
            <div key={m.id} className="message">
              <strong>{m.from}:</strong> {m.text}
            </div>
          ))}
        </div>
        <div className="send-message">
          <input placeholder="Message text" value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={sendMessage} disabled={!currentUser}>Send</button>
        </div>
      </section>

      <footer>
        <small>Backend API: /api (local proxy configured)</small>
      </footer>
    </div>
  )
}

export default App
