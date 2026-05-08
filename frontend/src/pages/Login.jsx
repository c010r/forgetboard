import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
    } catch {
      setError('Credenciales inválidas')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">ForgeBoard</h1>
          <p className="text-slate-400 mt-2">Gestión de Proyectos</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-5">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white text-center">Iniciar Sesión</h2>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="usuario"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
