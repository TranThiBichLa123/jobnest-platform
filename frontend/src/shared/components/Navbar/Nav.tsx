'use client'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { LuNetwork } from 'react-icons/lu'
import Link from 'next/link'
import { NavLinks } from '@/shared/constants/constant'
import { HiBars3BottomRight } from 'react-icons/hi2'
import { FiBell } from 'react-icons/fi'
import ThemeToggler from '@/shared/components/Helper/ThemeToggler'
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { MdAccountCircle } from "react-icons/md";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { useContext, useCallback, useRef } from "react";
import { useNotificationSocket } from '@/features/notifications/hooks/useNotificationSocket';
import { useRouter, usePathname } from "next/navigation";
import RegisterModal from "@/shared/components/Auth/RegisterModal";
import ForgotPasswordModal from "@/shared/components/Auth/ForgotPasswordModal";
import LoginModal from "@/shared/components/Auth/LoginModal";
import GoogleRegisterButton from "@/shared/components/Auth/GoogleRegisterButton";
import { useAuthModal } from "@/features/auth/context/AuthModalContext";
import UserMenuDropdown from "./UserMenuDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { notificationApi } from "@/shared/api"; // Thêm dòng này nếu bạn đã có notificationApi
import LoginPopup from "./LoginPopup";

