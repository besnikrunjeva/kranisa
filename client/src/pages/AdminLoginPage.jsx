import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { login as loginRequest } from '../api/auth.js'

const INK = '#6B3A1E'

export default function AdminLoginPage () {
  const { t } = useI18n()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  async function handleSubmit (e) {
    e.preventDefault()
    setError(null)
    try {
      const { token } = await loginRequest(email, password)
      login(token)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-wordmark text-2xl text-[#0A0A0A] text-center mb-8">kranisa</p>

        <form onSubmit={handleSubmit} className="bg-[#FDF9F2] border rounded-none p-6 flex flex-col gap-4" style={{ borderColor: INK }}>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#6B6B6B] font-semibold">{t('admin.login.email')}</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 outline-none bg-white text-[#241A12]"
              style={{ borderColor: '#DDD0BC' }}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#6B6B6B] font-semibold">{t('admin.login.password')}</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 outline-none bg-white text-[#241A12]"
              style={{ borderColor: '#DDD0BC' }}
            />
          </label>
          {error && <div className="text-red-700 text-sm">{t('admin.login.error')}</div>}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-[#0A0A0A] text-white rounded-full font-medium text-sm py-2.5 px-5 hover:bg-[#241A12] transition-colors"
          >
            {t('admin.login.submit')}
          </button>
        </form>
        <Link to="/" className="block text-center text-xs text-[#6B6B6B] mt-4 hover:text-[#0A0A0A]">
          &larr; {t('app.title')}
        </Link>
      </div>
    </div>
  )
}
