import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ArrowLeft, ArrowRight, UploadCloud } from 'lucide-react'
import EditorCanvas from '../components/EditorCanvas'

type HomePageProps = {
  apiBase: string
  token: string
}

type Project = {
  id: number
  name: string
  details: string
  status: 'live' | 'draft'
}

type Step = {
  title: string
  label: string
  subtitle: string
}

const STEPS: Step[] = [
  {
    title: 'Choose a project',
    label: 'Project',
    subtitle: 'A project is one site — a campus, a temple complex, or a building.',
  },
  {
    title: 'Import a scene',
    label: 'Import',
    subtitle: 'LCC files arrive finished — geometry and collision are already solved elsewhere.',
  },
  {
    title: 'Editor',
    label: 'Editor',
    subtitle: 'Place what makes the space playable and preview the splat in real time.',
  },
  {
    title: 'Collision',
    label: 'Collision',
    subtitle: 'Add invisible bounds to keep visitors on the intended path.',
  },
  {
    title: 'Publish',
    label: 'Publish',
    subtitle: 'Publish the tour as a deployable bundle for any web server.',
  },
]

const INITIAL_PROJECTS: Project[] = [
  { id: 1, name: 'Madan Ashrit College', details: '21 scenes · 17 doorways · published 28 Jul', status: 'live' },
  { id: 2, name: 'Patan Durbar — courtyards', details: '6 scenes · heritage', status: 'live' },
  { id: 3, name: 'Kirtipur campus', details: '3 scenes · capture in progress', status: 'draft' },
  { id: 4, name: 'New project', details: 'start from an LCC file', status: 'draft' },
]

const SHAPES = [
  { name: 'Box', detail: 'walls, doorways' },
  { name: 'Sphere', detail: 'pillars, statues' },
  { name: 'Cylinder', detail: 'columns, trees' },
  { name: 'Plane', detail: 'floors, ramps' },
  { name: 'Capsule', detail: 'people, posts' },
]

