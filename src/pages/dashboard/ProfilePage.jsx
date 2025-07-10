// src/pages/dashboard/ProfilePage.jsx
import { useEffect, useState } from "react";
import { getProfile } from "../../services/profileService";
import EditProfileModal from "../../components/dashboard/EditProfileModal";
import { notifyError } from "../../services/notificationService";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      notifyError("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
        <div>
          <strong className="block text-gray-600">Full Name:</strong>
          <p>{user.fullName}</p>
        </div>
        <div>
          <strong className="block text-gray-600">Email:</strong>
          <p>{user.email}</p>
        </div>
        <div>
          <strong className="block text-gray-600">Phone:</strong>
          <p>{user.phoneNumber || "—"}</p>
        </div>
        <div>
          <strong className="block text-gray-600">Department:</strong>
          <p>{user.departmentName || "—"}</p>
        </div>
        <div className="pt-4 text-right">
          <button
            onClick={() => setEditing(true)}
            className="btn btn-primary btn-sm"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {isEditing && (
        <EditProfileModal
          user={user}
          onClose={() => setEditing(false)}
          onUpdated={fetchProfile}
        />
      )}
    </div>
  );
};

export default ProfilePage;
