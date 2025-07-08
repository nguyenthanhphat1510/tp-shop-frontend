"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPopup from './LoginPopup';
import RegisterPopup from './RegisterPopup';

const AuthModal = () => {
    const { showLoginModal, showRegisterModal } = useAuth();

    return (
        <>
            {showLoginModal && <LoginPopup />}
            {showRegisterModal && <RegisterPopup />}
        </>
    );
};

export default AuthModal;