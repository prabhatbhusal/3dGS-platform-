import EditorCanvas from './components/EditorCanvas'
import DashboardShell from './components/DashboardShell'
import { ArrowPath, UploadCloud } from 'lucide-react'

export default function HomePage() {
  return (
    <DashboardShell>
      <section className="grid gap-6 xl:grid-cols-[450px_1fr]">
        <div className="space-y-6 rounded-[32px] border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Upload</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white">Import LCC / Gaussian Splat</p>
                <p className="mt-1 text-sm text-slate-400">Only authenticated users can move to the editor.</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
                <UploadCloud className="h-4 w-4" />
                Upload
              </button>
            </div>
          </div>
          <div className="space-y-4 rounded-[28px] border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Editor tools</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Live control panel</h2>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">3D edit</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Move', 'Rotate', 'Scale', 'Snap'].map((label) => (
                <button key={label} className="rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-4 text-left text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-900">
                  <span className="font-semibold text-white">{label}</span>
                  <p className="mt-2 text-xs text-slate-400">Realtime 3D control</p>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-4 shadow-2xl shadow-slate-950/20">
          <EditorCanvas />
        </div>
      </section>
    </DashboardShell>
  )
}
