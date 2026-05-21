"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BiBriefcase,
  BiBuilding,
  BiFile,
  BiHomeAlt,
  BiLogOut,
  BiNetworkChart,
  BiUser,
} from "react-icons/bi";

const items = [
  { label: "Dashboard", href: "/admin", icon: BiHomeAlt },
  { label: "Users", href: "/admin/users", icon: BiUser },
  { label: "Jobs", href: "/admin/jobs", icon: BiBriefcase },
  { label: "Companies", href: "/admin/companies", icon: BiBuilding },
  { label: "Applications", href: "/admin/applications", icon: BiFile },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 lg:flex flex-col">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-cyan-700 flex items-center justify-center text-white">
            <BiNetworkChart className="text-2xl" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-cyan-800 dark:text-white">
              JobNest
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      <nav className="px-4 flex-1">
        <p className="px-4 mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Management
        </p>

        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-cyan-700 to-cyan-900 text-white shadow-lg shadow-cyan-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="text-xl" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
        >
          <BiLogOut className="text-xl" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}