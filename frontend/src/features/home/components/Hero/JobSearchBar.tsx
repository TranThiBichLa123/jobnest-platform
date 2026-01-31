"use client";

import { useRouter } from "next/navigation";
import React, { useState } from 'react';
import { FaMap } from 'react-icons/fa';
import { MdSearch } from 'react-icons/md';

const JobSearchBar = ({ 
    onSearchChange,
    handleInputChange,
    handleItemClick,
    searchQueries,
    showAutoComplete,
    autoCompletedResults,
    reset,
    isJobsPage = false  // New prop to identify if it's on jobs page
}: any) => {
    const router = useRouter();
    
    // Local state for when component is used standalone (e.g., on Home page)
    const [localTitle, setLocalTitle] = useState("");
    const [localLocation, setLocalLocation] = useState("");
    
    // Use parent's searchQueries if provided, otherwise use local state
    const titleValue = searchQueries?.title ?? localTitle;
    const locationValue = searchQueries?.location ?? localLocation;

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (handleInputChange) {
            handleInputChange(e);
        } else {
            setLocalTitle(value);
        }
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (handleInputChange) {
            handleInputChange(e);
        } else {
            setLocalLocation(value);
        }
    };

    const handleSearch = () => {
        // If on jobs page with reset function, clear filters
        if (isJobsPage && reset) {
            reset();
            return;
        }

        // If parent provides onSearchChange callback, use it
        if (onSearchChange) {
            onSearchChange({ title: titleValue, location: locationValue });
            return;
        }

        // Otherwise navigate to jobs page (for Home page usage)
        router.push(`/jobs?title=${titleValue || ''}&location=${locationValue || ''}`);
    };

    return (
        <div className="w-full mt-8">
            <div className="flex flex-col md:flex-row bg-white dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      shadow-md rounded-xl overflow-hidden">

                {/* Job Title */}
                <div className="relative flex items-center w-full md:w-1/2
                        px-4 py-3 sm:py-4
                        border-b md:border-b-0 md:border-r
                        border-slate-200 dark:border-slate-700">
                    <MdSearch className="text-slate-500 text-xl mr-2" />
                    <input type="text"
                        name="title"
                        className="flex-1 h-10 bg-transparent outline-none
                       text-slate-900 dark:text-slate-100"
                        placeholder="Job title or company"
                        value={titleValue}
                        onChange={handleTitleChange}
                    />
                    {showAutoComplete?.title && autoCompletedResults?.title?.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 shadow-lg mt-1 w-full z-[100] rounded-md max-h-60 overflow-y-auto">
                            {autoCompletedResults.title.slice(0, 6).map((j: any) => (
                                <div 
                                    key={j.id} 
                                    className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-gray-600 cursor-pointer text-black dark:text-white border-b dark:border-gray-600 last:border-b-0" 
                                    onClick={() => handleItemClick && handleItemClick('title', j.title)}
                                >
                                    {j.title}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Location */}
                <div className="relative flex items-center w-full md:w-1/2 px-4 py-3 sm:py-4">
                    <FaMap className="text-slate-500 text-xl mr-2" />
                    <input type="text"
                        name="location"
                        className="flex-1 h-10 bg-transparent outline-none
                       text-slate-900 dark:text-slate-100"
                        placeholder="City or postcode"
                        value={locationValue}
                        onChange={handleLocationChange}
                    />
                    {showAutoComplete?.location && autoCompletedResults?.location?.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 shadow-lg mt-1 w-full z-[100] rounded-md max-h-60 overflow-y-auto">
                            {autoCompletedResults.location.slice(0, 6).map((j: any) => (
                                <div 
                                    key={j.id} 
                                    className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-gray-600 cursor-pointer text-black dark:text-white border-b dark:border-gray-600 last:border-b-0" 
                                    onClick={() => handleItemClick && handleItemClick('location', j.company_location)}
                                >
                                    {j.company_location}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-8 sm:py-6 py-3 cursor-pointer 
                               text-sm md:text-base w-full md:w-auto min-w-[120px] 
                               whitespace-nowrap hover:bg-blue-700 transition"
                >
                    {isJobsPage ? 'Clear Filters' : 'Find Jobs'}
                </button>

            </div>
        </div>
    );
};

export default JobSearchBar;
