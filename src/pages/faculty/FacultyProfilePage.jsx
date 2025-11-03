// ============================================
// FACULTY PROFILE PAGE UPDATE
// ============================================
// src/pages/faculty/ProfilePage.jsx
import { useEffect, useState } from "react";
import { getProfile, toggle2FA } from "../../services/profileService";
import EditProfileModal from "../../components/facultySchedule/EditProfileModal";
import ChangeEmailModal from "../../components/common/ChangeEmailModal";
import { toast } from "sonner";

const FacultyProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setEditing] = useState(false);
  const [isChangingEmail, setChangingEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setUser(data);
      setTwoFactorEnabled(data.twoFactorEnabled || false);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      toast.error("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handle2FAToggle = async () => {
    if (!user?.emailConfirmed) {
      toast.error("Please confirm your email before enabling 2FA.");
      return;
    }

    setToggling2FA(true);
    try {
      const newState = !twoFactorEnabled;
      await toggle2FA(newState);
      setTwoFactorEnabled(newState);
      toast.success(
        newState
          ? "Two-Factor Authentication enabled successfully!"
          : "Two-Factor Authentication disabled successfully!"
      );
    } catch (err) {
      console.error("Failed to toggle 2FA:", err);
      toast.error("Failed to update 2FA settings.");
    } finally {
      setToggling2FA(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="alert alert-error">Unable to load profile.</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">My Profile</h2>

      <div className="card bg-white dark:bg-base-200 shadow-md p-6 space-y-4">
        {/* Basic Info */}
        <div>
          <strong className="block text-gray-600">Full Name:</strong>
          <p>{user.fullName}</p>
        </div>
        <div>
          <strong className="block text-gray-600">Email:</strong>
          <div className="flex items-center gap-2">
            <p>{user.email}</p>
            {user.emailConfirmed && (
              <span className="badge badge-success badge-sm">Verified</span>
            )}
            {!user.emailConfirmed && (
              <span className="badge badge-warning badge-sm">Unverified</span>
            )}
            {/* ✅ CHANGE EMAIL BUTTON */}
            <button
              className="btn btn-xs btn-outline ml-auto"
              onClick={() => setChangingEmail(true)}
            >
              Change Email
            </button>
          </div>
        </div>
        <div>
          <strong className="block text-gray-600">Phone:</strong>
          <p>{user.phoneNumber || "—"}</p>
        </div>
        <div>
          <strong className="block text-gray-600">Employee ID:</strong>
          <p>{user.employeeID || "—"}</p>
        </div>

        {/* 2FA Section */}
        <div className="divider"></div>
        <div className="bg-base-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <strong className="block text-gray-700">
                Two-Factor Authentication
              </strong>
              <p className="text-sm text-gray-600 mt-1">
                {twoFactorEnabled
                  ? "Your account is protected with 2FA"
                  : "Add an extra layer of security to your account"}
              </p>
              {!user.emailConfirmed && (
                <p className="text-xs text-warning mt-1">
                  ⚠️ Email verification required to enable 2FA
                </p>
              )}
            </div>
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={twoFactorEnabled}
                onChange={handle2FAToggle}
                disabled={toggling2FA || !user.emailConfirmed}
              />
              <span className="text-sm font-medium">
                {toggling2FA ? "Updating..." : twoFactorEnabled ? "ON" : "OFF"}
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex gap-2 justify-end">
          <button
            onClick={() => setEditing(true)}
            className="btn btn-primary btn-sm"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Modals */}
      {isEditing && (
        <EditProfileModal
          user={user}
          onClose={() => setEditing(false)}
          onUpdated={fetchProfile}
        />
      )}

      {/* ✅ CHANGE EMAIL MODAL */}
      {isChangingEmail && (
        <ChangeEmailModal
          currentEmail={user.email}
          onClose={() => setChangingEmail(false)}
          onSuccess={() => {
            setChangingEmail(false);
            toast.info("Please check your new email to complete the change.");
          }}
        />
      )}
    </div>
  );
};

export default FacultyProfilePage;
