'use client'
import React from 'react'
import SelectionHeading from '@/shared/components/Helper/SelectionHeading'
import dynamic from 'next/dynamic';
const Carousel = dynamic(() => import('react-multi-carousel'), { ssr: false });
import 'react-multi-carousel/lib/styles.css';
import ReviewCard from './ReviewCard';


const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1324 },
        items: 1,
        slidesToSlide: 1 // optional, default to 1.
    },
    tablet: {
        breakpoint: { max: 1324, min: 764 },
        items: 1,
        slidesToSlide: 1 // optional, default to 1.
    },
    mobile: {
        breakpoint: { max: 764, min: 0 },
        items: 1,
        slidesToSlide: 1 // optional, default to 1.
    }
};

const Review = () => {
    return (
        <div className='pt-16 pb-16'>
            <SelectionHeading
                heading="Testimonials From Customers"
                subHeading="Lorem ipsum dolor sit amet elit, sed do eiusmod tempor"
            />
            <div className='w-[80%] mx-auto mt-16'>
                <Carousel showDots={false}
                    responsive={responsive}
                    infinite={true}
                    autoPlay={true}
                    autoPlaySpeed={4000}>
                    <ReviewCard image="/images/u1.png"
                        title="Great Quality"
                        username="Jasica Doe"
                        userRole="App Developer" />

                    <ReviewCard image="/images/u2.png"
                        title="Awesome Work!"
                        username="Jason Doe"
                        userRole="Web Developer" />

                    <ReviewCard image="/images/u3.png"
                        title="Best Work!"
                        username="Jenny Doe"
                        userRole="Game Developer" />


                </Carousel>
            </div>
        </div>
    )
}

export default Review