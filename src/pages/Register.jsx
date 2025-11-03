// src/pages/Register.jsx - UPDATED VERSION
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../services/authService";
import registerImage from "../assets/register-illustration.svg";

// ✅ UPDATED: Strong password validation schema
const schema = yup.object({
  firstName: yup.string().required("First name is required"),
  middleName: yup.string(), // optional
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&#]/,
      "Password must contain at least one special character (@$!%*?&#)"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });

  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Watch password field for real-time validation display
  const password = watch("password", "");

  // ✅ Password strength checker
  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&#]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-600",
  ];

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      setError(null);
      const { firstName, middleName, lastName, email, password } = formData;

      await registerUser({
        firstName,
        middleName: middleName || null,
        lastName,
        email,
        password,
        confirmPassword: formData.confirmPassword,
      });

      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(err.response?.data || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-white to-blue-50 animate-fade-in">
      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Image */}
        <div className="hidden md:flex items-center justify-center p-6 animate-slide-in-left">
          <img
            src={registerImage}
            alt="Register Illustration"
            className="w-full h-full object-contain animate-floating"
          />
        </div>

        {/* Right Form */}
        <div className="p-10 animate-slide-in-right">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Create Account
          </h2>
          <p className="text-gray-600 mb-4">
            Register to access the PCNL Class Scheduler platform.
          </p>

          {error && (
            <div className="text-sm text-center text-red-500 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* First Name */}
            <div>
              <label className="label">First Name</label>
              <input
                type="text"
                placeholder="Juan"
                {...register("firstName")}
                className="input input-bordered w-full"
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Middle Name (optional) */}
            <div>
              <label className="label">Middle Name (Optional)</label>
              <input
                type="text"
                placeholder="Santos"
                {...register("middleName")}
                className="input input-bordered w-full"
                disabled={loading}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="label">Last Name</label>
              <input
                type="text"
                placeholder="Dela Cruz"
                {...register("lastName")}
                className="input input-bordered w-full"
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="input input-bordered w-full"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="input input-bordered w-full"
                disabled={loading}
              />

              {/* ✅ Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength
                            ? strengthColors[passwordStrength]
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Strength: {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}

              {/* ✅ Password requirements checklist */}
              <div className="mt-2 text-xs space-y-1">
                <p
                  className={
                    password.length >= 8 ? "text-green-600" : "text-gray-500"
                  }
                >
                  {password.length >= 8 ? "✓" : "○"} At least 8 characters
                </p>
                <p
                  className={
                    /[a-z]/.test(password) ? "text-green-600" : "text-gray-500"
                  }
                >
                  {/[a-z]/.test(password) ? "✓" : "○"} One lowercase letter
                </p>
                <p
                  className={
                    /[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"
                  }
                >
                  {/[A-Z]/.test(password) ? "✓" : "○"} One uppercase letter
                </p>
                <p
                  className={
                    /[0-9]/.test(password) ? "text-green-600" : "text-gray-500"
                  }
                >
                  {/[0-9]/.test(password) ? "✓" : "○"} One number
                </p>
                <p
                  className={
                    /[@$!%*?&#]/.test(password)
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  {/[@$!%*?&#]/.test(password) ? "✓" : "○"} One special
                  character (@$!%*?&#)
                </p>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="input input-bordered w-full"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Info message */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm">
              <p className="text-blue-700">
                After registration you need to contact the admin for the
                approval of your account.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full hover:scale-[1.01] transition-all"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="text-sm text-center text-gray-600 mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
