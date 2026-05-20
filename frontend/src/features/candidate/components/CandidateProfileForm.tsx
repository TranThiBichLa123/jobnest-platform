"use client";

import { server } from "@/config/env";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { candidateProfileApi } from "@/features/candidate/api";
import { CandidateProfile } from "@/shared/types/profile";
import { getApiErrorMessage } from "@/shared/api/http";
import CVManagement from "./CVManagement";
import CandidateAvatarUpload from "./CandidateAvatarUpload";
import CandidateProfileFields from "./CandidateProfileFields";

function normalizeAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("/uploads")) return `${server}${avatarUrl}`;
  if (avatarUrl.startsWith("/")) return avatarUrl;
  return avatarUrl;
}

export default function CandidateProfileForm() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [profile, setProfile] = useState<CandidateProfile>({});
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [aboutMe, setAboutMe] = useState("");

  useEffect(() => {
    if (auth?.isLoading) return;
    if (!auth?.user) return router.push("/");

    if (auth.user.role !== "CANDIDATE") {
      setMessage({
        type: "error",
        text: "Access denied. Candidate profile is only available for Job Seekers.",
      });
      return;
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role]);

  const loadProfile = async () => {
    try {
      const data = await candidateProfileApi.getMyProfile();
      setProfile(data);
      setFullName(data.fullName || auth?.user?.username || "");
      setPhoneNumber(data.phoneNumber || "");
      setDateOfBirth(data.dateOfBirth || "");
      setGender(data.gender ? data.gender.charAt(0) + data.gender.slice(1).toLowerCase() : "");
      setCurrentPosition(data.currentPosition || "");
      setYearsOfExperience(data.yearsOfExperience || "");
      setSkills(Array.isArray(data.skills) ? data.skills : []);
      setAboutMe(data.aboutMe || "");
    } catch {
      setFullName(auth?.user?.username || "");
      setMessage({
        type: "info",
        text: "No candidate profile found yet. Fill the form and save it before applying for jobs.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const updated = await candidateProfileApi.updateMyProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: dateOfBirth || undefined,
        gender: gender ? gender.toUpperCase() : undefined,
        currentPosition: currentPosition.trim(),
        yearsOfExperience,
        skills,
        aboutMe: aboutMe.trim(),
      });

      setProfile(updated);
      await auth?.reloadUser?.();
      setMessage({ type: "success", text: "Profile saved successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to update profile."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setMessage({ type: "error", text: "Only JPG, PNG, WEBP, and GIF images are allowed." });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Avatar file must be less than or equal to 2MB." });
      return;
    }

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarUploading(true);
    setMessage(null);

    try {
      const result = await candidateProfileApi.uploadAvatar(file);
      setAvatarPreview(normalizeAvatarUrl(result.avatarUrl));
      setProfile((prev) => ({ ...prev, avatarUrl: result.avatarUrl }));
      await auth?.reloadUser?.();
      setMessage({ type: "success", text: "Avatar uploaded successfully." });
    } catch (error) {
      setAvatarPreview(null);
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to upload avatar."),
      });
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  if (auth?.isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!auth?.user) return null;

  const blockedByRole = auth.user.role !== "CANDIDATE";
  const avatarUrl = avatarPreview || normalizeAvatarUrl(profile.avatarUrl || auth.user.avatarUrl);

  const messageClass =
    message?.type === "success"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      : message?.type === "info"
      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage candidate profile and CVs for the Apply for Job demo flow.
          </p>
        </div>

        {message && <div className={`mb-6 rounded-lg border p-4 text-sm ${messageClass}`}>{message.text}</div>}

        {blockedByRole ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">403 — Candidate Only</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              This page is protected for Job Seekers. Backend also enforces JWT, RBAC, and ownership rules.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <CandidateAvatarUpload
                avatarUrl={avatarUrl}
                imageError={imageError}
                avatarUploading={avatarUploading}
                username={auth.user.username}
                onImageError={() => setImageError(true)}
                onAvatarChange={handleAvatarChange}
              />

              <CandidateProfileFields
                email={auth.user.email}
                fullName={fullName}
                phoneNumber={phoneNumber}
                dateOfBirth={dateOfBirth}
                gender={gender}
                currentPosition={currentPosition}
                yearsOfExperience={yearsOfExperience}
                skills={skills}
                aboutMe={aboutMe}
                setFullName={setFullName}
                setPhoneNumber={setPhoneNumber}
                setDateOfBirth={setDateOfBirth}
                setGender={setGender}
                setCurrentPosition={setCurrentPosition}
                setYearsOfExperience={setYearsOfExperience}
                setSkills={setSkills}
                setAboutMe={setAboutMe}
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3.5 rounded-lg text-lg font-semibold disabled:bg-gray-400"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CVManagement />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}