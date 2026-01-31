'use client'
import React from 'react'
import { LuNetwork } from 'react-icons/lu'

const Footer = () => {
    return (
        <div className='pt-16 pb-16 bg-gray-200 dark:bg-gray-900'>
            <div className='w-[90%] mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10 items-start'>
                {/* 1st part */}
                <div className='xl:col-span-2'>
                    {/* Logo */}
                    <div className='flex items-center space-x-2'>
                        <div className='w-10 h-10 bg-cyan-800  rounded-full flex items-center justify-center flex-col'>
                            <LuNetwork className='w-5 h-5 text-white ' />
                        </div>
                        <h1 className='text-xl hidden sm:block md:text-2xl text-cyan-800 dark:text-white font-bold'>
                            JobNest
                        </h1>
                    </div>

                    <p className='mt-4 text-sm text-gray-600 dark:text-gray-400'>
Dreams don’t follow you — you chase them.
And every application is a door you choose to open.
Let today be the day you walk toward your best future                    </p>
                    {/* call */}
                    <div className='mt-5'>
                        <h1 className='lg:text-xl text-base text-gray-700 dark:text-gray-300 font-medium'>Call Us</h1>
                        <p className='mt-1 text-gray-600 dark:text-gray-300 font-bold'>
                            +333429390
                        </p>
                    </div>
                    {/* address */}
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-4'>Tran Thi Bich La</p>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>Luong Thuan Duong</p>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>23520827@gm.uit.edu.vn</p>
                </div>
                {/* 2nd part */}
                <div className='space-y-6'>
                    <h1 className='text-lg font-bold text-gray-800 dark:text-gray-200 '>
                        For Candidates
                    </h1>
                    <p className='footer__link'>Browse Jobs</p>
                    <p className='footer__link'>Browse Categories</p>
                    <p className='footer__link'>Candidate Dashboard</p>
                    <p className='footer__link'>Job Alerts</p>
                    <p className='footer__link'>My Bookmarks</p>
                </div>
                 {/* 3rd part */}
                <div className='space-y-6'>
                    <h1 className='text-lg font-bold text-gray-800 dark:text-gray-200 '>
                        For Employers
                    </h1>
                    <p className='footer__link'>Browse Candidates</p>
                    <p className='footer__link'>Employer Dashboard</p>
                    <p className='footer__link'>Add Job</p>
                    <p className='footer__link'>Job Packages</p>
                </div>
                 {/* 4th part */}
                <div className='space-y-6'>
                    <h1 className='text-lg font-bold text-gray-800 dark:text-gray-200 '>
                        About Us
                    </h1>
                    <p className='footer__link'>Job page</p>
                    <p className='footer__link'>Job Page Alternative</p>
                    <p className='footer__link'>Resume Page</p>
                    <p className='footer__link'>Blog</p>
                    <p className='footer__link'>Contact</p>
                </div>
                 {/* 5th part */}
                <div className='space-y-6'>
                    <h1 className='text-lg font-bold text-gray-800 dark:text-gray-200 '>
                        Helpful Resourses
                    </h1>
                    <p className='footer__link'>Site Map</p>
                    <p className='footer__link'>Terms of Use</p>
                    <p className='footer__link'>Privacy Center</p>
                    <p className='footer__link'>Security Center</p>
                    <p className='footer__link'>Accessibility Center</p>
                </div>
            </div>
            <div className='pt-6 mt-10 border-t w-[90%] mx-auto border-gray-300 dark:border-gray-800'>
                <p className='text-gray-500'>© 2025 webdevwarriors. All Right Reserved.</p>
            </div>
        </div>
    )
}

export default Footer