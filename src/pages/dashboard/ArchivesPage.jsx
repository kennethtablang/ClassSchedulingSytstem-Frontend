// src/pages/dashboard/ArchivesPage.jsx
import { useEffect, useState } from "react";
import {
  getArchivedSubjects,
  restoreSubject,
  deleteSubject,
} from "../../services/subjectService";
import {
  getArchivedUsers,
  toggleUserStatus,
  deleteUser,
} from "../../services/userService";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import { toast } from "sonner";

const ArchivesPage = () => {
  const [tab, setTab] = useState("subjects"); // "subjects" or "faculty"
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArchives = async () => {
    try {
      const subjectRes = await getArchivedSubjects();
      setSubjects(subjectRes.data);
    } catch {
      toast.error("Failed to load archived subjects.");
    }

    try {
      const facultyRes = await getArchivedUsers();
      setFaculty(facultyRes.data);
    } catch {
      toast.error("Failed to load archived faculty.");
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const handleRestoreSubject = async (id) => {
    try {
      await restoreSubject(id);
      toast.success("Subject restored.");
      fetchArchives();
    } catch {
      toast.error("Failed to restore subject.");
    }
  };

  const handleRestoreFaculty = async (id) => {
    try {
      await toggleUserStatus(id); // this reactivates the user
      toast.success("Faculty restored.");
      fetchArchives();
    } catch {
      toast.error("Failed to restore faculty.");
    }
  };

  const handlePermanentDelete = async () => {
    setIsDeleting(true);
    try {
      if (tab === "subjects") {
        await deleteSubject(deleteId);
        toast.success("Subject permanently deleted.");
      } else {
        await deleteUser(deleteId);
        toast.success("Faculty permanently deleted.");
      }
      fetchArchives();
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Archives</h2>

      {/* Tabs */}
      <div className="tabs mb-6">
        <button
          className={`tab ${tab === "subjects" ? "tab-active" : ""}`}
          onClick={() => setTab("subjects")}
        >
          Subjects
        </button>
        <button
          className={`tab ${tab === "faculty" ? "tab-active" : ""}`}
          onClick={() => setTab("faculty")}
        >
          Faculty
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="table w-full text-sm">
          <thead>
            {tab === "subjects" ? (
              <tr className="bg-gray-100 text-gray-700">
                <th>Code</th>
                <th>Title</th>
                <th>Year</th>
                <th>Course</th>
                <th className="text-right">Actions</th>
              </tr>
            ) : (
              <tr className="bg-gray-100 text-gray-700">
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th className="text-right">Actions</th>
              </tr>
            )}
          </thead>
          <tbody>
            {tab === "subjects" ? (
              subjects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No archived subjects.
                  </td>
                </tr>
              ) : (
                subjects.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td>{s.subjectCode}</td>
                    <td>{s.subjectTitle}</td>
                    <td>{s.yearLevel}</td>
                    <td>{s.collegeCourseName}</td>
                    <td className="text-right space-x-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleRestoreSubject(s.id)}
                      >
                        Restore
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => setDeleteId(s.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )
            ) : faculty.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No archived faculty.
                </td>
              </tr>
            ) : (
              faculty.map((u) => (
                <tr key={u.id} className="border-b">
                  <td>{`${u.firstName} ${u.lastName}`}</td>
                  <td>{u.email}</td>
                  <td>{u.roles.join(", ")}</td>
                  <td className="text-right space-x-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleRestoreFaculty(u.id)}
                    >
                      Restore
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => setDeleteId(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteId}
        title="Permanently Delete?"
        message="This cannot be undone. Proceed?"
        onConfirm={handlePermanentDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
      />
    </div>
  );
};

export default ArchivesPage;
