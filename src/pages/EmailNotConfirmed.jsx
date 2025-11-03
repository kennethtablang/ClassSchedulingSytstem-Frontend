// src/pages/EmailNotConfirmed.jsx
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "../services/axiosInstance";
import { toast } from "sonner";
import confirmEmailImage from "../assets/login-illustration.svg";

const EmailNotConfirmedPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [sending, setSending] = useState(false);

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error("Email address is required.");
      return;
    }

    setSending(true);
    try {
      await axios.post("/auth/send-email-confirmation", { email });
      toast.success("Confirmation email sent! Please check your inbox.");
    } catch (err) {
      console.error("Resend error:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to send confirmation email.";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left visual */}
        <div className="hidden md:flex items-center justify-center p-10 animate-slide-in-left">
          <img
            src={confirmEmailImage}
            alt="Confirm Email Visual"
            className="w-full h-full object-contain animate-floating drop-shadow-xl"
          />
        </div>

        {/* Right content */}
        <div className="p-10 animate-slide-in-right">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-primary mb-4 text-center">
            Email Confirmation Required
          </h2>

          <p className="text-gray-700 mb-4">
            Your email address <strong>{email || "not provided"}</strong> needs
            to be confirmed before you can log in.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What to do:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Check your email inbox for the confirmation link</li>
              <li>Click the link in the email to confirm your address</li>
              <li>Return here and log in</li>
            </ol>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Didn't receive the email? Check your spam folder or request a new
            one.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleResendConfirmation}
              disabled={sending || !email}
              className="btn btn-primary w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
            >
              {sending ? "Sending..." : "Resend Confirmation Email"}
            </button>

            <Link to="/login" className="btn btn-outline w-full">
              Back to Login
            </Link>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            If you continue to have issues, please contact the administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailNotConfirmedPage;
