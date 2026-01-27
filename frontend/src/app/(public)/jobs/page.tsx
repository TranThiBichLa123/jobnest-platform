"use client";

import { useEffect, useState, useMemo } from "react";
import ReactPaginate from "react-paginate";
import {
  FiChevronsRight,
  FiChevronsLeft,
  FiChevronDown,
  FiDelete,
} from "react-icons/fi";
import { BiFilterAlt } from "react-icons/bi";
import Filters from "@/components/Home/Job/Filters";
import JobList from "@/components/Home/Job/JobList";
import { filters } from "@/data/jobFilters";
import JobSearchBar from "@/components/Home/Hero/JobSearchBar";
// SearchFilters might not exist in your project; we'll implement a small inline version below
import useFetch from "@/hooks/useFetch";
import { server } from "@/lib/config";
import { useSearchParams } from 'next/navigation';

// Stable mock jobs used when the API returns an empty list. Kept at module scope
// so the array identity doesn't change between renders and cause effect loops.
const MOCK_JOBS = [
  {
    id: "mock-1",
    title: "Frontend Developer",
    companyName: "Udemy",
    location: "Hanoi, VN",
    companyLogo: "/images/j1.png",
    type: "fulltime",
    experience: "1 - 2 Years",
    experienceLevel: "Entry Level",
    education: "Bachelor's Degree",
    description: "Build and maintain user interfaces using React and Next.js.",
    skills: "React,TypeScript,Next.js",
    salaryRange: "$40k -55k",
    minSalary: 40000,
    maxSalary: 55000,
    categoryName: "Development",
    isUrgent: false,
  },
  {
    id: "mock-2",
    title: "Backend Developer",
    companyName: "Beta Solutions",
    location: "Ho Chi Minh City, VN",
    companyLogo: "/images/j2.png",
    type: "parttime",
    experience: "2 - 6 Years",
    experienceLevel: "Mid Level",
    education: "Bachelor's Degree",
    description: "Design REST APIs with Spring Boot and Java.",
    skills: "Java,Spring,SQL",
    salaryRange: "$55k - 85k",
    minSalary: 55000,
    maxSalary: 85000,
    categoryName: "Development",
    isUrgent: false,
  },
  {
    id: "mock-3",
    title: "UI/UX Designer",
    companyName: "Creative Studio",
    location: "Da Nang, VN",
    companyLogo: "/images/j3.png",
    type: "fulltime",
    experience: "2 - 6 Years",
    experienceLevel: "Mid Level",
    education: "Associate Studies",
    description: "Design interfaces and experiences for web applications.",
    skills: "Figma,UX,Prototyping",
    salaryRange: "$55k - 85k",
    minSalary: 55000,
    maxSalary: 85000,
    categoryName: "Design",
    isUrgent: true,
  },
  {
    id: "mock-4",
    title: "DevOps Engineer",
    companyName: "CloudOps",
    location: "Remote",
    companyLogo: "/images/j4.png",
    type: "remote",
    experience: "Over 6 Years",
    experienceLevel: "Senior Level",
    education: "Masters Degree",
    description: "Maintain CI/CD pipelines and cloud infrastructure.",
    skills: "AWS,Docker,Kubernetes",
    salaryRange: "$115k - 145k",
    minSalary: 115000,
    maxSalary: 145000,
    categoryName: "Development",
    isUrgent: false,
  },
  {
    id: "mock-5",
    title: "QA Engineer",
    companyName: "QualityWorks",
    location: "Hanoi, VN",
    companyLogo: "/images/j5.png",
    type: "fulltime",
    experience: "1 - 2 Years",
    experienceLevel: "Entry Level",
    education: "Vocational Course",
    description: "Ensure product quality through testing and automation.",
    skills: "Selenium,Testing",
    salaryRange: "$40k -55k",
    minSalary: 40000,
    maxSalary: 55000,
    categoryName: "Development",
    isUrgent: false,
  },
  {
    id: "mock-6",
    title: "Product Manager",
    companyName: "Prodify",
    location: "Hanoi, VN",
    companyLogo: "/images/j6.png",
    type: "fulltime",
    experience: "2 - 6 Years",
    experienceLevel: "Mid Level",
    education: "Masters Degree",
    description: "Lead product direction and roadmap.",
    skills: "Roadmapping,Stakeholder Management",
    salaryRange: "$85k - 115k",
    minSalary: 85000,
    maxSalary: 115000,
    categoryName: "Project Management",
    isUrgent: false,
  },
  {
    id: "mock-7",
    title: "Data Scientist",
    companyName: "Insight Labs",
    location: "Ho Chi Minh City, VN",
    companyLogo: "/images/j7.png",
    type: "fulltime",
    experience: "2 - 6 Years",
    experienceLevel: "Mid Level",
    education: "PHD",
    description: "Analyze data and build predictive models.",
    skills: "Python,ML",
    salaryRange: "$85k - 115k",
    minSalary: 85000,
    maxSalary: 115000,
    categoryName: "Development",
    isUrgent: false,
  },
  {
    id: "mock-8",
    title: "Mobile Developer",
    companyName: "Appify",
    location: "Da Nang, VN",
    companyLogo: "/images/j8.png",
    type: "freelance",
    experience: "1 - 2 Years",
    experienceLevel: "Entry Level",
    education: "Graduated High School",
    description: "Develop mobile apps using React Native.",
    skills: "React Native,iOS,Android",
    salaryRange: "$55k - 85k",
    minSalary: 55000,
    maxSalary: 85000,
    categoryName: "Development",
    isUrgent: false,
  },
  {
    id: "mock-9",
    title: "System Administrator",
    companyName: "InfraHub",
    location: "Remote",
    companyLogo: "/images/j9.png",
    type: "remote",
    experience: "Over 6 Years",
    experienceLevel: "Senior Level",
    education: "Associate Studies",
    description: "Manage servers and networks.",
    skills: "Linux,Networking",
    salaryRange: "$115k - 145k",
    minSalary: 115000,
    maxSalary: 145000,
    categoryName: "Development",
    isUrgent: true,
  },
  {
    id: "mock-10",
    title: "Technical Writer",
    companyName: "DocsCo",
    location: "Hanoi, VN",
    companyLogo: "/images/l1.png",
    type: "parttime",
    experience: "Under 1 Year",
    experienceLevel: "Entry Level",
    education: "Bachelor's Degree",
    description: "Write technical documentation and guides.",
    skills: "Writing,Markdown",
    salaryRange: "$40k -55k",
    minSalary: 40000,
    maxSalary: 55000,
    categoryName: "Marketing",
    isUrgent: false,
  },
  {
    id: "mock-11",
    title: "Sales Engineer",
    companyName: "SalesTech",
    location: "Ho Chi Minh City, VN",
    companyLogo: "/images/l2.png",
    type: "fulltime",
    experience: "2 - 6 Years",
    experienceLevel: "Mid Level",
    education: "Bachelor's Degree",
    description: "Support sales with technical expertise.",
    skills: "Pre-sales,Demos",
    salaryRange: "$85k - 115k",
    minSalary: 85000,
    maxSalary: 115000,
    categoryName: "Marketing",
    isUrgent: false,
  },
  {
    id: "mock-12",
    title: "Customer Success",
    companyName: "HappyClients",
    location: "Da Nang, VN",
    companyLogo: "/images/l3.png",
    type: "fulltime",
    experience: "1 - 2 Years",
    experienceLevel: "Entry Level",
    education: "Vocational Course",
    description: "Ensure customers achieve value from our product.",
    skills: "Support,Onboarding",
    salaryRange: "$55k - 85k",
    minSalary: 55000,
    maxSalary: 85000,
    categoryName: "Customer Service",
    isUrgent: false,
  },
];

