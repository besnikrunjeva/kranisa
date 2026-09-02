import { useI18n } from '../i18n/I18nContext.jsx'
import { FAQSection } from './ui/faqsection.tsx'

export default function FAQ () {
  const { t } = useI18n()

  const faqsLeft = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
  ]
  const faqsRight = [
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
    { question: t('faq.q6'), answer: t('faq.a6') },
  ]

  return (
    <FAQSection
      subtitle={t('faq.subtitle')}
      title={t('faq.title')}
      description={t('faq.description')}
      faqsLeft={faqsLeft}
      faqsRight={faqsRight}
      className="font-body"
    />
  )
}
