'use client'
import React, { useState } from 'react'
import JobSearchBar from './JobSearchBar'
import Image from 'next/image'
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
import JobsPage from '@/app/(public)/jobs/page';

const Hero = () => {
    
    const [filters, setFilters] = useState({
    title: "",
    location: ""
  });

    return <div className='relative w-full h-screen flex justify-center flex-col'>
        <div className='w-[90%] md:w-[80%] mx-auto items-center grid grid-cols-1 xl:grid-cols-2 gap-10'>
            {/* Text Content */}
            <div data-aos='fade-right'>
                {/* heading */}
                <h1 className='text-3xl sm:text-6xl font-bold'>
                    Join us & Explore Thousands of Jobs
                </h1>
                {/* subheading */}
                <p className='mt-4 text-sm sm:text-lg font-medium'>
                    Find Jobs, Employment & Career Oppotunities
                </p>
                
                {/* JobSearchBar */}
                <JobSearchBar
                  
                />


                {/* Popular search */}
                <div className='text-base font-semibold text-gray-700 dark:text-gray-300 mt-6 flex items-center space-x-6'>
                    <span>Popular Searchs: </span>
                    <span className='text-sm text-gray-700 dark:text-gray-300 font-light'>
                        Designer , Developer , Web , IOS , PHP , Senior , Engineer,
                    </span>
                </div>
            </div>
            {/* Image content */}
            <div data-aos='faded-left'
                data-aos-delay='150'
                className='mx-auto hidden xl:block'>
                <Image src='/images/hero.png' alt='hero' width={900} height={900} />
            </div>
        </div>
    </div>
}

export default Hero