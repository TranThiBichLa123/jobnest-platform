"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CgClose } from "react-icons/cg";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { useAuthModal } from "@/features/auth/context/AuthModalContext";
import { normalizeRole } from "@/shared/security/access-control";
import {
  canSeeNavItem,
  dashboardPathByRole,
  getJobPostLabel,
  getJobPostTarget,
  jobsPathByRole,
  mainNavItems,
  profilePathByRole,
} from "@/shared/security/navigation";

type Props = {
  showNav: boolean;
  closeNav: () => void;
};

const MobileNav = ({ closeNav, showNav }: Props) => {
  const navOpen = showNav ? "translate-x-0" : "translate-x-[100%]";

  const router = useRouter();
  const auth = useContext(AuthContext);
  const { openLoginModal } = useAuthModal();

  const user = auth?.user;
  const role = normalizeRole(user?.role);

  const visibleNavItems = mainNavItems.filter((item) =>
    canSeeNavItem(item, role)
  );

  const goTo = (path: string) => {
    closeNav();
    router.push(path);
  };

  const handleJobPost = () => {
    closeNav();

    if (!user) {
      openLoginModal();
      return;
    }

    router.push(getJobPostTarget(role));
  };

  const handleProtectedRoute = (path: string) => {
    closeNav();

    if (!user) {
      openLoginModal();
      return;
    }

    router.push(path);
  };

  return (
    <div>
      <div
        onClick={closeNav}
        className={`fixed ${navOpen} inset-0 transform transition-all right-0 duration-500 z-[100002] bg-black opacity-70 w-full h-screen`}
      />

      <div
        className={`text-white ${navOpen} fixed justify-center flex flex-col h-full transform transition-all duration-500 delay-300 w-[80%] sm:w-[60%] bg-cyan-800 space-y-6 z-[1000050] right-0`}
      >
        {visibleNavItems.map((link) => {
          if (link.href === "#") {
            return (
              <button
                key={link.id}
                type="button"
                onClick={closeNav}
                className="text-white w-fit text-xl ml-12 border-b-[1.5px] pb-1 border-white sm:text-[30px] text-left"
              >
                {link.label}
              </button>
            );
          }

          return (
            <Link key={link.id} href={link.href} onClick={closeNav}>
              <p className="text-white w-fit text-xl ml-12 border-b-[1.5px] pb-1 border-white sm:text-[30px]">
                {link.label}
              </p>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleJobPost}
          className="text-white w-fit text-xl ml-12 border-b-[1.5px] pb-1 border-white sm:text-[30px] text-left"
        >
          {getJobPostLabel(role)}
        </button>

        {user && (
          <>
            <button
              type="button"
              onClick={() => handleProtectedRoute(dashboardPathByRole[role])}
              className="text-white w-fit text-xl ml-12 border-b-[1.5px] pb-1 border-white sm:text-[30px] text-left"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => handleProtectedRoute(profilePathByRole[role])}
              className="text-white w-fit text-xl ml-12 border-b-[1.5px] pb-1 border-white sm:text-[30px] text-left"
            >
              My Profile
            </button>

            <button
              type="button"
              onClick={() => handleProtectedRoute(jobsPathByRole[role])}
              className="text-white w-fit text-xl ml-12 border-b-[1.5px] pb-1 border-white sm:text-[30px] text-left"
            >
              {role === "EMPLOYER"
                ? "Employer Jobs"
                : role === "ADMIN"
                ? "Manage Jobs"
                : "My Jobs"}
            </button>
          </>
        )}

        <CgClose
          onClick={closeNav}
          className="absolute top-[0.7rem] right-[1rem] sm:w-8 sm:h-8 w-6 h-6 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default MobileNav;