// Helper function to generate avatar URL from email using UI Avatars
function getAvatarUrl(avatarUrl: string | undefined, email: string | undefined, username: string | undefined): string {
    console.log('Avatar URL from user object:', avatarUrl);
    console.log('Email:', email);
    console.log('Username:', username);
    
    // If user has uploaded avatar (including Google avatar), use it
    if (avatarUrl && avatarUrl.trim() !== '') {
        console.log('Using provided avatar URL:', avatarUrl);
        // If it's a relative path (starts with /uploads), prepend backend server URL
        if (avatarUrl.startsWith('/uploads')) {
            return `http://localhost:8080${avatarUrl}`;
        }
        // Otherwise return as-is (for Google avatars or full URLs)
        return avatarUrl;
    }
    
    // Generate avatar from username or email
    const name = username || (email ? email.split('@')[0] : 'User');
    const avatarApiUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0e7490&color=fff&size=128&bold=true`;
    
    console.log('Generated fallback avatar URL:', avatarApiUrl);
    
    return avatarApiUrl;
}


type Props = {
    openNav: () => void
}



const Nav = ({ openNav }: Props) => {
    const [navBg, setNavBg] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [showPopupSmall, setShowPopup] = useState(false);
    const [showPopupLarge, setShowPopupLarge] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const toastTimeout = useRef<NodeJS.Timeout | null>(null);
    
    const { showLoginModal, showRegisterModal, openLoginModal, openRegisterModal, closeLoginModal, closeRegisterModal } = useAuthModal();

    const router = useRouter();
    const pathname = usePathname();

    // 🔥 LẤY USER TỪ AUTH CONTEXT
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const isInitializing = auth?.isInitializing;

    // Notification handler
    const handleNotification = useCallback((msg: any) => {
        setNotifications((prev) => [{
            message: typeof msg === 'string' ? msg : (msg.message || JSON.stringify(msg)),
            timestamp: new Date().toISOString(),
        }, ...prev]);
        setShowToast(true);
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setShowToast(false), 4000);
    }, []);

    // Always call the hook at the top level
    // Sử dụng đúng channel: "/user/queue/notifications"
    useNotificationSocket("/user/queue/notifications", handleNotification);

    useEffect(() => {
        // Cleanup toast timeout on unmount
        return () => {
            if (toastTimeout.current) clearTimeout(toastTimeout.current);
        };
    }, []);

    useEffect(() => {
        setIsClient(true);
        const handler = () => {
            if (window.scrollY >= 90) setNavBg(true);
            if (window.scrollY < 90) setNavBg(false);
        }
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    // Hàm load notification từ API khi bấm chuông
    const loadNotifications = async (unreadOnly = false) => {
        try {
            // Gọi API lấy notification, có thể truyền { unreadOnly: true } nếu muốn chỉ lấy chưa đọc
            const data = await notificationApi.getMyNotifications({ unreadOnly });
            setNotifications(data);
            // Đếm số lượng chưa đọc
            setUnreadCount(Array.isArray(data) ? data.filter((n: any) => !n.read).length : 0);
        } catch (error: any) {
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    // Đánh dấu 1 thông báo là đã đọc
    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await notificationApi.markAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {}
    };

    // Đánh dấu tất cả là đã đọc
    const handleMarkAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {}
    };

    // Xóa tất cả thông báo
    const handleClearAll = async () => {
        try {
            // Không còn deleteAllNotifications, chỉ xóa từng cái nếu cần
            // Nếu backend không hỗ trợ xóa tất cả, bạn có thể lặp qua notifications và gọi deleteNotification từng cái:
            await Promise.all(notifications.map((n: any) => notificationApi.deleteNotification(n.id)));
            setNotifications([]);
            setUnreadCount(0);
        } catch {}
    };

    // Khi bấm chuông, nếu chưa đăng nhập thì nhắc nhở đăng nhập, nếu đã đăng nhập thì mở popup và load notification
    const handleBellClick = () => {
        if (isInitializing) return null; // Đợi context khởi tạo xong mới check user
        if (!user) {
            openLoginModal();
            return;
        }
        setShowPopupLarge((prev) => !prev);
        if (!showPopupLarge) {
            loadNotifications();
        }
    };

    return (
        <div
            className={`fixed top-0 left-0 w-full h-[12vh] z-[10000]
              transition-colors duration-200
              ${navBg
                    ? 'bg-white dark:bg-[#0f2137] shadow-md' // khi cuộn: trắng (light), xanh đậm (dark)
                    : 'bg-transparent dark:bg-transparent'   // chưa cuộn: trong suốt
                }`}
        >

            <div className='flex items-center h-full justify-between w-[92%] mx-auto'>

                <div className='flex items-center sm:space-x-20'>
                    {/* LOGO */}

                    <Link href="/" className='flex items-center space-x-2'>
                        <div className='w-10 h-10 bg-cyan-800  rounded-full flex items-center justify-center flex-col'>
                            <LuNetwork className='w-5 h-5 text-white ' />
                        </div>
                        <h1 className='text-xl hidden sm:block md:text-2xl text-cyan-800 dark:text-white font-bold'>
                            JobNest
                        </h1>
                    </Link>

                    {/* NAVLINKS */}
                    <div className='hidden lg:flex items-center space-x-10'>
                        {NavLinks.map((link) => {
                            const isActive = pathname === link.url;
                            return <Link 
                                key={link.id} 
                                href={link.url} 
                                className={`text-base hover:text-cyan-700 dark:hover:text-cyan-200 font-medium transition-all duration-200 ${
                                    isActive ? 'text-cyan-800 dark:text-white' : ''
                                }`}
                            >
                                <p>{link.label}</p>
                            </Link>
                        })}
                    </div>
                </div>
                {/* Button */}
                {isClient && (
                    <div className="flex items-center space-x-4 relative">



                        {/* Job post button */}
                        <button className="px-8 py-2.5 text-sm text-white hidden sm:block cursor-pointer rounded-lg bg-cyan-700 hover:bg-cyan-900 transition-all duration-300">
                            Job Post
                        </button>

                        {/* Notification Bell: chỉ hiển thị khi đã đăng nhập */}
                        {user && (
                            <button
                                className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-900 transition-all duration-300 mx-1"
                                aria-label="Notifications"
                                onClick={handleBellClick}
                            >
                                <FiBell className="w-7 h-7 text-cyan-700 dark:text-white" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 block w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 animate-pulse"></span>
                                )}
                            </button>
                        )}

                        {/* Notification Popup */}
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

                        {/* Toast Notification */}
                        {user && showToast && notifications.length > 0 && (
                            <div className="fixed bottom-8 right-8 z-[30000] bg-cyan-700 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
                                <span className="font-semibold">Notification:</span> {notifications[0].message}
                            </div>
                        )}
                        
                        {/* User Avatar with Dropdown or Login Icon */}
                        {user ? (
                            <UserMenuDropdown 
                                avatarUrl={getAvatarUrl(user.avatarUrl, user.email, user.username)}
                                username={user.username}
                            />
                        ) : (
                            <button
                                onClick={() => setShowPopup(true)}
                                className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-900 transition-all duration-300"
                            >
                                <MdAccountCircle className="w-7 h-7 text-cyan-700 dark:text-white" />
                            </button>
                        )}


                        {/* Theme toggler */}
                        <ThemeToggler />

                        {/* Burger menu */}
                        <HiBars3BottomRight
                            onClick={openNav}
                            className="w-8 h-8 cursor-pointer text-black dark:text-white lg:hidden"
                        />

                        {/* ---- POPUP đầu tiên ---- */}
                        <LoginPopup
                            show={showPopupSmall}
                            onClose={() => setShowPopup(false)}
                            onOpenLogin={openLoginModal}
                            onOpenRegister={openRegisterModal}
                        />

                    </div>
                )}

                {/* POPUP LOGIN */}
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
                {/* POPUP FORGOT PASSWORD */}
                <ForgotPasswordModal
                    show={showForgotPassword}
                    onClose={() => setShowForgotPassword(false)}
                />




                {/* POPUP REGISTER */}
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
    )
}

export default Nav

