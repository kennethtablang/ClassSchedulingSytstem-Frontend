// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/authService";
import { toast } from "sonner";
import forgotPasswordImage from "../assets/login-illustration.svg";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await requestPasswordReset(data.email);
      setSuccess(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (err) {
      console.error("Password reset request failed:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left visual */}
        <div className="hidden md:flex items-center justify-center p-10 animate-slide-in-left">
          <img
            src={forgotPasswordImage}
            alt="Forgot Password Visual"
            className="w-full h-full object-contain animate-floating drop-shadow-xl"
          />
        </div>

        {/* Right form */}
        <div className="p-10 animate-slide-in-right">
          {!success ? (
            <>
              <h2 className="text-3xl font-bold text-primary mb-4">
                Forgot Password?
              </h2>
              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you instructions to
                reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="input input-bordered w-full mt-1"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <p className="text-sm text-center text-gray-600">
                  Remember your password?{" "}
                  <Link to="/login" className="text-primary font-medium">
                    Back to Login
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to your email address.
                Please check your inbox and follow the link to reset your
                password.
              </p>
              <Link to="/login" className="btn btn-primary">
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
