import { createContext, useContext, useState } from 'react'
import en from './en.json'
import sq from './sq.json'

const DICTIONARIES = { en, sq }
const I18nContext = createContext(null)

export function I18nProvider ({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'sq')

  function changeLang (next) {
    setLang(next)
    localStorage.setItem('lang', next)
  }

  function t (key) {
    return DICTIONARIES[lang][key] || key
  }

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n () {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
