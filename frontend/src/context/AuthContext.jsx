import { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginService } from '../services/authService'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/usuarios/me/')
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const data = await loginService(username, password)
    const profile = await api.get('/usuarios/me/')
    setUser(profile.data)
    navigate('/')
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
