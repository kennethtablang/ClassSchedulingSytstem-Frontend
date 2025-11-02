// src/pages/ResetPassword.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import resetPasswordImage from "../assets/register-illustration.svg";
import axiosInstance from "../services/axiosInstance";

const schema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

const ResetPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get("userId");
  const token = searchParams.get("token");

  // Redirect if no userId or token
  if (!userId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-4">
            This password reset link is invalid or has expired.
          </p>
          <Link to="/forgot-password" className="btn btn-primary">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // ✅ Call backend with userId, token (already URL-encoded), and passwords
      await axiosInstance.post("/auth/reset-password", {
        userId: userId,
        token: token, // ✅ Already URL-encoded from email link
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      });

      toast.success("Password reset successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Password reset failed:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to reset password. Link may be expired.";
      toast.error(errorMsg);
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
            src={resetPasswordImage}
            alt="Reset Password Visual"
            className="w-full h-full object-contain animate-floating"
          />
        </div>

        {/* Right form */}
        <div className="p-10 animate-slide-in-right">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Reset Password
          </h2>
          <p className="text-gray-600 mb-6">Enter your new password below</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full mt-1"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full mt-1"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <p className="text-sm text-center text-gray-600">
              Remember your password?{" "}
              <Link to="/login" className="text-primary font-medium">
                Back to Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
