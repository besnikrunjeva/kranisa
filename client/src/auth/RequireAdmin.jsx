import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

export default function RequireAdmin ({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/admin/login" replace />
  return children
}