// Helper functions to convert backend data to filter format
const formatJobTypeForFilter = (type?: string) => {
  if (!type) return null;
  const typeMap: { [key: string]: string } = {
    'fulltime': 'Full Time',
    'parttime': 'Part Time',
    'remote': 'Remote',
    'contract': 'Contract',
    'freelance': 'Freelance',
    'internship': 'Internship',
  };
  return typeMap[type.toLowerCase()] || type;
};

const formatSalaryRangeForFilter = (minSalary?: number, maxSalary?: number) => {
  if (!minSalary || !maxSalary) return null;
  
  // Match the filter ranges
  if (minSalary >= 40000 && maxSalary <= 55000) return "$40k -55k";
  if (minSalary >= 55000 && maxSalary <= 85000) return "$55k - 85k";
  if (minSalary >= 85000 && maxSalary <= 115000) return "$85k - 115k";
  if (minSalary >= 115000 && maxSalary <= 145000) return "$115k - 145k";
  if (minSalary >= 145000 && maxSalary <= 175000) return "$145k - 175k";
  
  // Fallback: check which range it falls into
  const avgSalary = (minSalary + maxSalary) / 2;
  if (avgSalary < 55000) return "$40k -55k";
  if (avgSalary < 85000) return "$55k - 85k";
  if (avgSalary < 115000) return "$85k - 115k";
  if (avgSalary < 145000) return "$115k - 145k";
  return "$145k - 175k";
};

