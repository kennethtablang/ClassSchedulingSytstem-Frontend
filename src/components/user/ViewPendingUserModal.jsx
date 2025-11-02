// src/components/user/ViewPendingUserModal.jsx
const ViewPendingUserModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="text-lg font-bold mb-4">Registration Details</h3>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">
                First Name
              </label>
              <p className="text-base">{user.firstName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Middle Name
              </label>
              <p className="text-base">{user.middleName || "—"}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">
              Last Name
            </label>
            <p className="text-base">{user.lastName}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Email</label>
            <p className="text-base">{user.email}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">
              Employee ID
            </label>
            <p className="text-base">{user.employeeID || "Not provided"}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">
              Assigned Roles
            </label>
            <p className="text-base">
              {user.roles.map((role) => (
                <span key={role} className="badge badge-primary mr-2">
                  {role}
                </span>
              ))}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">
              Status
            </label>
            <p className="text-base">
              <span className="badge badge-warning">Pending Approval</span>
            </p>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ViewPendingUserModal;
