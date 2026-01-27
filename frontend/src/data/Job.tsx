'use client'
import React, { useEffect, useState } from 'react'
import SelectionHeading from '../components/shared/Helper/SelectionHeading'
import JobCard from '../components/Home/Job/JobCard'
import useFetch from '@/hooks/useFetch'
import { server } from '@/lib/config'

const Job = () => {
    const { data: jobs, loading } = useFetch(`${server}/api/jobs?size=9`);

    return (
        <div className='pt-16 pb-16 '>
            <SelectionHeading
                heading='Featured Jobs'
                subHeading='Know your worth and find the job that qualify your life'
            />
            {loading ? (
                <div className='text-center py-20'>
                    <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                    <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading featured jobs...</p>
                </div>
            ) : (
                <div className='w-[95%] sm:w-[80%] mt-16 mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 items-center'>
                    {(Array.isArray(jobs) ? jobs : []).slice(0, 9).map((job: any, index: number) => (
                        <div key={job.id}
                            data-aos="fade-up"
                            data-aos-anchor-placement="top-center"
                            data-aos-delay={index*100}
                        >
                            <JobCard job={job} />
                        </div>
                    ))}
                </div>
            )}
            <div className='mt-10 text-center'>
                <div>
                    <a href="/jobs" className='px-10 py-4 bg-blue-700 text-white cursor-pointer rounded-lg hover:to-blue-800
        transition-all duration-200 inline-block'>
                        Load More Listing
                    </a>
                </div>
            </div>

        </div>

    )
}

export default Job