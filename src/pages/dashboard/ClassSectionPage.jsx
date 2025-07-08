import { useEffect, useState } from "react";
import {
  getClassSections,
  deleteClassSection,
  getSubjectAssignmentsBySectionId,
} from "../../services/classSectionService";
import { getCurrentSemesters } from "../../services/semesterService";
import AddClassSectionModal from "../../components/classection/AddClassSectionModal";
import EditClassSectionModal from "../../components/classection/EditClassSectionModal";
import ViewSubjectAssignmentsModal from "../../components/classection/ViewSubjectAssignmentsModal";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

const ClassSectionPage = () => {
  const [sections, setSections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [reload, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYearLevel, setFilterYearLevel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingAssignments, setViewingAssignments] = useState(null);
  const [subjectAssignments, setSubjectAssignments] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const itemsPerPage = 100;

  const fetchData = async () => {
    try {
      const { data } = await getClassSections();
      setSections(data);
    } catch {
      toast.error("Failed to load sections.");
    }
  };

  const fetchCurrentSemester = async () => {
    try {
      const { data } = await getCurrentSemesters();
      if (data && data.length > 0) {
        setCurrentSemester(data[0]);
      }
    } catch {
      toast.error("Failed to load current semester.");
    }
  };

  useEffect(() => {
    fetchData();
    fetchCurrentSemester();
  }, [reload]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this section?")) return;
    try {
      await deleteClassSection(id);
      toast.success("Section deleted.");
      setReload((r) => !r);
    } catch {
      toast.error("Failed to delete section.");
    }
  };

  const handleViewAssignments = async (section) => {
    try {
      const { data } = await getSubjectAssignmentsBySectionId(section.id);
      setViewingAssignments(section);
      setSubjectAssignments(data);
    } catch {
      toast.error("Failed to load subject assignments.");
    }
  };

  const filtered = sections.filter((s) => {
    const matchesSearch =
      s.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.semesterLabel?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      filterCourse === "" ||
      s.collegeCourseName?.toLowerCase().includes(filterCourse.toLowerCase());

    const matchesYear =
      filterYearLevel === "" ||
      String(s.yearLevel).toLowerCase() === filterYearLevel.toLowerCase();

    return matchesSearch && matchesCourse && matchesYear;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      {/* ✅ Read-only Current Semester Display */}
      {currentSemester && (
        <div className="mb-4 p-4 bg-base-200 rounded shadow">
          <h3 className="text-lg font-semibold">
            Current Semester:{" "}
            <span className="font-normal">
              {currentSemester.name} ({currentSemester.schoolYearLabel})
            </span>
          </h3>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-semibold">Class Sections</h2>
        <AddClassSectionModal onSuccess={() => setReload((r) => !r)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by section or semester"
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <input
          type="text"
          placeholder="Filter by course"
          className="input input-bordered w-full"
          value={filterCourse}
          onChange={(e) => {
            setFilterCourse(e.target.value);
            setCurrentPage(1);
          }}
        />
        <input
          type="text"
          placeholder="Filter by year level (e.g., 1st Year)"
          className="input input-bordered w-full"
          value={filterYearLevel}
          onChange={(e) => {
            setFilterYearLevel(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="table w-full">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-700">
              <th>Section</th>
              <th>Year Level</th>
              <th>Course</th>
              <th>Semester</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No sections found.
                </td>
              </tr>
            ) : (
              paginated.map((s) => (
                <tr key={s.id}>
                  <td>{s.section}</td>
                  <td>{s.yearLevel}</td>
                  <td>{s.collegeCourseName}</td>
                  <td>
                    {s.semesterName} ({s.schoolYearLabel})
                  </td>
                  <td className="text-right space-x-2">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleViewAssignments(s)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setEditing(s)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(s.id)}
                    >
                      <FaTrash />
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
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`btn btn-sm ${
                currentPage === page ? "btn-primary" : "btn-outline"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {editing && (
        <EditClassSectionModal
          section={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            setReload((r) => !r);
          }}
        />
      )}

      {viewingAssignments && subjectAssignments && (
        <ViewSubjectAssignmentsModal
          isOpen={!!viewingAssignments}
          onClose={() => setViewingAssignments(null)}
          section={viewingAssignments}
          data={subjectAssignments}
        />
      )}
    </div>
  );
};

export default ClassSectionPage;
