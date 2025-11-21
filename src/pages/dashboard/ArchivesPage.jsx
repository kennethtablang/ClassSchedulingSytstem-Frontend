import { useEffect, useState } from "react";
import {
  getArchivedSubjects,
  restoreSubject,
} from "../../services/subjectService";
import { getArchivedUsers, toggleUserStatus } from "../../services/userService";
import { toast } from "sonner";

const ArchivesPage = () => {
  const [tab, setTab] = useState("subjects");
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const extractApiErrorMessage = (err) => {
    if (!err) return "An unexpected error occurred.";

    const resp = err.response?.data ?? err.response ?? null;

    if (typeof resp === "string" && resp.trim().length > 0) return resp;

    const fallback = typeof err.message === "string" ? err.message : null;

    if (resp && typeof resp === "object") {
      if (resp.message) return resp.message;
      if (resp.Message) return resp.Message;
      if (resp.error) return resp.error;
      if (resp.title) return resp.title;

      if (resp.errors) {
        try {
          const arr = Object.values(resp.errors).flat();
          if (arr.length) return arr.join("; ");
        } catch {
          // ignore
        }
      }

      if (Array.isArray(resp) && resp.length) {
        const arr = resp.map((i) =>
          typeof i === "string" ? i : JSON.stringify(i)
        );
        return arr.join("; ");
      }

      if (resp.detail) return resp.detail;
      if (resp.Description) return resp.Description;
    }

    if (fallback) return fallback;
    return "Failed to perform operation. Please try again.";
  };

  const fetchArchives = async () => {
    try {
      const subjectRes = await getArchivedSubjects();
      setSubjects(subjectRes.data);
    } catch (err) {
      const message = extractApiErrorMessage(err);
      toast.error(message || "Failed to load archived subjects.");
    }

    try {
      const facultyRes = await getArchivedUsers();
      setFaculty(facultyRes.data);
    } catch (err) {
      const message = extractApiErrorMessage(err);
      toast.error(message || "Failed to load archived faculty.");
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const handleRestoreSubject = async (id) => {
    try {
      await restoreSubject(id);
      toast.success("Subject restored successfully.");
      fetchArchives();
    } catch (err) {
      const message = extractApiErrorMessage(err);

      // ✅ Show detailed error message from backend
      if (message.includes("Cannot restore")) {
        toast.error(message, {
          duration: 6000, // Show longer for important messages
        });
      } else {
        toast.error(message || "Failed to restore subject.");
      }
    }
  };

  const handleRestoreFaculty = async (id) => {
    try {
      await toggleUserStatus(id);
      toast.success("Faculty restored successfully.");
      fetchArchives();
    } catch (err) {
      const message = extractApiErrorMessage(err);
      toast.error(message || "Failed to restore faculty.");
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
                    <td className="flex items-center gap-2">
                      {s.color && (
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: s.color }}
                        ></span>
                      )}
                      {s.subjectTitle}
                    </td>
                    <td>{s.yearLevel}</td>
                    <td>{s.collegeCourseName}</td>
                    <td className="text-right space-x-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleRestoreSubject(s.id)}
                      >
                        Restore
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchivesPage;
