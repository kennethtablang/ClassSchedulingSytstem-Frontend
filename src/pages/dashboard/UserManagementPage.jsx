import { useEffect, useState } from "react";
import {
  getUsers,
  deleteUser,
  toggleUserStatus,
} from "../../services/userService";
import AddUserModal from "../../components/user/AddUserModal";
import AssignRoleModal from "../../components/user/AssignRoleModal";
import EditUserModal from "../../components/user/EditUserModal";
import ResetPasswordModal from "../../components/user/ResetPasswordModal";
import {
  FaTrash,
  FaEdit,
  FaUserShield,
  FaLock,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { notifySuccess, notifyError } from "../../services/notificationService";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [reload, setReload] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleUser, setRoleUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users", err);
      notifyError("Failed to load users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [reload]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      notifySuccess("User deleted.");
      setReload((r) => !r);
    } catch (err) {
      console.error("Failed to delete user:", err);
      notifyError("Failed to delete user.");
    }
  };

  const handleToggle = async (user) => {
    setTogglingId(user.id);
    try {
      const { data } = await toggleUserStatus(user.id);
      notifySuccess(data.message);
      setReload((r) => !r);
    } catch (err) {
      console.error("Toggle failed", err);
      notifyError("Couldn’t update user status.");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "All" || user.roles.includes(roleFilter);

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && user.isActive) ||
      (statusFilter === "Deactivated" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <AddUserModal onSuccess={() => setReload((r) => !r)} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="input input-bordered w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="select select-bordered w-full md:w-48"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Roles</option>
          <option value="SuperAdmin">SuperAdmin</option>
          <option value="Dean">Dean</option>
          <option value="Faculty">Faculty</option>
        </select>
        <select
          className="select select-bordered w-full md:w-48"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Deactivated">Deactivated</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="table w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Roles</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No users found.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b">
                  <td>{`${user.firstName} ${user.middleName ?? ""} ${
                    user.lastName
                  }`}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || "-"}</td>
                  <td>{user.roles?.join(", ")}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-1 py-0.5 text-xs rounded text-white ${
                        user.isActive ? "bg-green-600" : "bg-gray-500"
                      }`}
                    >
                      {user.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="flex gap-2 justify-center py-2 flex-wrap">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setEditingUser(user)}
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      className={`btn btn-sm ${
                        user.isActive
                          ? "btn-error hover:bg-red-600"
                          : "btn-success hover:bg-green-600"
                      }`}
                      onClick={() => handleToggle(user)}
                      disabled={togglingId === user.id}
                    >
                      {togglingId === user.id ? (
                        "..."
                      ) : user.isActive ? (
                        <>
                          <FaToggleOff className="mr-1" /> Deactivate
                        </>
                      ) : (
                        <>
                          <FaToggleOn className="mr-1" /> Activate
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => setRoleUser(user)}
                    >
                      <FaUserShield className="mr-1" /> Assign Role
                    </button>
                    <button
                      className="btn btn-sm btn-accent"
                      onClick={() => setResetUser(user)}
                    >
                      <FaLock className="mr-1" /> Reset Password
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-error btn-sm"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            className="btn btn-sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => goToPage(num)}
              className={`btn btn-sm ${
                currentPage === num ? "btn-primary" : "btn-outline"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            className="btn btn-sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setReload((r) => !r);
            setEditingUser(null);
          }}
        />
      )}
      {roleUser && (
        <AssignRoleModal
          user={roleUser}
          onClose={() => setRoleUser(null)}
          onSuccess={() => {
            setReload((r) => !r);
            setRoleUser(null);
          }}
        />
      )}
      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => setResetUser(null)}
          onSuccess={() => {
            setReload((r) => !r);
            setResetUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
