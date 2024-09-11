import React from 'react'
import Navbar from './subComponents/Navbar'
import HeroSection from './subComponents/HeroSection'

function FrontPage() {
  return (
    <div className="min-h-screen min-w-screen">
        <Navbar/>
        <HeroSection/>
    </div>
  )
}

export default FrontPage
