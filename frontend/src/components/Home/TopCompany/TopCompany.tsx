'use client'
import React, { useEffect, useState } from 'react'
import SelectionHeading from '../../shared/Helper/SelectionHeading'
import dynamic from 'next/dynamic';
const Carousel = dynamic(() => import('react-multi-carousel'), { ssr: false });
import 'react-multi-carousel/lib/styles.css';
import TopCompanyCard from './TopCompanyCard';
import { companyApi } from '@/lib/api';

const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1324 },
        items: 4,
        slidesToSlide: 1 // optional, default to 1.
    },
    tablet: {
        breakpoint: { max: 1324, min: 764 },
        items: 2,
        slidesToSlide: 1 // optional, default to 1.
    },
    mobile: {
        breakpoint: { max: 764, min: 0 },
        items: 1,
        slidesToSlide: 1 // optional, default to 1.
    }
};

// Fallback mock data when API returns empty
const MOCK_COMPANY_DATA = [
    {
        id: 1,
        logoUrl: "/images/c1.png",
        name: "Udemy",
        address: "London, UK",
        openPositions: 20
    },
    {
        id: 2,
        logoUrl: "/images/c2.png",
        name: "Stripe",
        address: "Kolkata, India",
        openPositions: 30
    },
    {
        id: 3,
        logoUrl: "/images/c3.png",
        name: "Dropbox",
        address: "Lahore, Pakistan",
        openPositions: 33
    },
    {
        id: 4,
        logoUrl: "/images/c4.png",
        name: "Figma",
        address: "Dhaka, Bangladesh",
        openPositions: 40
    }
];

const TopCompany = () => {
    const [companies, setCompanies] = useState<any[]>(MOCK_COMPANY_DATA);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopCompanies = async () => {
            try {
                const data = await companyApi.getTopCompanies();
                if (data && data.length > 0) {
                    setCompanies(data);
                }
            } catch (error) {
                console.error('Failed to fetch top companies:', error);
                // Keep using mock data on error
            } finally {
                setLoading(false);
            }
        };

        fetchTopCompanies();
    }, []);

    return <div className='pt-16 pb-16'>
        <SelectionHeading
            heading='Top Company Registered'
            subHeading="Some of the companies we've helped recruit excellent applicants over the years."
        />
        <div className='w-[80%] mx-auto mt-16'>
            <Carousel

                showDots={false}
                responsive={responsive}
                infinite={true}
                autoPlay={true}
                autoPlaySpeed={4000}

            >
             {companies.map((data)=>{
                return <TopCompanyCard key={data.id} data={data}/>
             })}
            </Carousel>
        </div>
    </div>

}

export default TopCompany