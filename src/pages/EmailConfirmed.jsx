// src/pages/EmailConfirmed.jsx
// This page is shown after user clicks the confirmation link in their email

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import successImage from "../assets/login-illustration.svg";

const EmailConfirmed = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left visual */}
        <div className="hidden md:flex items-center justify-center p-10 animate-slide-in-left">
          <img
            src={successImage}
            alt="Success"
            className="w-full h-full object-contain animate-floating drop-shadow-xl"
          />
        </div>

        {/* Right content */}
        <div className="p-10 animate-slide-in-right flex flex-col justify-center">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <svg
                className="mx-auto h-20 w-20 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Email Successfully Changed!
            </h2>
            <p className="text-gray-600 mb-6">
              Your email address has been updated successfully. You can now log
              in with your new email address.
            </p>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm text-blue-700">
                    <strong>Important:</strong> Your login username has been
                    updated to your new email address. Please use your new email
                    and existing password to log in.
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to login in <strong>{countdown}</strong> seconds...
            </p>

            {/* Action Button */}
            <Link to="/login" className="btn btn-primary btn-wide">
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmed;
