export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div className={`relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full ${sizes[size]} mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
