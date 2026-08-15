import React from 'react';
import GoogleLoginButton from './GoogleLoginButton';

export const LoginForm = () => {
  return (
    <div className="space-y-4 pt-2">
      {/* Primary Authentication Method: Google IIUC Academic Sign-In */}
      <div className="space-y-3 flex flex-col items-center">
        <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest text-center">
          Academic Authentication
        </span>
        <GoogleLoginButton onSuccessRedirect="/dashboard" />
      </div>
    </div>
  );
};

export default LoginForm;
