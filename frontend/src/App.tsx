import { useEffect, useState } from 'react'
import './App.css'

// Simplified Sthan Studio React port — cleaned and trimmed

export default function App() {
  const [pane, setPane] = useState(0) // 0..5
  const steps = [
    { code: 'ST 01', title: 'Account' },
    { code: 'ST 02', title: 'Project' },
    { code: 'ST 03', title: 'Import' },
    { code: 'ST 04', title: 'Editor' },
    { code: 'ST 05', title: 'Collision' },
    { code: 'ST 06', title: 'Publish' },
  ]

  // Account form state (wired to backend auth)
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const next = () => setPane((p) => Math.min(steps.length - 1, p + 1))
  const back = () => setPane((p) => Math.max(0, p - 1))
  const goto = (i: number) => setPane(Math.max(0, Math.min(steps.length - 1, i)))

  // simple local behaviors for editor controls
  const [selectedShape, setSelectedShape] = useState('Box')
  const [selectedTree, setSelectedTree] = useState('library_floor1')
  const [tool, setTool] = useState('move')

  useEffect(() => {
    // page title
    document.title = 'Sthan Studio — Setup'
  }, [])

  // lightweight register/login handlers — assume backend endpoints exist
  const register = async () => {
    if (!name || !email || !password) return alert('name, email, password required')
    const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, org }) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) return alert(j.error || 'register failed')
    // store token
    if (j.token) localStorage.setItem('token', j.token)
    alert('account created — proceed')
    next()
  }

  const login = async () => {
    if (!email || !password) return alert('email+password required')
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) return alert(j.error || 'login failed')
    if (j.token) localStorage.setItem('token', j.token)
    alert('signed in')
    next()
  }

  // upload file helper
  const uploadFile = async (file: File) => {
    const token = localStorage.getItem('token')
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/upload', { method: 'POST', body: fd, headers: token ? { Authorization: `Bearer ${token}` } : undefined })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      return { error: j.error || 'upload failed' }
    }
    return r.json()
  }

  return (
    <div>
      <div className="traverse">
        <div className="brand"><b>Sthan Studio</b><span>lcc → playable tour</span></div>
        <div className="steps">
          {steps.map((s, i) => (
            <div key={s.title} className="step" data-state={i < pane ? 'done' : i === pane ? 'now' : undefined} onClick={() => goto(i)}>
              <em>{s.code}</em>
              <b>{s.title}</b>
            </div>
          ))}
        </div>
      </div>

      <main>
        {/* 01 Account */}
        <section className="pane" data-active={pane === 0 ? true : undefined}>
          <h1>Create your account</h1>
          <p className="lede">One organisation holds your projects, scenes and visitor records.</p>
          <div className="tick"></div>
          <div className="card signin">
            <div className="card-b">
              <div className="grid2" style={{ marginBottom: 12 }}>
                <div>
                  <label className="f">full name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="f">organisation</label>
                  <input type="text" value={org} onChange={(e) => setOrg(e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="f">work email</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="f">password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="acts">
            <button className="btn btn-key" onClick={register}>Create account</button>
            <span className="hint">role: owner</span>
          </div>
        </section>

        {/* 02 Project */}
        <section className="pane" data-active={pane === 1 ? true : undefined}>
          <h1>Choose a project</h1>
          <p className="lede">A project is one site — a campus, a temple complex, a building.</p>
          <div className="tick"></div>
          <div className="card">
            <div className="card-h"><b>Projects</b><span>4 active</span></div>
            <div className="plist">
              <button className="prow" aria-pressed={true}><div><b>Madan Ashrit College</b><div className="sub">21 scenes · 17 doorways · published 28 Jul</div></div><span className="pill live">live</span><span className="mono">→</span></button>
              <button className="prow"><div><b>Patan Durbar — courtyards</b><div className="sub">6 scenes · heritage</div></div><span className="pill live">live</span><span className="mono">→</span></button>
            </div>
          </div>
          <div className="acts"><button className="btn" onClick={back}>Back</button><button className="btn btn-key" onClick={next}>Open project</button><span className="spacer"></span><span className="hint">Madan Ashrit College</span></div>
        </section>

        {/* 03 Import */}
        <section className="pane" data-active={pane === 2 ? true : undefined}>
          <h1>Import a scene</h1>
          <p className="lede">Drop an LCC file or choose one — resumable upload.</p>
          <div className="tick"></div>
          <div className="drop">
            <b>Drop an LCC file, or choose one</b>
            <p>Resumable upload. Safe to close the tab once chunks are moving.</p>
            <div className="exts"><span className="ext key">.lcc</span><span className="ext key">.lcc2</span><span className="ext">.glb</span></div>
            <input type="file" id="importFile" onChange={async (e) => {
              const f = e.currentTarget.files?.[0]
              if (!f) return
              const res = await uploadFile(f)
              if (res.error) return alert(res.error)
              alert('uploaded: ' + res.originalName)
            }} />
          </div>
          <div className="acts"><button className="btn" onClick={back}>Back</button><button className="btn btn-key" onClick={next}>Open in editor</button><span className="spacer"></span><span className="hint">no processing step — the file is already finished</span></div>
        </section>

        {/* 04 Editor (simplified) */}
        <section className="pane" data-active={pane === 3 ? true : undefined}>
          <h1>Editor</h1>
          <p className="lede">Place what makes the space playable. Drag, position and press Play.</p>
          <div className="tick"></div>
          <div className="ed">
            <div className="edp">
              <div className="edh"><span>Hierarchy</span><span>11</span></div>
              <div className="tree">
                <div className="grp">Scene</div>
                <button onClick={() => setSelectedTree('library_floor1')} aria-pressed={selectedTree === 'library_floor1'}><span className="sw" style={{ background: '#7C8F8C' }}></span>library_floor1 · locked</button>
                <div className="grp">Coins</div>
                <button onClick={() => setSelectedTree('coin01')}><span className="sw" style={{ background: '#E0B93F' }}></span>coin 01 … coin 05</button>
              </div>
              <div className="edh" style={{ borderTop: '1px solid var(--line)' }}><span>Add</span></div>
              <div className="palette">
                {['Coin','Panel','Doorway','Zone','Start'].map(s => (
                  <button key={s} className="pbtn" onClick={() => setSelectedShape(s)} aria-pressed={selectedShape===s}><span className="sw" style={{ background: '#E0B93F' }}></span>{s}</button>
                ))}
              </div>
            </div>

            <div className="edp stage">
              <div className="tools">
                {['select','move','rotate','scale'].map(t => (
                  <button key={t} className="tool" aria-pressed={tool===t} onClick={() => setTool(t)}>{t}</button>
                ))}
                <span className="gap"></span>
                <button className="tool" aria-pressed>play</button>
              </div>
              <div className="aperture">
                <svg viewBox="0 0 560 330" aria-label="Editor viewport with a selected panel and transform gizmo">
                  <g stroke="#16282B" strokeWidth="1">
                    <path d="M0 262 L560 232" /><path d="M0 292 L560 258" />
                  </g>
                  <g fill="#1B3034"><rect x="168" y="152" width="152" height="120" rx="2"/></g>
                </svg>
                <span className="corner tl"></span><span className="corner tr"></span><span className="corner bl"></span><span className="corner br"></span>
                <div className="hud">cam <b>6.20 5.10 11.4</b> · selected <b>{selectedTree}</b></div>
              </div>
            </div>

            <div className="edp">
              <div className="edh"><span>Inspector</span><span>{selectedTree}</span></div>
              <div className="blk">
                <h4>Transform <em>core</em></h4>
                <div className="in">
                  <div className="frow"><label>pos</label><div className="xyz"><span className="val">4.18</span><span className="val">1.40</span><span className="val">-7.64</span></div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="acts"><button className="btn" onClick={back}>Back</button><button className="btn btn-key" onClick={next}>Set up collision</button><span className="spacer"></span><span className="hint">autosaved</span></div>
        </section>

        {/* 05 Collision */}
        <section className="pane" data-active={pane === 4 ? true : undefined}>
          <h1>Collision</h1>
          <p className="lede">Add invisible shapes to stop visitors walking through walls.</p>
          <div className="tick"></div>
          <div className="shapes">
            {['Box','Sphere','Cylinder','Plane','Capsule'].map(s => (
              <button key={s} className="shape" aria-pressed={selectedShape===s} onClick={() => setSelectedShape(s)}>
                <b>{s}</b><span>example</span>
              </button>
            ))}
          </div>
          <div className="acts"><button className="btn" onClick={back}>Back</button><button className="btn btn-key" onClick={next}>Accept and publish</button><span className="spacer"></span><span className="hint">shapes are never rendered for visitors</span></div>
        </section>

        {/* 06 Publish */}
        <section className="pane" data-active={pane === 5 ? true : undefined}>
          <h1>Publish</h1>
          <p className="lede">Publishing writes a folder that runs on any web server.</p>
          <div className="tick"></div>
          <dl className="stats">
            <div className="stat"><dt>scenes</dt><dd>21</dd></div>
            <div className="stat"><dt>doorways</dt><dd>17</dd></div>
            <div className="stat"><dt>coins</dt><dd>84</dd></div>
          </dl>
          <div className="acts"><button className="btn" onClick={back}>Back</button><button className="btn btn-key" onClick={() => goto(0)}>Publish tour</button><span className="spacer"></span><span className="hint">client keeps the folder</span></div>
        </section>
      </main>
    </div>
  )
}
