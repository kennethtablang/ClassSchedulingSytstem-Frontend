// src/components/user/DenyUserModal.jsx
import { useState } from "react";

const DenyUserModal = ({ user, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(user.id, reason);
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="text-lg font-bold mb-4 text-error">Deny Registration</h3>

        <p className="text-sm text-gray-600 mb-4">
          You are about to deny the registration request from{" "}
          <strong>{user.fullName}</strong> ({user.email}). They will be notified
          via email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">
                Reason for Denial (Optional)
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Provide a reason for denial (will be included in the email)"
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be sent to the applicant via email.
            </p>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-error ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Deny Registration"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default DenyUserModal;
