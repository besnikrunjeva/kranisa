import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import './theme.css'
import StudioHeader from './components/StudioHeader.jsx'
import StudioFooter from './components/StudioFooter.jsx'

export default function StudioLayout () {
  const { pathname } = useLocation()

  // Fresh screens start at the top — the studio is a set of distinct pages.
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="studio">
      <StudioHeader />
      <Outlet />
      <StudioFooter />
    </div>
  )
}
