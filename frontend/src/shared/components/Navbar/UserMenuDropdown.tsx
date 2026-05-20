"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "@/features/auth/context/AuthContext";

interface UserMenuDropdownProps {
  avatarUrl: string;
  username: string;
}

export default function UserMenuDropdown({
  avatarUrl,
  username,
}: UserMenuDropdownProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const auth = useContext(AuthContext);

  const role = auth?.user?.role;

  const profilePath =
    role === "EMPLOYER"
      ? "/employer/profile"
      : role === "ADMIN"
      ? "/admin"
      : "/candidate/profile";

  const jobsPath =
    role === "EMPLOYER"
      ? "/employer/jobs"
      : role === "ADMIN"
      ? "/admin/jobs"
      : "/candidate/my-jobs";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (auth?.logout) {
      await auth.logout();
    }

    setOpen(false);
    router.push("/");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 hover:border-cyan-600 transition-colors duration-200"
      >
        <img
          src={avatarUrl}
          alt={username || "User"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/images/default-company.jpg";
          }}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl z-50 animate-fadeIn">
          <ul className="py-2">
            <li
              onClick={() => {
                router.push(profilePath);
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
            >
              <UserIcon className="w-5 h-5" />
              My Profile
            </li>

            <li
              onClick={() => {
                router.push(jobsPath);
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
            >
              <BriefcaseIcon className="w-5 h-5" />
              My Jobs
            </li>

            <li
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-red-600 dark:text-red-400 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Sign out
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}