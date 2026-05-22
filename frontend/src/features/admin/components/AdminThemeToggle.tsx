"use client";

import { useEffect, useState } from "react";
import { BiMoon, BiSun } from "react-icons/bi";

export default function AdminThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");

    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;

    if (dark) {
      html.classList.remove("dark");
      localStorage.setItem("admin-theme", "light");
      setDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("admin-theme", "dark");
      setDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="h-12 w-12 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-sm hover:scale-105 transition-all"
    >
      {dark ? (
        <BiSun className="text-2xl text-yellow-400" />
      ) : (
        <BiMoon className="text-2xl text-cyan-700" />
      )}
    </button>
  );
}