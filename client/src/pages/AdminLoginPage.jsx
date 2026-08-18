import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { login as loginRequest } from '../api/auth.js'

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
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-heading text-2xl font-black tracking-tight text-[#1A1A1A] text-center mb-8">
          Kran<span className="ml-0.5 rounded-md bg-[#C81E3A] px-1.5 py-0.5 text-white">isa</span>
        </p>
        <form onSubmit={handleSubmit} className="bg-white border border-[#E4E4E4] rounded-2xl p-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#6B6B6B] font-semibold">{t('admin.login.email')}</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border border-[#E4E4E4] rounded-lg px-3 py-2 outline-none focus:border-[#C81E3A]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#6B6B6B] font-semibold">{t('admin.login.password')}</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border border-[#E4E4E4] rounded-lg px-3 py-2 outline-none focus:border-[#C81E3A]"
            />
          </label>
          {error && <div className="text-red-600 text-sm">{t('admin.login.error')}</div>}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-[#C81E3A] text-white rounded-lg font-bold text-sm py-2.5 pl-5 pr-2 hover:bg-[#AD1830] transition-colors"
          >
            {t('admin.login.submit')}
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1A1A1A] text-[#C81E3A]">
              &rarr;
            </span>
          </button>
        </form>
        <Link to="/" className="block text-center text-xs text-[#6B6B6B] mt-4 hover:text-[#1A1A1A]">
          ← {t('app.title')}
        </Link>
      </div>
    </div>
  )
}
