import React from "react";
import GoogleRegisterButton from "@/shared/components/Auth/GoogleRegisterButton";

type Props = {
    show: boolean;
    onClose: () => void;
    onOpenLogin: () => void;
    onOpenRegister: () => void;
};

const LoginPopup: React.FC<Props> = ({ show, onClose, onOpenLogin, onOpenRegister }) => {
    if (!show) return null;
    return (
        <div className="absolute top-full right-0 mt-2 z-[20000]">
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[350px]"
            >
                <h2 className="text-lg font-semibold mb-4 text-center">Job seeker login</h2>
                <div className="mb-4">
                    <GoogleRegisterButton
                        role="CANDIDATE"
                        fullWidth={true}
                        onSuccess={onClose}
                    />
                </div>
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            onClose();
                            onOpenLogin();
                        }}
                        className="w-full border py-2 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <span>Login</span>
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            onOpenRegister();
                        }}
                        className="w-full border py-2 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <span>Create new account</span>
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-500 hover:text-black dark:hover:text-white"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default LoginPopup;

