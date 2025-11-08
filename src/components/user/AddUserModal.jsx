import { useState } from "react";
import { addUser } from "../../services/userService";
import { notifySuccess, notifyError } from "../../services/notificationService";

const AddUserModal = ({ onSuccess }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleModal = () => {
    setShow(!show);
    setError("");
    // Reset form when closing
    if (show) {
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Password strength checker (same as RegisterPage)
  const getPasswordStrength = () => {
    const password = formData.password;
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

  // ✅ Client-side validation before submit
  const validatePassword = () => {
    const { password } = formData;

    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[@$!%*?&#]/.test(password)) {
      return "Password must contain at least one special character (@$!%*?&#)";
    }

    return null; // Valid
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ✅ Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // ✅ Validate password strength
    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      await addUser(formData);
      notifySuccess("User successfully created.");
      toggleModal();
      onSuccess();
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Add user error:", err);
      const errorMessage = err?.response?.data || "Failed to add user.";
      notifyError("Failed to create user.");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={toggleModal}>
        + Add User
      </button>

      {show && (
        <dialog className="modal modal-open">
          <div className="modal-box w-full max-w-xl">
            <h3 className="font-bold text-lg mb-4">Add New User</h3>
            {error && (
              <div className="alert alert-error text-sm mb-3">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
                <input
                  type="text"
                  name="middleName"
                  placeholder="Middle Name"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* ✅ Password field with strength indicator */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />

                {/* ✅ Password strength indicator */}
                {formData.password && (
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
                      formData.password.length >= 8
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {formData.password.length >= 8 ? "✓" : "○"} At least 8
                    characters
                  </p>
                  <p
                    className={
                      /[a-z]/.test(formData.password)
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {/[a-z]/.test(formData.password) ? "✓" : "○"} One lowercase
                    letter
                  </p>
                  <p
                    className={
                      /[A-Z]/.test(formData.password)
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {/[A-Z]/.test(formData.password) ? "✓" : "○"} One uppercase
                    letter
                  </p>
                  <p
                    className={
                      /[0-9]/.test(formData.password)
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {/[0-9]/.test(formData.password) ? "✓" : "○"} One number
                  </p>
                  <p
                    className={
                      /[@$!%*?&#]/.test(formData.password)
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {/[@$!%*?&#]/.test(formData.password) ? "✓" : "○"} One
                    special character (@$!%*?&#)
                  </p>
                </div>
              </div>

              {/* ✅ Confirm Password field */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Confirm Password
                  </span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={toggleModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${loading ? "loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </>
  );
};

export default AddUserModal;
