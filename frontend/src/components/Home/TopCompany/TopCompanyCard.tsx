"use client"
import Image from 'next/image';
import React from 'react'
import { GrLocation } from 'react-icons/gr';
import Link from 'next/link';

type Props = {
    data: {
        id: number;
        logoUrl?: string;
        name: string;
        address?: string;
        openPositions?: number;
    }
}


const TopCompanyCard = ({ data }: Props) => {
    const logoSrc = data.logoUrl || '/images/default-company.png';
    const location = data.address || 'Not specified';
    const positions = data.openPositions || 0;

    return (
        <Link href={`/jobs?company=${encodeURIComponent(data.name)}`} className='no-underline'>
            <div className='bg-gray-100 dark:bg-gray-800 rounded-lg p-6 m-3'>
            <Image
                src={logoSrc}
                alt={data.name}
                width={80}
                height={80}
                className='object-cover mx-auto' />
            <h1 className='text-lg font-medium mt-4 text-center text-gray-800 dark:text-gray-200'>
                {data.name}
            </h1>
            <div className='text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1 text-center justify-center mt-3'>
                <GrLocation />
                <p>{location}</p>
            </div>
            <div className='px-10 py-3 bg-blue-700/10 cursor-pointer hover:bg-blue-800 transition-all duration-300
            hover:text-white text-blue-800 dark:text-gray-200 rounded-lg mt-4 text-sm text-center'>
               {positions} Open Position{positions !== 1 ? 's' : ''}{" "} 
            </div>
            </div>
        </Link>
    )
}

export default TopCompanyCard