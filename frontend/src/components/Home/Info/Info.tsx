'use client'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { BiCheck } from 'react-icons/bi'
import AOS from 'aos'
import 'aos/dist/aos.css'

const Info = () => {
  useEffect(() => {
    AOS.init({ once: true, duration: 600, offset: 60 })
  }, [])

  return (
    <section className="pt-16 pb-16">
      <div className="w-[80%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Image content */}
        <div
          data-aos="fade-left"                // <-- sửa tên hiệu ứng
          data-aos-anchor-placement="top-center"
        >
          <Image
            src="/images/a.png"
            alt="image"
            width={1000}
            height={1000}
            priority
            className="w-full h-auto"
          />
        </div>

        {/* Text content */}
        <div
          data-aos="fade-right"               // <-- sửa tên hiệu ứng
          data-aos-anchor-placement="top-center"
          data-aos-delay="150"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-8 lg:leading-[4rem]">
            Get applications from the world’s best talents.
          </h1>

          <p className="mt-6 text-gray-700 dark:text-gray-300">
            Search all the open positions on the web. Get your own personalized salary estimate.
            Read reviews on over 600,000 companies worldwide.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2">
              <BiCheck className="w-7 h-7 text-pink-600" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Bring to the table win-win survival
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BiCheck className="w-7 h-7 text-pink-600" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Capitalize on low hanging fruit to identify
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BiCheck className="w-7 h-7 text-pink-600" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                But I must explain to you how all this
              </span>
            </div>
          </div>

          <div className="mt-8">
            <button className="px-10 py-3 bg-blue-800 rounded-lg text-white hover:bg-blue-950 transition">
              Post a Job
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Info
