export default function Loading({ fullPage = false }) {
  const content = (
    <div className="flex items-center justify-center gap-2 text-slate-500">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Cargando...</span>
    </div>
  )

  if (fullPage) {
    return <div className="flex items-center justify-center min-h-screen">{content}</div>
  }

  return <div className="flex items-center justify-center py-12">{content}</div>
}
