import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import TaskList from './pages/TaskList'
import SprintsPage from './pages/SprintsPage'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import GlobalMap from './pages/GlobalMap'
import NotFound from './pages/NotFound'
import Loading from './components/common/Loading'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading fullPage />
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading fullPage />
  return user ? <Navigate to="/" /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="proyectos" element={<Projects />} />
        <Route path="proyectos/:id" element={<ProjectDetail />} />
        <Route path="tareas" element={<TaskList />} />
        <Route path="sprints" element={<SprintsPage />} />
        <Route path="reportes" element={<Reports />} />
        <Route path="configuracion" element={<Settings />} />
        <Route path="mapa" element={<GlobalMap />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