// Get job value for filtering
const getJobValueForFilter = (job: any, filterName: string) => {
  switch(filterName) {
    case 'category':
      return job.categoryName || job.category;
    case 'type_of_employment':
      return formatJobTypeForFilter(job.type);
    case 'experience_level':
      return job.experienceLevel || job.experience_level;
    case 'salary_range':
      return formatSalaryRangeForFilter(job.minSalary, job.maxSalary);
    case 'experience':
      return job.experience;
    case 'education':
      return job.education;
    default:
      return job[filterName];
  }
};

export default function JobsPage() {
  const { data: jobs = [], loading } = useFetch(`${server}/api/jobs?size=100`);
  const searchParams = useSearchParams();

  // Fallback mock jobs for development / when API returns empty
  // NOTE: the real data comes from `jobs`; we use `MOCK_JOBS` when API returns empty.
  // `MOCK_JOBS` is declared at module scope to keep its identity stable between renders.
  const mockJobs = MOCK_JOBS;

  // useMemo to prevent allJobs from creating new array reference every render
  const allJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return mockJobs;
    // Show mock jobs when API returns empty or is still loading with no data
    if (jobs.length === 0) return mockJobs;
    return jobs;
  }, [jobs, mockJobs]);

  // Get current date formatted
  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };



  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  // Autocomplete / Search inputs
  const [searchQueries, setSearchQueries] = useState({ title: "", location: "" });
  const [showAutoComplete, setShowAutoComplete] = useState({ title: false, location: false });
  const [autoCompletedResults, setAutoCompletedResults] = useState({ title: [], location: [] });

  // Mobile filter modal
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const handleCloseFiltermenu = (e: any) => {
    if (e.target.classList && e.target.classList.contains("filter-modal")) setIsFilterMenuOpen(false);
  };

  // Sort functionality
  const [sortBy, setSortBy] = useState("recent");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showSortDropdown && !target.closest('.sort-dropdown-container')) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSortDropdown]);

  // read query params (category, company, title, location) and prefill search/filters
  useEffect(() => {
    if (!searchParams) return;
    const category = searchParams.get("category");
    const company = searchParams.get("company");
    const title = searchParams.get("title");
    const location = searchParams.get("location");

    if (title) setSearchQueries((prev) => ({ ...prev, title }));
    if (location) setSearchQueries((prev) => ({ ...prev, location }));
    // clicking company cards from Home should prefill the title search with company name
    if (company) setSearchQueries((prev) => ({ ...prev, title: company }));

    if (category) {
      setSelectedFilters((prev) => ({ ...(prev || {}), category: [category] }));
    }
  }, [searchParams]);

  useEffect(() => {
    setAutoCompletedResults((prev: any) => ({
      ...prev,
      title: filterJobsByField(allJobs, "title", searchQueries.title),
    }));
  }, [allJobs, searchQueries.title]);

  useEffect(() => {
    setAutoCompletedResults((prev: any) => ({
      ...prev,
      location: filterJobsByField(allJobs, "company_location", searchQueries.location),
    }));
  }, [allJobs, searchQueries.location]);

  // removed `type` text search - type is handled by checkbox filters

  function filterJobsByField(jobsList: any[], field: string, q: string) {
    if (!q) return [];
    return jobsList.filter((job: any) => (job[field] || "").toLowerCase().includes(q.toLowerCase()));
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setSearchQueries((prev) => ({ ...prev, [name]: value }));
    setShowAutoComplete((prev) => ({ ...prev, [name]: !!value }));
  };

  const handleItemClick = (name: string, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [name]: value }));
    setShowAutoComplete((prev) => ({ ...prev, [name]: false }));
  };

  const handleFilterChange = (filterName: string, filterValue: string, isChecked: boolean) => {
    setSelectedFilters((prev: any) => {
      const updated = { ...(prev || {}) };
      if (isChecked) updated[filterName] = [...(prev?.[filterName] || []), filterValue];
      else updated[filterName] = (prev?.[filterName] || []).filter((v: string) => v !== filterValue);
      return updated;
    });
    setOffset(0);
  };

  // Combined filtering logic (search + filter checkboxes)
  let jobsToDisplay = allJobs.filter((job: any) => {
    // Search filtering
    let isTitleMatch = true;
    let isLocationMatch = true;
    let isTypeMatch = true;
    if (searchQueries.title) {
      const q = searchQueries.title.toLowerCase();
      isTitleMatch = (job.title || "").toLowerCase().includes(q) || (job.company_name || job.companyName || "").toLowerCase().includes(q);
    }
    if (searchQueries.location) isLocationMatch = (job.company_location || job.location || "").toLowerCase().includes(searchQueries.location.toLowerCase());

    // Filter checkbox logic with proper field mapping
    let matchesFilters = true;
    for (const [filterName, selectedValues] of Object.entries(selectedFilters) as [string, string[]][]) {
      if (selectedValues.length === 0) continue; // Skip empty filters
      
      const jobValue = getJobValueForFilter(job, filterName);
      
      if (!jobValue || !selectedValues.includes(jobValue)) {
        matchesFilters = false;
        break;
      }
    }

    return isTitleMatch && isLocationMatch && isTypeMatch && matchesFilters;
  });

  // Apply sorting
  jobsToDisplay = [...jobsToDisplay].sort((a, b) => {
    switch(sortBy) {
      case "recent":
        // Most recent first
        return new Date(b.postedAt || b.posted_at || 0).getTime() - new Date(a.postedAt || a.posted_at || 0).getTime();
      case "oldest":
        // Oldest first
        return new Date(a.postedAt || a.posted_at || 0).getTime() - new Date(b.postedAt || b.posted_at || 0).getTime();
      case "salary_high":
        // Highest salary first
        return (b.maxSalary || 0) - (a.maxSalary || 0);
      case "salary_low":
        // Lowest salary first
        return (a.minSalary || 0) - (b.minSalary || 0);
      case "urgent_first":
        // Urgent jobs first
        return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0);
      default:
        return 0;
    }
  });

  // counts - Calculate based on current filters (excluding the filter being counted)
  const counts: any = {};
  filters.forEach((f) => {
    f.filters.forEach((value: string) => {
      // Count jobs that match all OTHER active filters
      const matchingJobs = allJobs.filter((job: any) => {
        // Apply search filters
        let isTitleMatch = true;
        let isLocationMatch = true;
        if (searchQueries.title) {
          const q = searchQueries.title.toLowerCase();
          isTitleMatch = (job.title || "").toLowerCase().includes(q) || (job.company_name || job.companyName || "").toLowerCase().includes(q);
        }
        if (searchQueries.location) {
          isLocationMatch = (job.company_location || job.location || "").toLowerCase().includes(searchQueries.location.toLowerCase());
        }
        
        // Apply all active filters EXCEPT the current filter being counted
        let matchesOtherFilters = true;
        for (const [filterName, selectedValues] of Object.entries(selectedFilters) as [string, string[]][]) {
          // Skip the current filter being counted
          if (filterName === f.name) continue;
          if (selectedValues.length === 0) continue;
          
          const jobValue = getJobValueForFilter(job, filterName);
          
          if (!jobValue || !selectedValues.includes(jobValue)) {
            matchesOtherFilters = false;
            break;
          }
        }
        
        // Check if this job matches the current filter value
        const currentFilterValue = getJobValueForFilter(job, f.name);
        const matchesCurrentFilter = currentFilterValue === value;
        
        return isTitleMatch && isLocationMatch && matchesOtherFilters && matchesCurrentFilter;
      });
      
      counts[value] = matchingJobs.length;
    });
  });

  // Pagination
  const [offset, setOffset] = useState(0);
  const jobsPerPage = 4;
  const endOffset = offset + jobsPerPage;
  const currentJobs = jobsToDisplay.slice(offset, endOffset);
  const pageCount = Math.ceil(jobsToDisplay.length / jobsPerPage) || 0;

  const handlePageClick = (e: any) => {
    const newOffset = (e.selected * jobsPerPage) % (jobsToDisplay.length || 1);
    setOffset(newOffset);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const reset = () => {
    setSearchQueries({ title: "", location: "" });
    setSelectedFilters({});
  };

  return (
    <div className="pt-[12vh] min-h-screen bg-white dark:bg-[#0f2137]">
      <div className="w-[92%] mx-auto py-10">

        {/* Banner */}
        <div
          className="rounded-xl -mt-10 text-white bg-cover bg-center dark:bg-gray-800"
          style={{ backgroundImage: "url('/images/bg.jpg')" }}
        >
          <div className="px-6 pt-4">
            <h1 className="font-bold text-2xl">Let's find your dream Job</h1>
            <p>{getCurrentDate()}</p>
          </div>
          {/* Search Filters */}
          <div className="mt-10 ">
            <JobSearchBar
              searchQueries={searchQueries}
              handleInputChange={handleInputChange}
              handleItemClick={handleItemClick}
              showAutoComplete={showAutoComplete}
              autoCompletedResults={autoCompletedResults}
              reset={reset}
              isJobsPage={true}
            />
          </div>

        </div>

        <div className="mt-8">
          <div className="grid md:grid-cols-3 gap-x-14">
            <div className="md:col-span-1 row-start-3 md:row-start-auto h-fit md:sticky top-0">
              <div className={`filter-modal ${isFilterMenuOpen ? 'open' : ''}`} onClick={handleCloseFiltermenu}>
                <div className={`filter-dialog ${isFilterMenuOpen ? 'open' : ''}`}>
                  <div className="flex-center-between border-b dark:border-slate-800 md:hidden">
                    <p className="uppercase dark:text-white">Filters</p>
                    <div className="icon-box md:hidden" onClick={() => setIsFilterMenuOpen(false)}>
                      <FiDelete />
                    </div>
                  </div>
                  <Filters selectedFilters={selectedFilters} handleFilterChange={handleFilterChange} counts={counts} />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 mt-5 md:mt-0 h-fit md:sticky top-0">


              <div className="flex items-center justify-between mt-3 w-full">

                {/* Left side */}
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setIsFilterMenuOpen(true)}
                >
                  <div className="md:hidden icon-box bg-white dark:bg-dark-card card-shadow dark:shadow-none card-bordered !rounded-md">
                    <BiFilterAlt />
                  </div>

                  <h3 className="text-sm dark:text-white">
                    <span className="text-muted dark:text-gray-400">Showing: </span>
                    {jobsToDisplay.length} Jobs
                  </h3>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                  <p className="text-sm dark:text-gray-300">Sort by:</p>

                  <div className="relative sort-dropdown-container">
                    <div 
                      className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                    >
                      <span className="text-sm text-primary font-medium">
                        {sortBy === "recent" && "Posted Recently"}
                        {sortBy === "oldest" && "Oldest First"}
                        {sortBy === "salary_high" && "Salary: High to Low"}
                        {sortBy === "salary_low" && "Salary: Low to High"}
                        {sortBy === "urgent_first" && "Urgent First"}
                      </span>
                      <FiChevronDown className={`dark:text-gray-300 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Dropdown menu */}
                    {showSortDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="py-1">
                          <button
                            onClick={() => { setSortBy("recent"); setShowSortDropdown(false); }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${sortBy === "recent" ? "text-primary font-medium" : "text-gray-700 dark:text-gray-300"}`}
                          >
                            Posted Recently
                          </button>
                          <button
                            onClick={() => { setSortBy("oldest"); setShowSortDropdown(false); }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${sortBy === "oldest" ? "text-primary font-medium" : "text-gray-700 dark:text-gray-300"}`}
                          >
                            Oldest First
                          </button>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          <button
                            onClick={() => { setSortBy("salary_high"); setShowSortDropdown(false); }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${sortBy === "salary_high" ? "text-primary font-medium" : "text-gray-700 dark:text-gray-300"}`}
                          >
                            Salary: High to Low
                          </button>
                          <button
                            onClick={() => { setSortBy("salary_low"); setShowSortDropdown(false); }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${sortBy === "salary_low" ? "text-primary font-medium" : "text-gray-700 dark:text-gray-300"}`}
                          >
                            Salary: Low to High
                          </button>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          <button
                            onClick={() => { setSortBy("urgent_first"); setShowSortDropdown(false); }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${sortBy === "urgent_first" ? "text-primary font-medium" : "text-gray-700 dark:text-gray-300"}`}
                          >
                            Urgent First
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>


              <div className="mt-3">
                <JobList jobs={currentJobs} loading={loading} />
                {!loading && jobsToDisplay.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      No jobs found matching your filters.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedFilters({});
                        setSearchQueries({ title: "", location: "" });
                      }}
                      className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>

              {!loading && (
  <div className="mt-5 flex justify-center">
    <ReactPaginate
      breakLabel="..."
      nextLabel={<FiChevronsRight />}
      onPageChange={handlePageClick}
      pageRangeDisplayed={2}
      pageCount={pageCount}
      previousLabel={<FiChevronsLeft />}
      renderOnZeroPageCount={null}
      containerClassName="pagination"
      pageClassName="page-item"
      pageLinkClassName="page-link"
      activeClassName="active"
      previousLinkClassName="nav-btn"
      nextLinkClassName="nav-btn"
      disabledClassName="disabled"
    />
  </div>
)}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
