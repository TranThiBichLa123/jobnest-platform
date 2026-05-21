"use client";

import { useContext } from "react";
import { BiBell, BiCalendar } from "react-icons/bi";
import { AuthContext } from "@/features/auth/context/AuthContext";

type Props = {
  title: string;
  description: string;
};

export default function AdminTopbar({ title, description }: Props) {
  const auth = useContext(AuthContext);

  return (
    <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 shadow-sm">
          <BiCalendar className="text-xl text-cyan-700" />
          Today
        </div>

        <button className="h-12 w-12 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-sm">
          <BiBell className="text-2xl" />
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-cyan-700 text-white flex items-center justify-center font-extrabold">
            AD
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-extrabold text-gray-900 dark:text-white">
              {auth?.user?.username || "Admin"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}