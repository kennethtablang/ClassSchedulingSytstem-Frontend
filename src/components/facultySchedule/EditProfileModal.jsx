// src/components/facultySchedule/EditFacultyProfileModal.jsx
import { useForm } from "react-hook-form";
import { updateProfile } from "../../services/profileService";
import { toast } from "sonner";

const EditFacultyProfileModal = ({ user, onClose, onUpdated }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: user,
  });

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully!");
      onUpdated(); // Refresh profile data
      onClose(); // Close the modal
    } catch (err) {
      console.error("Profile update error:", err);
      const message = err.response?.data || "Failed to update profile.";
      toast.error(
        typeof message === "string" ? message : "Failed to update profile."
      );
    }
  };

  return (
    <dialog id="edit_faculty_profile_modal" className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Edit My Profile</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-4">
          <div>
            <label className="label">
              <span className="label-text">First Name</span>
            </label>
            <input
              type="text"
              placeholder="First Name"
              {...register("firstName", { required: "First name is required" })}
              className="input input-bordered w-full"
            />
            {errors.firstName && (
              <p className="text-error text-xs mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text">Middle Name</span>
            </label>
            <input
              type="text"
              placeholder="Middle Name (optional)"
              {...register("middleName")}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Last Name</span>
            </label>
            <input
              type="text"
              placeholder="Last Name"
              {...register("lastName", { required: "Last name is required" })}
              className="input input-bordered w-full"
            />
            {errors.lastName && (
              <p className="text-error text-xs mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text">Phone Number</span>
            </label>
            <input
              type="text"
              placeholder="Phone Number"
              {...register("phoneNumber")}
              className="input input-bordered w-full"
            />
          </div>

          {/* ✅ NEW: Employee ID Field */}
          <div>
            <label className="label">
              <span className="label-text">Employee ID</span>
            </label>
            <input
              type="text"
              placeholder="Employee ID (optional)"
              {...register("employeeID")}
              className="input input-bordered w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank if not applicable
            </p>
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default EditFacultyProfileModal;
