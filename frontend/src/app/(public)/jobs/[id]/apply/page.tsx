"use client";

import { useState, useContext, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BiUpload, BiCheckCircle } from "react-icons/bi";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { applicationApi, candidateProfileApi, cvApi } from "@/shared/api";
import { server } from "@/config/env";
import useFetch from "@/shared/hooks/useFetch";
import { Job } from "@/shared/types/job";
import { CandidateCV } from "@/shared/types/cv";

// All countries in the world
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const auth = useContext(AuthContext);

  const { data: job, loading: jobLoading } = useFetch<Job>(`${server}/api/jobs/${jobId}`);
  const [loading, setLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [myCVs, setMyCVs] = useState<CandidateCV[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);

  // Form state
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Country dropdown state
  const [showCountryList, setShowCountryList] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(countries);

  // Handle country input change with filtering
  const handleCountryChange = (value: string) => {
    setCountry(value);
    const filtered = countries.filter(c => 
      c.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCountries(filtered);
    setShowCountryList(true);
  };

  // Select country from dropdown
  const selectCountry = (countryName: string) => {
    setCountry(countryName);
    setShowCountryList(false);
    setFilteredCountries(countries);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      // For now, we'll convert to base64 or you can upload to cloud storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if already applied
  useEffect(() => {
    if (auth?.user && jobId) {
      applicationApi.checkIfApplied(Number(jobId))
        .then(res => {
          if (res.hasApplied) {
            setHasApplied(true);
            alert("You have already applied for this job!");
            router.push(`/jobs/${jobId}`);
          }
        })
        .catch(err => {
          // Silently handle 403/401 - user might not have candidate profile yet
          if (err?.response?.status !== 403 && err?.response?.status !== 401) {
            console.error("Error checking application status:", err);
          }
        });
    }
  }, [auth?.user, jobId, router]);

  // Load user profile data
  useEffect(() => {
    if (auth?.user) {
      setEmail(auth.user.email);
      
      // Load candidate profile and autofill all available fields
      candidateProfileApi.getMyProfile()
        .then(profile => {
          // Autofill all fields from profile
          setFullName(profile.fullName || "");
          setPhone(profile.phoneNumber || "");
          
          // Optionally prefill cover letter with aboutMe
          // User can edit this for each specific job application
          if (profile.aboutMe) {
            setCoverLetter(profile.aboutMe);
          }
        })
        .catch(err => {
          // Silently handle 403/401 - user might not have candidate profile yet
          if (err?.response?.status !== 403 && err?.response?.status !== 401) {
            console.log("Error loading profile:", err);
          }
        });

      // Load user's CVs
      setLoadingCVs(true);
      cvApi.getMyCVs()
        .then(cvs => {
          setMyCVs(cvs);
          // Auto-select default CV if exists
          const defaultCV = cvs.find((cv: CandidateCV) => cv.isDefault);
          if (defaultCV) {
            setSelectedCvId(defaultCV.id);
          }
        })
        .catch(err => {
          // Silently handle 403/401 - user might not have candidate profile yet
          if (err?.response?.status !== 403 && err?.response?.status !== 401) {
            console.error("Error loading CVs:", err);
          }
          setMyCVs([]);
        })
        .finally(() => setLoadingCVs(false));
    }
  }, [auth?.user]);

  // Open confirmation dialog before calling API
  const openConfirmDialog = (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth?.user) {
      alert("Please login to apply");
      router.push("/");
      return;
    }

    if (!selectedCvId) {
      alert("Please select a CV to submit");
      return;
    }

    setShowConfirmDialog(true);
  };

  // Perform the actual API call
  const performApply = async () => {
    setLoading(true);
    try {
      await applicationApi.applyForJob(Number(jobId), {
        cvId: selectedCvId as number,
        coverLetter: coverLetter.trim() || undefined,
        resumeUrl: resumeUrl.trim() || undefined,
      });

      alert("Application submitted successfully!");
      router.push(`/jobs/${jobId}`);
    } catch (error: any) {
      console.error("Error applying:", error);
      alert(error.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  // Confirm button in dialog
  const confirmSubmit = async () => {
    setShowConfirmDialog(false);
    await performApply();
  };

  // Cancel button in dialog
  const cancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  if (!auth?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Please login to apply
          </h1>
          <Link href="/" className="text-cyan-600 hover:underline">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (jobLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Job Not Found</h1>
          <Link href="/jobs" className="text-cyan-600 hover:underline">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Job Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            {job.companyLogo && (
              <img
                src={job.companyLogo}
                alt={job.companyName || "Company"}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {job.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {job.companyName} • {job.location}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "Recently posted"}
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Submit Your Application
          </h2>

          <form onSubmit={openConfirmDialog} className="space-y-6">
            {/* CV Selection */}
            <div>
              <label className="block font-medium dark:text-gray-200 mb-2">
                Select CV to Submit <span className="text-red-500">*</span>
              </label>
              {loadingCVs ? (
                <div className="py-4 text-center text-gray-500">Loading your CVs...</div>
              ) : myCVs.length > 0 ? (
                <div className="space-y-2">
                  {myCVs.map((cv) => (
                    <div
                      key={cv.id}
                      onClick={() => setSelectedCvId(cv.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedCvId === cv.id
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-cyan-300 dark:hover:border-cyan-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium dark:text-white">{cv.title}</h4>
                            {cv.isDefault && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {cv.fileName} • {(cv.fileSize / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        {selectedCvId === cv.id && (
                          <BiCheckCircle className="text-2xl text-cyan-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You don't have any CVs uploaded yet.
                  </p>
                  <Link
                    href="/profile"
                    className="inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  >
                    Go to Profile to Upload CV
                  </Link>
                </div>
              )}
            </div>

            {/* Resume/CV - Now optional, kept for backward compatibility */}
            {myCVs.length > 0 && (
              <div>
                <label className="block font-medium dark:text-gray-200 mb-2">
                  Additional Resume Link (Optional)
                </label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block font-medium dark:text-gray-200 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-medium dark:text-gray-200 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                required
                className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Country - Combo box */}
            <div>
              <label className="block font-medium dark:text-gray-200 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  onFocus={() => setShowCountryList(true)}
                  onBlur={() => setTimeout(() => setShowCountryList(false), 200)}
                  placeholder="Type or select a country"
                  required
                  className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:border-cyan-500"
                />
                {showCountryList && filteredCountries.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCountries.map((c) => (
                      <div
                        key={c}
                        onClick={() => selectCountry(c)}
                        className="px-4 py-2 hover:bg-cyan-100 dark:hover:bg-cyan-600 cursor-pointer dark:text-white"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium dark:text-gray-200 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Cover Letter / Short Bio */}
            <div>
              <label className="block font-medium dark:text-gray-200 mb-2">
                Cover Letter / Short Bio
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're a great fit for this position..."
                rows={6}
                className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:border-cyan-500 resize-y min-h-[120px]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedCvId}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
            >
              {loading ? "Submitting Application..." : "Submit Application"}
            </button>

            {!selectedCvId && myCVs.length > 0 && (
              <p className="text-center text-red-500 text-sm">
                Please select a CV to continue
              </p>
            )}
            {showConfirmDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
                  <h3 className="text-lg font-semibold mb-4">Confirm Application</h3>
                  <p className="mb-2"><strong>Job:</strong> {job?.title}</p>
                  <p className="mb-2"><strong>CV:</strong> {myCVs.find(c => c.id === selectedCvId)?.fileName ?? resumeFile?.name ?? (resumeUrl ? 'Uploaded file' : 'None')}</p>
                  {coverLetter && (
                    <div className="mb-2">
                      <strong>Cover Letter:</strong>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{coverLetter}</p>
                    </div>
                  )}
                  <div className="mt-4 flex gap-3 justify-end">
                    <button type="button" onClick={cancelSubmit} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                    <button type="button" onClick={confirmSubmit} className="px-4 py-2 bg-cyan-600 text-white rounded-md">Confirm</button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
