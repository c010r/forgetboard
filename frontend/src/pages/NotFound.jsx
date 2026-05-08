import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
      <p className="text-slate-500 mb-6">Página no encontrada</p>
      <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
        Volver al inicio
      </button>
    </div>
  )
}
