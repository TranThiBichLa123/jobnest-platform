"use client";

import React, { createContext, useContext, useState } from "react";

interface AuthModalContextType {
  showLoginModal: boolean;
  showRegisterModal: boolean;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeLoginModal: () => void;
  closeRegisterModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const openLoginModal = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const openRegisterModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const closeLoginModal = () => setShowLoginModal(false);
  const closeRegisterModal = () => setShowRegisterModal(false);

  return (
    <AuthModalContext.Provider
      value={{
        showLoginModal,
        showRegisterModal,
        openLoginModal,
        openRegisterModal,
        closeLoginModal,
        closeRegisterModal,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
}
