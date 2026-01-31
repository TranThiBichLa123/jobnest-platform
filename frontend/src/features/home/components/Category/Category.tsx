'use client'
import React, { useEffect, useState } from 'react'
import SelectionHeading from '@/shared/components/Helper/SelectionHeading'
import { PiPaintBrushDuotone } from 'react-icons/pi'
import { IoMegaphoneOutline } from 'react-icons/io5'
import { GiTakeMyMoney } from 'react-icons/gi'
import { FaLaptopCode } from 'react-icons/fa'
import { LuRocket } from 'react-icons/lu'
import { RiCustomerService2Fill } from 'react-icons/ri'
import { MdOutlineMedicalServices } from 'react-icons/md'
import { LiaCarSideSolid } from 'react-icons/lia'
import CategoryCard from './CategoryCard'
import Link from 'next/link'
import { jobApi } from '@/shared/api'

// Icon mapping for categories
const categoryIcons: { [key: string]: React.JSX.Element } = {
  "Accounting / Finance": <GiTakeMyMoney className='w-10 h-10 text-blue-700 dark:text-white' />,
  "Marketing": <IoMegaphoneOutline className='w-10 h-10 text-blue-700 dark:text-white' />,
  "Design": <PiPaintBrushDuotone className='w-10 h-10 text-blue-700 dark:text-white' />,
  "Development": <FaLaptopCode className='w-10 h-10 text-blue-700 dark:text-white' />,
  "Project Management": <LuRocket className='w-10 h-10 text-blue-700 dark:text-white' />,
  "Customer Service": <RiCustomerService2Fill className='w-10 h-10 text-blue-700 dark:text-white' />,
  "Health and Care": <MdOutlineMedicalServices className='w-10 h-10 text-blue-700 dark:text-white' />,
  "Automotive Jobs": <LiaCarSideSolid className='w-10 h-10 text-blue-700 dark:text-white' />,
};

const Category = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await jobApi.getCategoryStats();
      
      // Data now comes with full category info from backend
      const categoriesWithIcons = data.map((cat: any, index: number) => ({
        id: cat.id,
        categoryName: cat.name,
        openPosition: cat.openPositions,
        icon: categoryIcons[cat.name] || <FaLaptopCode className='w-10 h-10 text-blue-700 dark:text-white' />
      }));

      setCategories(categoriesWithIcons);
      
      // Calculate total jobs
      const total = data.reduce((sum: number, cat: any) => sum + cat.openPositions, 0);
      setTotalJobs(total);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to empty array
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='pt-16 pb-16'>
        <SelectionHeading heading='Popular Job Categories' subHeading='Loading categories...' />
      </div>
    );
  }

  return (
    <div className='pt-16 pb-16'>
      <SelectionHeading 
        heading='Popular Job Categories'
        subHeading={`${totalJobs} jobs live across ${categories.length} categories`}
      />
      <div className='w-[80%] mx-auto mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {categories.map((category, index) => {
          return <div key={category.id} data-aos='faded-right' data-aos-anchor-placement='top-center' data-aos-delay={index*100}>
            <Link href={`/jobs?category=${encodeURIComponent(category.categoryName)}`}>
              <CategoryCard category={category}/>
            </Link>
          </div>
        })}
      </div>
    </div>
  )
}

export default Category
