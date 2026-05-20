"use client";

import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LuNetwork } from "react-icons/lu";
import { HiBars3BottomRight } from "react-icons/hi2";
import { FiBell } from "react-icons/fi";
import { MdAccountCircle } from "react-icons/md";

import { server } from "@/config/env";
import { NavLinks } from "@/shared/constants/constant";
import ThemeToggler from "@/shared/components/Helper/ThemeToggler";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { useNotificationSocket } from "@/features/notifications/hooks/useNotificationSocket";
import { useAuthModal } from "@/features/auth/context/AuthModalContext";
import { notificationApi } from "@/shared/api";

import RegisterModal from "@/shared/components/Auth/RegisterModal";
import ForgotPasswordModal from "@/shared/components/Auth/ForgotPasswordModal";
import LoginModal from "@/shared/components/Auth/LoginModal";
import UserMenuDropdown from "./UserMenuDropdown";
import NotificationDropdown from "./NotificationDropdown";
import LoginPopup from "./LoginPopup";

type Props = {
  openNav: () => void;
};

function getAvatarUrl(
  avatarUrl: string | undefined,
  email: string | undefined,
  username: string | undefined
): string {
  if (avatarUrl && avatarUrl.trim() !== "") {
    if (avatarUrl.startsWith("/uploads")) {
      return `${server}${avatarUrl}`;
    }

    if (avatarUrl.startsWith("/")) {
      return avatarUrl;
    }

    return avatarUrl;
  }

  const name = username || (email ? email.split("@")[0] : "User");
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=0e7490&color=fff&size=128&bold=true`;
}

const Nav = ({ openNav }: Props) => {
  const [navBg, setNavBg] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showPopupSmall, setShowPopup] = useState(false);
  const [showPopupLarge, setShowPopupLarge] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  const {
    showLoginModal,
    showRegisterModal,
    openLoginModal,
    openRegisterModal,
    closeLoginModal,
    closeRegisterModal,
  } = useAuthModal();

  const router = useRouter();
  const pathname = usePathname();

  const auth = useContext(AuthContext);
  const user = auth?.user;
  const isInitializing = auth?.isInitializing;

  const handleNotification = useCallback((msg: any) => {
    const nextNotification = {
      ...msg,
      message:
        typeof msg === "string"
          ? msg
          : msg?.message || msg?.content || "You have a new notification.",
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [nextNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    setShowToast(true);

    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }

    toastTimeout.current = setTimeout(() => setShowToast(false), 4000);
  }, []);

  useNotificationSocket("/user/queue/notifications", handleNotification);

  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  useEffect(() => {
    setIsClient(true);

    const handler = () => {
      setNavBg(window.scrollY >= 90);
    };

    handler();
    window.addEventListener("scroll", handler);

    return () => window.removeEventListener("scroll", handler);
  }, []);

  const loadNotifications = async (unreadOnly = false) => {
    try {
      const data = await notificationApi.getMyNotifications({ unreadOnly });
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(
        Array.isArray(data) ? data.filter((n: any) => !n.read).length : 0
      );
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleClearAll = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n: any) => n.id)
          .map((n: any) => notificationApi.deleteNotification(n.id))
      );

      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const handleBellClick = () => {
    if (isInitializing) return;

    if (!user) {
      openLoginModal();
      return;
    }

    setShowPopupLarge((prev) => !prev);

    if (!showPopupLarge) {
      loadNotifications();
    }
  };

  const handleJobPostClick = () => {
    if (!user) {
      openLoginModal();
      return;
    }

    if (user.role === "EMPLOYER") {
      router.push("/employer/jobs");
      return;
    }

    if (user.role === "ADMIN") {
      router.push("/admin/jobs");
      return;
    }

    router.push("/jobs");
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full h-[12vh] z-[10000] transition-colors duration-200 ${
        navBg ? "bg-white dark:bg-[#0f2137] shadow-md" : "bg-transparent"
      }`}
    >
      <div className="flex items-center h-full justify-between w-[92%] mx-auto">
        <div className="flex items-center sm:space-x-20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-cyan-800 rounded-full flex items-center justify-center">
              <LuNetwork className="w-5 h-5 text-white" />
            </div>

            <h1 className="text-xl hidden sm:block md:text-2xl text-cyan-800 dark:text-white font-bold">
              JobNest
            </h1>
          </Link>

          <div className="hidden lg:flex items-center space-x-10">
            {NavLinks.map((link) => {
              const isActive = pathname === link.url;

              return (
                <Link
                  key={link.id}
                  href={link.url}
                  className={`text-base hover:text-cyan-700 dark:hover:text-cyan-200 font-medium transition-all duration-200 ${
                    isActive ? "text-cyan-800 dark:text-white" : ""
                  }`}
                >
                  <p>{link.label}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {isClient && (
          <div className="flex items-center space-x-4 relative">
            <button
              onClick={handleJobPostClick}
              className="px-8 py-2.5 text-sm text-white hidden sm:block cursor-pointer rounded-lg bg-cyan-700 hover:bg-cyan-900 transition-all duration-300"
            >
              Job Post
            </button>

            {user && (
              <button
                className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-900 transition-all duration-300 mx-1"
                aria-label="Notifications"
                onClick={handleBellClick}
              >
                <FiBell className="w-7 h-7 text-cyan-700 dark:text-white" />

                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 block w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 animate-pulse" />
                )}
              </button>
            )}

            {user && showPopupLarge && (
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearAll}
                onMarkAsRead={handleMarkAsRead}
                onClose={() => setShowPopupLarge(false)}
              />
            )}

            {user && showToast && notifications.length > 0 && (
              <div className="fixed bottom-8 right-8 z-[30000] bg-cyan-700 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up max-w-sm">
                <span className="font-semibold">Notification:</span>{" "}
                {notifications[0].message}
              </div>
            )}

            {user ? (
              <UserMenuDropdown
                avatarUrl={getAvatarUrl(user.avatarUrl, user.email, user.username)}
                username={user.username}
              />
            ) : (
              <button
                onClick={() => setShowPopup(true)}
                className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-900 transition-all duration-300"
                aria-label="Open login menu"
              >
                <MdAccountCircle className="w-7 h-7 text-cyan-700 dark:text-white" />
              </button>
            )}

            <ThemeToggler />

            <HiBars3BottomRight
              onClick={openNav}
              className="w-8 h-8 cursor-pointer text-black dark:text-white lg:hidden"
            />

            <LoginPopup
              show={showPopupSmall}
              onClose={() => setShowPopup(false)}
              onOpenLogin={openLoginModal}
              onOpenRegister={openRegisterModal}
            />
          </div>
        )}

        <LoginModal
          show={showLoginModal}
          onClose={closeLoginModal}
          onOpenForgot={() => {
            closeLoginModal();
            setShowForgotPassword(true);
          }}
          onOpenRegister={() => {
            closeLoginModal();
            openRegisterModal();
          }}
        />

        <ForgotPasswordModal
          show={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />

        {showRegisterModal && (
          <RegisterModal
            onClose={closeRegisterModal}
            onOpenLogin={() => {
              closeRegisterModal();
              openLoginModal();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Nav;