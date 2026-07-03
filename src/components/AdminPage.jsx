import { useState } from 'react'
import AdminLogin from './AdminLogin'
import Admin from './Admin'

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token'))

  const handleLogin = (newToken) => {
    sessionStorage.setItem('admin_token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token')
    setToken(null)
  }

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <Admin token={token} onLogout={handleLogout} />
}
