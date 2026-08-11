import { LucideIcon } from 'lucide-react'

interface ShellButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
}

export default function ShellButton({ icon: Icon, label, onClick }: ShellButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
    >
      <Icon className="h-4 w-4 text-slate-300" />
      {label}
    </button>
  )
}
