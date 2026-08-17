import { useI18n } from '../i18n/I18nContext.jsx'

export default function LanguageToggle () {
  const { lang, setLang } = useI18n()

  return (
    <div className="flex gap-3 text-sm font-semibold">
      <button
        className={lang === 'sq' ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}
        onClick={() => setLang('sq')}
      >
        SQ
      </button>
      <button
        className={lang === 'en' ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}
        onClick={() => setLang('en')}
      >
        EN
      </button>
    </div>
  )
}
