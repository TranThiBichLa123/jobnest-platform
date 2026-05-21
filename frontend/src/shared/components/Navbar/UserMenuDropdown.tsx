"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { normalizeRole } from "@/shared/security/access-control";
import {
  dashboardPathByRole,
  jobsPathByRole,
  profilePathByRole,
} from "@/shared/security/navigation";

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

  const role = normalizeRole(auth?.user?.role);

  const goTo = (path: string) => {
    router.push(path);
    setOpen(false);
  };

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
    setOpen(false);

    if (auth?.logout) {
      await auth.logout();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 hover:border-cyan-600 transition-colors duration-200"
        aria-label="Open user menu"
      >
        <img
          src={avatarUrl}
          alt={username || "User"}
          className="w-full h-full object-cover"
          onError={(event) => {
            event.currentTarget.src = "/images/default-company.jpg";
          }}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl z-50 animate-fadeIn">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {username || "User"}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {role}
            </p>
          </div>

          <ul className="py-2">
            <li
              onClick={() => goTo(dashboardPathByRole[role])}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
            >
              <Squares2X2Icon className="w-5 h-5" />
              Dashboard
            </li>

            <li
              onClick={() => goTo(profilePathByRole[role])}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
            >
              <UserIcon className="w-5 h-5" />
              My Profile
            </li>

            <li
              onClick={() => goTo(jobsPathByRole[role])}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
            >
              <BriefcaseIcon className="w-5 h-5" />
              {role === "EMPLOYER"
                ? "Employer Jobs"
                : role === "ADMIN"
                ? "Manage Jobs"
                : "My Jobs"}
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