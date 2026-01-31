import React, { useEffect, useRef } from "react";

type Notification = {
    id: number;
    message: string;
    createdAt?: string;
    read?: boolean;
};

type Props = {
    notifications: Notification[];
    unreadCount: number;
    onMarkAllAsRead: () => void;
    onClearAll: () => void;
    onMarkAsRead: (id: number) => void;
    onClose?: () => void; // Thêm prop này để đóng popup khi click outside
};

const NotificationDropdown: React.FC<Props> = ({
    notifications,
    unreadCount,
    onMarkAllAsRead,
    onClearAll,
    onMarkAsRead,
    onClose,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!onClose) return;
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute right-0 top-12 z-[20000] w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-semibold text-cyan-700 dark:text-cyan-200 flex justify-between items-center rounded-t-2xl">
                <span>Notifications</span>
                <div className="flex gap-2">
                    <button
                        className="text-xs text-cyan-700 dark:text-cyan-200 hover:underline"
                        onClick={onMarkAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        Mark all as read
                    </button>
                    <button
                        className="text-xs text-gray-500 hover:text-cyan-700 dark:hover:text-cyan-200"
                        onClick={onClearAll}
                    >
                        Clear all
                    </button>
                </div>
            </div>
            <ul className="max-h-72 overflow-y-auto rounded-b-2xl">
                {notifications.length === 0 && (
                    <li className="px-4 py-6 text-center text-gray-400 dark:text-gray-500">No notifications</li>
                )}
                {notifications.map((n, idx) => (
                    <li
                        key={n.id || idx}
                        className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-sm cursor-pointer transition-all
                            bg-white dark:bg-gray-800
                            ${n.read ? "text-gray-500" : "text-gray-900 dark:text-white font-semibold"}
                        `}
                        onClick={() => {
                            if (!n.read) onMarkAsRead(n.id);
                        }}
                    >
                        {n.message}
                        <div className="text-xs text-gray-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : ""}</div>
                        {!n.read && <span className="inline-block ml-2 w-2 h-2 bg-cyan-500 rounded-full"></span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationDropdown;
