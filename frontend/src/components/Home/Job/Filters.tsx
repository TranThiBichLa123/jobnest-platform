"use client";

import React from "react";
import { filters } from "@/data/jobFilters";

const Filters = ({ selectedFilters, handleFilterChange, counts }: any) => {
  return (
    <>
      {filters.map((filter) => (
        <div className="mt-3" key={filter.name}>
          <h1 className="text-lg font-semibold capitalize dark:text-white">
            {filter.label}
          </h1>

          {filter.filters.map((filterValue: string) => (
            <div className="mt-3" key={filterValue}>
              
              <div className="flex items-center justify-between w-full">

                {/* Checkbox + Text */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id={filterValue}
                    value={filterValue}
                    checked={(selectedFilters?.[filter.name] || []).includes(filterValue)}
                    onChange={(e) =>
                      handleFilterChange(
                        filter.name,
                        filterValue,
                        e.target.checked
                      )
                    }
                    className="
                      h-4 w-4 cursor-pointer rounded 
                      border-2 border-cyan-700 
                      text-cyan-700 
                      focus:ring-cyan-700
                      
                      dark:border-cyan-500 
                      dark:text-cyan-500

                      checked:bg-cyan-700 
                      checked:border-cyan-700

                      dark:checked:bg-cyan-500
                      dark:checked:border-cyan-500
                    "
                  />

                  <span className="capitalize text-sm dark:text-gray-300">
                    {filterValue}
                  </span>
                </label>

                {/* Count */}
                <span className="px-2 py-[2px] text-sm 
                  bg-slate-200 dark:bg-[var(--dark-card)] 
                  rounded-md dark:text-gray-200"
                >
                  {counts?.[filterValue] ?? 0}
                </span>

              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default Filters;
