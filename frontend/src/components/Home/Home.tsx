'use client'
import React, { useEffect } from 'react'
import Hero from './Hero/Hero'
import Category from './Category/Category'
import Job from '../../data/Job'
import TopCompany from './TopCompany/TopCompany'
import Info from './Info/Info'
import Price from './Price/Price'
import Review from './Review/Review'
import Footer from './Footer/Footer'
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
const Home = () => {
  useEffect(() => {
    const initAOS = async () => {
      await import('aos')
      AOS.init({
        duration: 1000,
        easing: 'ease',
        once: true,
        anchorPlacement: 'top-bottom'
      })
    }
initAOS()


  },[])
  return (
    <div className='overflow-hidden '>
      <Hero />
      <Category />
      <Job />
      <TopCompany />
      <Info />
      <Price />
      <Review />
    </div>

  )
}

export default Home