export default function HomePage({ apiBase, token }: HomePageProps) {
  const [step, setStep] = useState(0)
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [projectIndex, setProjectIndex] = useState(0)
  const [selectedShape, setSelectedShape] = useState('Box')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)

  const current = STEPS[step]

  const stepIndicator = useMemo(
    () => STEPS.map((item, index) => ({
      ...item,
      number: index + 2,
      active: index === step,
      done: index < step,
    })),
    [step],
  )

  const canGoNext = step < STEPS.length - 1
  const canGoBack = step > 0
  const currentProject = projects[projectIndex] ?? INITIAL_PROJECTS[0]

  useEffect(() => {
    if (!token) return

    setLoadingProjects(true)
    setProjectError(null)

    fetch(`${apiBase}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error || 'Failed to load projects')
        }
        return res.json()
      })
      .then((data: Project[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data)
          setProjectIndex(0)
        }
      })
      .catch((error) => {
        setProjectError(error instanceof Error ? error.message : 'Unable to load projects')
      })
      .finally(() => setLoadingProjects(false))
  }, [apiBase, token])

  const uploadScene = (file: File) => {
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(null)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', String(currentProject.id))

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${apiBase}/upload`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      setUploading(false)
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          setUploadSuccess(response.url ?? 'Upload complete')
        } catch {
          setUploadSuccess('Upload complete')
        }
      } else {
        setUploadError(xhr.responseText || 'Upload failed')
      }
    }

    xhr.onerror = () => {
      setUploading(false)
      setUploadError('Network error during upload')
    }

    xhr.send(formData)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      uploadScene(file)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Projects</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Choose a project</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">{projects.length} active</span>
              </div>
              <div className="mt-6 space-y-3">
                {loadingProjects ? (
                  <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5 text-center text-sm text-slate-300">Loading projects…</div>
                ) : projectError ? (
                  <div className="rounded-[28px] border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">{projectError}</div>
                ) : (
                  projects.map((project, index) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setProjectIndex(index)}
                      className={`w-full rounded-[28px] border p-4 text-left transition ${index === projectIndex ? 'border-fuchsia-500 bg-slate-900 shadow-[0_0_0_1px_rgba(248,113,211,0.15)]' : 'border-slate-800 bg-slate-950/95 hover:border-slate-700'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                          <p className="mt-1 text-sm text-slate-400">{project.details}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em] ${project.status === 'live' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'}`}>
                          {project.status}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Upload</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_240px]">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Import your LCC scene</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">Drop an LCC file or choose from your workspace upload bundle. The editor loads it directly.</p>
                  <div className="mt-6 rounded-[28px] border border-dashed border-slate-700 bg-slate-900/90 p-8 text-center">
                    <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-4 text-sm text-slate-300">Drop an LCC file here or click to browse.</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-500">.lcc · .lcc2 · .glb · .ply</p>
                    <input
                      type="file"
                      accept=".lcc,.lcc2,.glb,.ply"
                      onChange={handleFileChange}
                      className="mt-4 w-full cursor-pointer rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-white"
                    />
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Upload status</p>
                  <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/95 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-300">
                      <span>{selectedFile?.name ?? 'No file selected'}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-fuchsia-500" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-400">
                      {uploading ? 'Uploading… Please wait.' : uploadSuccess ? 'Upload complete.' : 'Resumable upload. Safe to close the tab once chunks are moving.'}
                    </p>
                    {uploadError ? <p className="mt-3 text-sm text-red-300">{uploadError}</p> : null}
                    {uploadSuccess ? <p className="mt-3 text-sm text-emerald-300">{uploadSuccess}</p> : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Editor</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Place the Gaussian splat</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">Live</span>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
                <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-4">
                  <p className="text-sm text-slate-400">Drag the gizmo controls to move the splat in real time. Use the viewer on the right to inspect your scene.</p>
                  <div className="mt-5 grid gap-3">
                    {['Move', 'Rotate', 'Scale', 'Snap'].map((label) => (
                      <button key={label} className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-900">
                        <span className="font-semibold text-white">{label}</span>
                        <p className="mt-1 text-xs text-slate-400">Realtime 3D control</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-4">
                  <div className="rounded-[24px] border border-slate-800 bg-black/80 p-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Preview</p>
                    <p className="mt-2 text-sm text-slate-300">Live preview updates as you move the splat.</p>
                  </div>
                  <div className="mt-4 rounded-[26px] border border-slate-800 bg-slate-950/90 p-3">
                    <p className="text-sm font-semibold text-white">Splat position</p>
                    <p className="mt-2 text-xs text-slate-400">X: 0 · Y: 1 · Z: 0</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[640px] rounded-[32px] border border-slate-800 bg-slate-950/95 p-4 shadow-2xl shadow-slate-950/20">
              <EditorCanvas />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Collision</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Add collision shapes</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">Optional</span>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SHAPES.map((shape) => (
                      <button
                        key={shape.name}
                        type="button"
                        onClick={() => setSelectedShape(shape.name)}
                        className={`rounded-[24px] border p-4 text-left transition ${selectedShape === shape.name ? 'border-fuchsia-500 bg-slate-900 shadow-[0_0_0_1px_rgba(248,113,211,0.15)]' : 'border-slate-800 bg-slate-950/95 hover:border-slate-700'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{shape.name}</p>
                            <p className="mt-1 text-xs text-slate-400">{shape.detail}</p>
                          </div>
                          <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">shape</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                    <span>Preview panel</span>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">{selectedShape}</span>
                  </div>
                  <div className="mt-5 rounded-[24px] border border-slate-800 bg-slate-950/95 p-4">
                    <p className="text-sm font-semibold text-white">Collision summary</p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{selectedShape} shapes help define navigation, block off edges, and keep visitor flow safe.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Publish</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Publish your tour</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">Ready</span>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-800 bg-slate-950/95 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Scenes</p>
                      <p className="mt-3 text-3xl font-semibold text-white">21</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-800 bg-slate-950/95 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Doorways</p>
                      <p className="mt-3 text-3xl font-semibold text-white">17</p>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-slate-800 bg-slate-950/95 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Package</p>
                    <p className="mt-3 font-semibold text-white">madan-ashrit-tour.zip</p>
                    <p className="mt-2 text-sm text-slate-400">1.4 GB · includes scenes, collision, assets and runtime.</p>
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5">
                  <div className="grid gap-3 text-sm text-slate-300">
                    <div className="rounded-[20px] border border-slate-800 bg-slate-950/95 p-3">Visitor tracking on</div>
                    <div className="rounded-[20px] border border-slate-800 bg-slate-950/95 p-3">Registration form ready</div>
                    <div className="rounded-[20px] border border-slate-800 bg-slate-950/95 p-3">Handover package export</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="space-y-6 rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20">
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Step</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{current.label}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{current.subtitle}</p>
        </div>

        <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-4">
          <div className="space-y-3">
            {stepIndicator.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">ST {String(item.number).padStart(2, '0')}</p>
                  <p className={`mt-1 text-sm font-semibold ${item.active ? 'text-white' : 'text-slate-300'}`}>{item.label}</p>
                </div>
                <div className={`h-2 w-2 rounded-full ${item.done ? 'bg-emerald-500' : item.active ? 'bg-fuchsia-500' : 'bg-slate-700'}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-800 bg-slate-950/95 p-5 text-sm text-slate-400">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Connected</p>
          <p className="mt-3 text-slate-300">{apiBase}</p>
        </div>
      </aside>

      <div className="space-y-6">
        {renderStepContent()}

        <div className="flex flex-col gap-3 rounded-[32px] border border-slate-800 bg-slate-900/90 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-400">
            {step === 0 ? 'Project selection' : step === 1 ? 'Scene import' : step === 2 ? 'Editor preview' : step === 3 ? 'Collision review' : 'Publish summary'}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(Math.max(step - 1, 0))}
              disabled={!canGoBack}
              className="inline-flex items-center gap-2 rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-slate-300 transition hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(Math.min(step + 1, STEPS.length - 1))}
              disabled={!canGoNext}
              className="inline-flex items-center gap-2 rounded-3xl bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {canGoNext ? 'Next' : 'Finish'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
