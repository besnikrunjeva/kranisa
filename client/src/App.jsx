import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nContext.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import RequireAdmin from './auth/RequireAdmin.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminOffersPage from './pages/AdminOffersPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import StudioLayout from './studio/StudioLayout.jsx'
import StudioHome from './studio/pages/Home.jsx'
import StudioResults from './studio/pages/Results.jsx'
import StudioOfferDetail from './studio/pages/OfferDetail.jsx'
import StudioAllOffers from './studio/pages/AllOffers.jsx'
import StudioPlanner from './studio/pages/Planner.jsx'
import StudioBlog from './studio/pages/Blog.jsx'
import StudioBlogPost from './studio/pages/BlogPost.jsx'

// The customer-facing site is now the "Studio" UI (editorial mono theme,
// its own header/footer). The previous customer pages/components live on in
// the repo (pages/SearchPage, ResultsPage, OfferDetailPage, AllOffersPage,
// components/Header, Footer) but are no longer routed — kept for reference
// and easy rollback. Admin keeps its own separate chrome.
export default function App () {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<StudioLayout />}>
              <Route path="/" element={<StudioHome />} />
              <Route path="/rezultatet" element={<StudioResults />} />
              <Route path="/oferta/:id" element={<StudioOfferDetail />} />
              <Route path="/ofertat" element={<StudioAllOffers />} />
              <Route path="/planner" element={<StudioPlanner />} />
              <Route path="/blog" element={<StudioBlog />} />
              <Route path="/blog/:slug" element={<StudioBlogPost />} />
            </Route>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<RequireAdmin><AdminOffersPage /></RequireAdmin>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  )
}
