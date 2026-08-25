import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'

const INK = '#6B3A1E'
const QUESTION_KEYS = ['1', '2', '3', '4']

export default function FAQSection () {
  const { t } = useI18n()
  const [open, setOpen] = useState(null)

  return (
    <div className="font-mono max-w-3xl mx-auto px-6 mt-20">
      <h2 className="font-body text-2xl sm:text-3xl font-semibold text-[#241A12] mb-8">{t('faq.title')}</h2>

      <div className="flex flex-col">
        {QUESTION_KEYS.map(key => {
          const isOpen = open === key
          return (
            <div key={key} className="border-t last:border-b" style={{ borderColor: INK }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : key)}
                className="w-full flex items-center justify-between gap-4 py-4 text-left"
              >
                <span className="font-body text-sm font-semibold text-[#241A12]">{t(`faq.q${key}`)}</span>
                <span className="text-lg shrink-0 font-semibold" style={{ color: INK }}>{isOpen ? '-' : '+'}</span>
              </button>
              {isOpen && (
                <p className="font-body text-sm text-[#6B6B6B] pb-4 pr-8">{t(`faq.a${key}`)}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
