// src/components/common/ChangeEmailModal.jsx
// This component can be used by Dashboard, Dean, and Faculty users
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { requestEmailChange } from "../../services/emailConfirmationService";
import { toast } from "sonner";

const schema = yup.object().shape({
  newEmail: yup
    .string()
    .email("Invalid email format")
    .required("New email is required"),
  confirmEmail: yup
    .string()
    .oneOf([yup.ref("newEmail")], "Emails must match")
    .required("Please confirm your email"),
});

const ChangeEmailModal = ({ currentEmail, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await requestEmailChange(data.newEmail);
      toast.success(
        response.message ||
          "Confirmation email sent! Please check your new email inbox."
      );
      setEmailSent(true);
      onSuccess?.();
    } catch (err) {
      console.error("Change email error:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to send confirmation email. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        {!emailSent ? (
          <div>
            <h3 className="font-bold text-lg mb-4">Change Email Address</h3>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
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
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    You'll receive a confirmation link at your new email
                    address. Click the link to complete the email change.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Current Email</span>
                </label>
                <input
                  type="email"
                  value={currentEmail}
                  className="input input-bordered w-full bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">New Email</span>
                </label>
                <input
                  type="email"
                  {...register("newEmail")}
                  placeholder="newemail@example.com"
                  className="input input-bordered w-full"
                  disabled={loading}
                />
                {errors.newEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newEmail.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Confirm New Email
                  </span>
                </label>
                <input
                  type="email"
                  {...register("confirmEmail")}
                  placeholder="newemail@example.com"
                  className="input input-bordered w-full"
                  disabled={loading}
                />
                {errors.confirmEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmEmail.message}
                  </p>
                )}
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Confirmation Email"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
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
              We've sent a confirmation link to your new email address. Please
              check your inbox and click the link to complete the email change.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default ChangeEmailModal;
