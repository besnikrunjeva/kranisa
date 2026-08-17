import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider ({ children }) {
  const [token, setToken] = useState(localStorage.getItem('adminToken'))

  function login (newToken) {
    setToken(newToken)
    localStorage.setItem('adminToken', newToken)
  }

  function logout () {
    setToken(null)
    localStorage.removeItem('adminToken')
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth () {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
