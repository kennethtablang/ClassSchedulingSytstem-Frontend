// src/pages/Login.jsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../services/authService";
import { getUserRoles } from "../utils/auth";
import { toast } from "sonner";
import loginImage from "../assets/sti.png";
import axios from "../services/axiosInstance";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Minimum 8 characters")
    .required("Password is required"),
});

const twoFactorSchema = yup.object().shape({
  code: yup
    .string()
    .matches(/^\d{6}$/, "Code must be 6 digits")
    .required("Verification code is required"),
});

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const {
    register: register2FA,
    handleSubmit: handleSubmit2FA,
    formState: { errors: errors2FA },
  } = useForm({ resolver: yupResolver(twoFactorSchema) });

  const [error, setError] = useState(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState(null);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  // Handle initial login
  const onSubmit = async (data) => {
    try {
      setError(null);
      const response = await loginUser(data);

      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        setRequires2FA(true);
        setTwoFactorUserId(response.userId);
        toast.info(
          response.message || "Check your email for verification code"
        );
        return;
      }

      // Regular login (no 2FA) - redirect by role
      const roles = getUserRoles();
      if (roles.includes("SuperAdmin") || roles.includes("Dean")) {
        navigate("/dashboard");
      } else if (roles.includes("Faculty")) {
        navigate("/faculty/schedule");
      } else {
        navigate("/unauthorized");
      }
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Invalid email or password";
      setError(message);
      toast.error(message);
    }
  };

  // Handle 2FA code submission
  const onSubmit2FA = async (data) => {
    try {
      setError(null);
      const response = await axios.post("/auth/confirm-2fa", {
        userId: twoFactorUserId,
        code: data.code,
      });

      // Store token after successful 2FA
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      toast.success("Login successful!");

      // Redirect by role
      const roles = getUserRoles();
      if (roles.includes("SuperAdmin") || roles.includes("Dean")) {
        navigate("/dashboard");
      } else if (roles.includes("Faculty")) {
        navigate("/faculty/schedule");
      } else {
        navigate("/unauthorized");
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      const message = err.response?.data || "Invalid verification code";
      setError(message);
      toast.error(message);
    }
  };

  // Resend 2FA code
  const handleResend2FA = async () => {
    if (!twoFactorUserId) return;

    setResending(true);
    try {
      await axios.post("/auth/resend-2fa", { userId: twoFactorUserId });
      toast.success("Verification code resent to your email");
    } catch (err) {
      console.error("Resend error:", err);
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left visual */}
        <div className="hidden md:flex items-center justify-center p-10 animate-slide-in-left">
          <img
            src={loginImage}
            alt="Login Visual"
            className="w-full h-full object-contain animate-floating drop-shadow-xl"
          />
        </div>

        {/* Right form */}
        <div className="p-10 animate-slide-in-right">
          {!requires2FA ? (
            // Regular login form
            <>
              <h2 className="text-3xl font-bold text-primary mb-4">Welcome</h2>
              <p className="text-gray-600 mb-2">
                Login to access the STI Alaminos Class Scheduler platform.
              </p>

              {error && (
                <div className="text-red-500 text-sm text-center mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="input input-bordered w-full mt-1"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="input input-bordered w-full mt-1"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div className="text-right mb-4">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
                >
                  Login
                </button>

                <p className="text-sm text-center text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary font-medium">
                    Register here
                  </Link>
                </p>
              </form>
            </>
          ) : (
            // 2FA verification form
            <>
              <h2 className="text-3xl font-bold text-primary mb-4">
                Verify Your Identity
              </h2>
              <p className="text-gray-600 mb-2">
                Enter the 6-digit code sent to your email
              </p>

              {error && (
                <div className="text-red-500 text-sm text-center mb-4">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit2FA(onSubmit2FA)}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <input
                    {...register2FA("code")}
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="input input-bordered w-full mt-1 text-center text-2xl tracking-widest"
                    autoFocus
                  />
                  {errors2FA.code && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors2FA.code.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
                >
                  Verify & Login
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend2FA}
                    disabled={resending}
                    className="text-sm text-primary hover:underline"
                  >
                    {resending ? "Sending..." : "Resend Code"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRequires2FA(false);
                    setTwoFactorUserId(null);
                    setError(null);
                  }}
                  className="text-sm text-gray-600 hover:underline w-full"
                >
                  ← Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
