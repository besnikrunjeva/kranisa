import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nContext.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import RequireAdmin from './auth/RequireAdmin.jsx'
import SearchPage from './pages/SearchPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminOffersPage from './pages/AdminOffersPage.jsx'

export default function App () {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<RequireAdmin><AdminOffersPage /></RequireAdmin>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  )
}
