// src/pages/dashboard/PendingApprovalsPage.jsx
import { useEffect, useState } from "react";
import {
  getPendingApprovals,
  approveUser,
  denyUser,
} from "../../services/userService";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { toast } from "sonner";
import ViewPendingUserModal from "../../components/user/ViewPendingUserModal";
import DenyUserModal from "../../components/user/DenyUserModal";

const PendingApprovalsPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingUser, setViewingUser] = useState(null);
  const [denyingUser, setDenyingUser] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const itemsPerPage = 10;

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const { data } = await getPendingApprovals();
      setPendingUsers(data);
    } catch (err) {
      console.error("Failed to load pending approvals:", err);
      toast.error("Failed to load pending registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId, fullName) => {
    if (!confirm(`Approve registration for ${fullName}?`)) return;

    setProcessingId(userId);
    try {
      await approveUser(userId);
      toast.success(`${fullName} has been approved and notified via email.`);
      fetchPendingUsers();
    } catch (err) {
      console.error("Approval failed:", err);
      toast.error("Failed to approve user.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDenySubmit = async (userId, reason) => {
    setProcessingId(userId);
    try {
      await denyUser(userId, reason);
      toast.success(
        "User registration has been denied and notified via email."
      );
      setDenyingUser(null);
      fetchPendingUsers();
    } catch (err) {
      console.error("Denial failed:", err);
      toast.error("Failed to deny user.");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = pendingUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.employeeID || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading pending registrations...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Pending Faculty Registrations
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve or deny faculty registration requests.
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email, or employee ID"
        className="input input-bordered mb-4 w-full md:w-1/3"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* Alert if no pending users */}
      {pendingUsers.length === 0 && (
        <div className="alert alert-info">
          <span>No pending registrations at this time.</span>
        </div>
      )}

      {/* Table */}
      {pendingUsers.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white shadow rounded">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-100 text-sm text-gray-700">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Employee ID</th>
                  <th>Roles</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No matching registrations found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.employeeID || "—"}</td>
                      <td>
                        <span className="badge badge-sm badge-ghost">
                          {user.roles.join(", ")}
                        </span>
                      </td>
                      <td className="text-center space-x-2">
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => setViewingUser(user)}
                          disabled={processingId === user.id}
                        >
                          <FaEye className="mr-1" /> View
                        </button>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleApprove(user.id, user.fullName)}
                          disabled={processingId === user.id}
                        >
                          {processingId === user.id ? (
                            "Processing..."
                          ) : (
                            <>
                              <FaCheck className="mr-1" /> Approve
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => setDenyingUser(user)}
                          disabled={processingId === user.id}
                        >
                          <FaTimes className="mr-1" /> Deny
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                className="btn btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn btn-sm ${
                      currentPage === page ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="btn btn-sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <ViewPendingUserModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}

      {/* Deny User Modal */}
      {denyingUser && (
        <DenyUserModal
          user={denyingUser}
          onClose={() => setDenyingUser(null)}
          onConfirm={handleDenySubmit}
          loading={processingId === denyingUser.id}
        />
      )}
    </div>
  );
};

export default PendingApprovalsPage;
