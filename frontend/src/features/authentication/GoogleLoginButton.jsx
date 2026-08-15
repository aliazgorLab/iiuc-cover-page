import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUserStore } from '../../stores/useUserStore';

import { API_BASE_URL } from '../../config/apiConfig';

export const GoogleLoginButton = ({ onSuccessRedirect = '/dashboard' }) => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setStudentProfile = useUserStore((state) => state.setStudentProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginProcessing, setIsLoginProcessing] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (isLoginProcessing) return;
    setIsLoginProcessing(true);
    setIsLoading(true);
    toast.info('Verifying IIUC Academic Identity with Server...');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.message ||
            'Access Restricted: Only official IIUC academic email accounts are authorized.'
        );
        return;
      }

      // Store JWT token & user payload
      setAuth(data.user, data.token);

      // Hydrate student profile into user store & localStorage
      if (data.user) {
        setStudentProfile(
          data.user.name,
          data.user.studentId,
          data.user.department
        );
      }

      toast.success(`Welcome, ${data.user.name}! IIUC Academic Sign-In verified.`);
      navigate(onSuccessRedirect);
    } catch (error) {
      console.error('Google Server Verification Error:', error);
      toast.error('Unable to connect to IIUC Auth Server.');
    } finally {
      setIsLoading(false);
      setIsLoginProcessing(false);
    }
  };

  const handleGoogleError = () => {
    if (isLoginProcessing) return;
    toast.error('Google Sign-In popup closed or failed to authorize.');
  };

  return (
    <div className="w-full space-y-5 flex flex-col items-center">
      {/* Official Real Google OAuth Component */}
      <div className="google-login-wrapper w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="filled_blue"
          shape="pill"
          size="large"
          text="continue_with"
          width="320"
        />
      </div>

      {/* Official Domain Restriction Note */}
      <div className="text-center w-full">
        <p className="text-[11px] font-semibold text-gray-500 bg-emerald-50/60 border border-emerald-200/50 py-2.5 px-3.5 rounded-xl">
          🔒 Only IIUC academic accounts allowed <br />
          <span className="text-[#006A4E] font-bold">(example: c233093@ugrad.iiuc.ac.bd)</span>
        </p>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
