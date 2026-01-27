"use client";

import { useState, useContext, useEffect } from "react";
import Image from "next/image";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { candidateProfileApi, authApi } from "@/lib/api";
import { CandidateProfile } from "@/types/profile";
import CVManagement from "@/components/Candidate/CVManagement";

export default function CandidateProfileForm() {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile>({});
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [aboutMe, setAboutMe] = useState("");

  // Wait for auth to load
  useEffect(() => {
    if (!auth?.isLoading && !auth?.user) {
      router.push("/");
    }
  }, [auth, router]);

  // Load profile data
  useEffect(() => {
    if (auth?.user) {
      loadProfile();
    }
  }, [auth?.user]);

  const loadProfile = async () => {
    try {
      const data = await candidateProfileApi.getMyProfile();
      setProfile(data);
      
      // Populate form fields
      setFullName(data.fullName || auth?.user?.username || "");
      setPhoneNumber(data.phoneNumber || "");
      setDateOfBirth(data.dateOfBirth || "");
      // Convert uppercase to capitalized (MALE -> Male)
      setGender(data.gender ? data.gender.charAt(0) + data.gender.slice(1).toLowerCase() : "");
      setCurrentPosition(data.currentPosition || "");
      setYearsOfExperience(data.yearsOfExperience || "");
      setSkills(data.skills || []);
      setAboutMe(data.aboutMe || "");
    } catch (error: any) {
      // Silently handle 403 (no candidate profile) or 401 (not authenticated)
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        // Initialize with default values - user doesn't have candidate profile yet
        setFullName(auth?.user?.username || "");
      } else {
        console.error("Error loading profile:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = await candidateProfileApi.updateMyProfile({
        fullName,
        phoneNumber,
        dateOfBirth,
        gender: gender.toUpperCase(),
        currentPosition,
        yearsOfExperience,
        skills,
        aboutMe,
      });
      
      setProfile(updatedProfile);
      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (auth?.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Don't render if not logged in
  if (!auth?.user) {
    return null;
  }

  const handleAvatarChange = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setAvatar(previewUrl);
      
      try {
        // Upload to backend
        const result = await candidateProfileApi.uploadAvatar(file);
        
        // Set the actual uploaded avatar URL
        const uploadedUrl = `http://localhost:8080${result.avatarUrl}`;
        setAvatar(uploadedUrl);
        
        // Update profile state
        setProfile({ ...profile, avatarUrl: result.avatarUrl });
        
        // Reload user data from backend to update AuthContext with new avatar
        if (auth?.reloadUser) {
          await auth.reloadUser();
        }
        
        console.log("Avatar uploaded:", result.message);
        alert("Avatar uploaded successfully!");
      } catch (error: any) {
        console.error("Error uploading avatar:", error);
        alert(error.response?.data?.message || "Failed to upload avatar");
        setAvatar(null); // Reset preview on error
      }
    }
  };

  // Priority: temporary upload preview > auth user avatar > default
  const getAvatarUrl = () => {
    if (avatar) return avatar; // Temporary upload preview (already has full URL)
    
    const userAvatar = auth.user?.avatarUrl;
    if (userAvatar) {
      // If it's a relative path, prepend backend server URL
      if (userAvatar.startsWith('/uploads')) {
        return `http://localhost:8080${userAvatar}`;
      }
      return userAvatar; // For Google avatars or full URLs
    }
    
    return "/images/default-avatar.png"; // Default fallback
  };
  
  const avatarUrl = getAvatarUrl();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 mb-8 pb-6 border-b dark:border-gray-700">
                {!imageError && avatarUrl ? (
                  <img
                    src={avatarUrl}
                    width={90}
                    height={90}
                    alt="avatar"
                    className="w-[90px] h-[90px] rounded-full border-4 border-cyan-100 dark:border-cyan-900 object-cover shadow-md"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-[90px] h-[90px] rounded-full border-4 border-cyan-100 dark:border-cyan-900 bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {auth.user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Profile Photo</h2>
                  <label className="cursor-pointer inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm">
                    Change Avatar
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>

              {/* Personal Information */}
              <SectionTitle title="Personal Information" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input 
            label="Full Name" 
            placeholder="Enter your full name" 
            value={fullName}
            onChange={(e: any) => setFullName(e.target.value)}
          />
          <Input 
            label="Email" 
            value={auth.user.email} 
            disabled 
          />

          <Input 
            label="Phone Number" 
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e: any) => setPhoneNumber(e.target.value)}
          />

          <Input 
            label="Date of Birth" 
            type="date"
            value={dateOfBirth}
            onChange={(e: any) => setDateOfBirth(e.target.value)}
          />

          <Select
            label="Gender"
            options={["Male", "Female", "Other"]}
            value={gender}
            onChange={(e: any) => setGender(e.target.value)}
          />
        </div>

        {/* Experience */}
        <SectionTitle title="Experience" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input 
            label="Current Position" 
            placeholder="e.g., Frontend Developer"
            value={currentPosition}
            onChange={(e: any) => setCurrentPosition(e.target.value)}
          />

          <Select
            label="Years of Experience"
            options={["0", "1", "2", "3", "4", "5+", "10+"]}
            value={yearsOfExperience}
            onChange={(e: any) => setYearsOfExperience(e.target.value)}
          />

          <TagInput 
            label="Key Skills" 
            placeholder="Add a skill…"
            tags={skills}
            setTags={setSkills}
          />
        </div>

        {/* About Me */}
        <SectionTitle title="About Me" />

        <textarea
          className="mt-4 w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 h-32 focus:outline-none focus:border-cyan-500 transition-colors"
          placeholder="Write a short introduction about yourself…"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
        />

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3.5 rounded-lg text-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : "Save Changes"}
        </button>
      </form>
          </div>

          {/* Right Column - CV Management */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CVManagement />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Reusable Components ---------------------- */

const Input = ({ label, placeholder, type = "text", ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-all"
      {...props}
    />
  </div>
);

const Select = ({ label, options = [], ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
    <select
      className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 pr-10 bg-white focus:outline-none focus:border-cyan-500 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px_8px] bg-[right_0.75rem_center] bg-no-repeat transition-all"
      {...props}
    >
      <option value="">Select...</option>
      {options.map((o: string) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <div className="mt-8 mb-4">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
  </div>
);

/* Tag Input Component */
const TagInput = ({ label, placeholder, tags, setTags }: any) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    if (input.trim() !== "") {
      setTags([...tags, input.trim()]);
      setInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>

      <div className="flex items-center gap-2 border dark:border-gray-600 rounded-lg px-4 py-2.5 dark:bg-gray-700 focus-within:border-cyan-500 transition-all">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          placeholder={placeholder}
          className="flex-1 outline-none bg-transparent dark:text-white"
        />
        <button
          type="button"
          onClick={addTag}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1.5 rounded-md transition-colors font-medium"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {tags.map((t: string, idx: number) => (
          <span 
            key={idx} 
            className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg flex items-center gap-2 font-medium border border-cyan-200 dark:border-cyan-800 transition-colors"
          >
            {t}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200 font-bold"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
